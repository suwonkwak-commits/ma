import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRENCIES, REALMS, REBIRTH_REALM, REGIONS } from './content.ts';
import {
  MAX_OFFLINE_SECONDS, advanceGame, breakthrough, claimOfflineRewards, createInitialState,
  equipTechnique, getRealmProgress, getStats, getUpgradeCost, hydrateGameState,
  returnToTraining, startExpedition, train, upgradeTechnique, getRebirthPreview, rebirth,
} from './engine.ts';

test('passive growth is based on elapsed time and heals while training', () => {
  const initial = { ...createInitialState(0), hp: 50 };
  const next = advanceGame(initial, 10_000);
  assert.equal(next.cultivation, 12);
  assert.equal(next.hp, 90);
  assert.equal(initial.cultivation, 0, 'the engine does not mutate the saved input');
  assert.strictEqual(advanceGame(next, 5_000), next, 'a backwards clock never grants resources');
});

test('manual practice and breakthrough spend exactly the next realm cost', () => {
  let state = createInitialState(0);
  assert.strictEqual(breakthrough(state), state);
  for (let i = 0; i < 11; i++) state = train(state);
  assert.deepEqual(getRealmProgress(state), { current: 132, required: 120, ratio: 1 });
  state = breakthrough(state);
  assert.equal(state.realm, 1);
  assert.equal(state.cultivation, 12);
  assert.equal(state.hp, getStats(state).maxHp);
});

test('maximum realm cannot advance or spend cultivation', () => {
  const state = { ...createInitialState(0), realm: REALMS.length - 1, cultivation: 999_999 };
  assert.strictEqual(breakthrough(state), state);
  assert.equal(getRealmProgress(state).ratio, 1);
});

test('technique training respects costs, ownership and immutable state', () => {
  const state = createInitialState(0);
  assert.equal(getUpgradeCost(state, 'river-heart'), 100);
  const next = upgradeTechnique(state, 'river-heart');
  assert.equal(next.gold, 50);
  assert.equal(next.techniqueLevels['river-heart'], 1);
  assert.equal(state.techniqueLevels['river-heart'], 0);
  assert.ok(getStats(next).cultivationPerSecond > getStats(state).cultivationPerSecond);
  assert.strictEqual(upgradeTechnique(next, 'river-heart'), next, 'insufficient gold is rejected');
  assert.strictEqual(upgradeTechnique(state, 'missing'), state);
  assert.strictEqual(equipTechnique(state, 'swallow-step'), state, 'unlearned techniques cannot be equipped');
  assert.equal(equipTechnique(next, 'river-heart').equippedTechnique, 'river-heart');
});

test('regions unlock by realm and unknown destinations are rejected', () => {
  const state = createInitialState(0);
  assert.strictEqual(startExpedition(state, REGIONS[1]!.id), state);
  assert.strictEqual(startExpedition(state, 'missing'), state);
  const explorer = startExpedition({ ...state, realm: 1 }, REGIONS[1]!.id);
  assert.equal(explorer.mode, 'expedition');
  assert.equal(explorer.enemyHp, REGIONS[1]!.enemyHp);
  assert.equal(returnToTraining(explorer).mode, 'training');
  assert.strictEqual(train(explorer), explorer, 'manual training requires resting');
});

test('automatic combat awards gold and cultivation only on a kill', () => {
  const explorer = startExpedition(createInitialState(0), REGIONS[0]!.id);
  const firstTurn = advanceGame(explorer, 2_000);
  assert.equal(firstTurn.enemyHp, REGIONS[0]!.enemyHp - getStats(explorer).attack);
  assert.equal(firstTurn.battleWins, 0);
  const win = advanceGame(firstTurn, 6_000);
  assert.equal(win.battleWins, 1);
  assert.equal(win.gold, 150 + REGIONS[0]!.rewardGold);
  assert.equal(win.cultivation, REGIONS[0]!.rewardCultivation);
  assert.equal(win.enemyHp, REGIONS[0]!.enemyHp);
});

test('combat cadence survives updates shorter than a turn', () => {
  let state = startExpedition(createInitialState(0), REGIONS[0]!.id);
  state = advanceGame(state, 1_000);
  assert.equal(state.enemyHp, REGIONS[0]!.enemyHp);
  state = advanceGame(state, 2_000);
  assert.equal(state.enemyHp, REGIONS[0]!.enemyHp - getStats(state).attack);
});

test('defeat returns the player to safety without awarding a win', () => {
  const explorer = { ...startExpedition(createInitialState(0), REGIONS[0]!.id), hp: 1 };
  const next = advanceGame(explorer, 2_000);
  assert.equal(next.mode, 'training');
  assert.equal(next.defeats, 1);
  assert.equal(next.battleWins, 0);
  assert.equal(next.gold, explorer.gold);
  assert.ok(next.hp > 0);
  assert.equal(next.logs.at(-1)?.tone, 'danger');
});

test('offline growth is capped at eight hours and never replays combat', () => {
  const explorer = startExpedition(createInitialState(0), REGIONS[0]!.id);
  const next = advanceGame(explorer, 24 * 60 * 60 * 1_000);
  assert.equal(next.offlineReward?.seconds, MAX_OFFLINE_SECONDS);
  assert.equal(next.cultivation, MAX_OFFLINE_SECONDS * getStats(explorer).cultivationPerSecond);
  assert.equal(next.mode, 'training');
  assert.equal(next.battleWins, 0);
  assert.equal(next.lastTick, 24 * 60 * 60 * 1_000);
});

test('offline summary dismissal never grants the reward twice', () => {
  const resumed = hydrateGameState(createInitialState(0), 600_000);
  assert.equal(resumed.offlineReward?.cultivation, 720);
  const claimed = claimOfflineRewards(resumed);
  assert.equal(claimed.cultivation, resumed.cultivation);
  assert.equal(claimed.offlineReward, null);
  assert.strictEqual(claimOfflineRewards(claimed), claimed);
  const restoredAgain = hydrateGameState(claimed, 600_000);
  assert.equal(restoredAgain.cultivation, claimed.cultivation);
});

test('save restoration rejects invalid root and unsupported schema versions', () => {
  for (const raw of [null, [], 'bad', { version: 999 }]) {
    assert.deepEqual(hydrateGameState(raw, 10_000), createInitialState(10_000));
  }
});

test('save restoration sanitizes corrupt resources, realm, techniques and logs', () => {
  const state = hydrateGameState({
    version: 2, realm: 999, cultivation: NaN, gold: -4, hp: Infinity,
    techniqueLevels: { 'fog-sword': -1, 'river-heart': Infinity, 'swallow-step': 3.8, unknown: 900 },
    equippedTechnique: 'unknown', regionId: 'missing', lastTick: 999_999,
    logs: [null, { text: 'invalid tone', tone: 'html' }, { text: 'safe', tone: 'good', id: Infinity }],
  }, 10_000);
  assert.equal(state.realm, REALMS.length - 1);
  assert.equal(state.cultivation, 0);
  assert.equal(state.gold, 0);
  assert.equal(state.techniqueLevels['swallow-step'], 3);
  assert.equal(state.techniqueLevels.unknown, undefined);
  assert.equal(state.equippedTechnique, 'swallow-step');
  assert.equal(state.regionId, REGIONS[0]!.id);
  assert.equal(state.lastTick, 10_000);
  assert.deepEqual(state.logs, [{ text: 'safe', tone: 'good', id: 1 }]);
  assert.equal(state.offlineReward, null, 'a future timestamp does not grant offline growth');
});

test('cold starts during expeditions return to rest and preserve valid progress', () => {
  const state = { ...startExpedition(createInitialState(20_000), REGIONS[0]!.id), gold: 246, battleWins: 4 };
  const restored = hydrateGameState(JSON.parse(JSON.stringify(state)), 20_000);
  assert.equal(restored.gold, 246);
  assert.equal(restored.battleWins, 4);
  assert.equal(restored.mode, 'training');
  assert.equal(restored.offlineReward, null);
});

test('invalid timestamps cannot manufacture offline time', () => {
  for (const lastTick of [-1, NaN, Infinity, '0', undefined]) {
    const restored = hydrateGameState({ ...createInitialState(0), lastTick }, 999_999_999);
    assert.equal(restored.cultivation, 0);
    assert.equal(restored.offlineReward, null);
    assert.equal(restored.lastTick, 999_999_999);
  }
});

test('a repeated resume only accrues time since the previous resume', () => {
  const first = hydrateGameState(createInitialState(0), 10_000_000_000);
  const again = hydrateGameState(first, 10_000_000_000);
  assert.equal(again.cultivation, first.cultivation);
  const later = hydrateGameState(again, 10_000_010_000);
  assert.equal(later.cultivation - first.cultivation, 12);
});

test('technique levels stop at the supported cap', () => {
  const state = { ...createInitialState(0), gold: 1e12, techniqueLevels: { 'fog-sword': 30 } };
  assert.strictEqual(upgradeTechnique(state, 'fog-sword'), state);
});

test('event history is bounded during long active sessions', () => {
  let state = { ...createInitialState(0), gold: 1_000_000 };
  for (let i = 0; i < 29; i++) state = upgradeTechnique(state, 'fog-sword');
  assert.ok(state.logs.length <= 24);
  assert.equal(new Set(state.logs.map((entry) => entry.id)).size, state.logs.length);
});

test('all nine requested realms unlock in order through nature realm', () => {
  assert.deepEqual(REALMS.map(entry => entry.name), ['삼류', '이류', '일류', '절정', '초절정', '화경', '현경', '생사경', '자연경']);
  assert.deepEqual(REALMS.slice(5).map(entry => entry.hanja), ['化境', '玄境', '生死境', '自然境']);
  const total = REALMS.slice(1).reduce((sum, entry) => sum + entry.threshold, 0);
  let state = { ...createInitialState(0), cultivation: total, runCultivation: total };
  for (let realm = 1; realm < REALMS.length; realm++) {
    state = breakthrough(state);
    assert.equal(state.realm, realm);
    assert.equal(state.highestRealm, realm);
    assert.equal(state.merit, realm * 10);
  }
  assert.equal(state.cultivation, 0);
  assert.equal(state.runCultivation, total, 'spent breakthrough resources remain in this life’s earnings');
  assert.strictEqual(breakthrough(state), state);
});

test('every actual cultivation and gold gain is included in this life’s earnings', () => {
  const initial = createInitialState(0);
  assert.equal(initial.runGold, 0, 'starter gold is not an earned reward');
  const manual = train(initial);
  assert.equal(manual.runCultivation, manual.cultivation);
  const passive = advanceGame(manual, 10_000);
  assert.equal(passive.runCultivation, 24);
  const offline = hydrateGameState(passive, 610_000);
  assert.equal(offline.runCultivation, offline.cultivation);
  assert.equal(offline.runGold, 0);
  const win = advanceGame(startExpedition(initial, REGIONS[0]!.id), 6_000);
  assert.equal(win.runGold, REGIONS[0]!.rewardGold);
  assert.equal(win.runCultivation, REGIONS[0]!.rewardCultivation);
  assert.equal(win.merit, 1);
  assert.equal(win.lifetimeBattleWins, 1);
});

test('gain counters record actual credited resources at their balance limits', () => {
  const cap = 1e12;
  const manual = train({ ...createInitialState(0), cultivation: cap - 3, runCultivation: 0 });
  assert.equal(manual.cultivation, cap);
  assert.equal(manual.runCultivation, 3);
  const passive = advanceGame({ ...createInitialState(0), cultivation: cap - 2 }, 10_000);
  assert.equal(passive.runCultivation, 2);
  const win = advanceGame({
    ...startExpedition(createInitialState(0), REGIONS[0]!.id),
    gold: cap - 4, cultivation: cap - 5,
  }, 6_000);
  assert.equal(win.gold, cap);
  assert.equal(win.runGold, 4);
  assert.equal(win.cultivation, cap);
  assert.equal(win.runCultivation, 5);
});

test('legacy silver saves migrate without losing balances or counting free starter resources', () => {
  const initial = createInitialState(0);
  const { gold, ...withoutGold } = initial;
  const legacy = { ...withoutGold, version: 1, silver: gold, offlineReward: { seconds: 8, cultivation: 9, silver: 7 } };
  const migrated = hydrateGameState(legacy, 0);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.gold, 150);
  assert.equal(migrated.jade, 0);
  assert.equal(migrated.runGold, 0);
  assert.equal(migrated.runCultivation, 0);
  assert.equal(migrated.merit, 0);
  assert.equal(migrated.offlineReward?.gold, 7);
  assert.equal('silver' in migrated, false);
});

test('legacy migration recovers spent cultivation and technique gold once', () => {
  const restored = hydrateGameState({
    version: 1, realm: 2, cultivation: 37, silver: 50, battleWins: 12, lastTick: 0,
    techniqueLevels: { 'fog-sword': 2, 'river-heart': 1, 'swallow-step': 0, 'stone-fist': 0 },
    logs: [{ id: 1, text: '은전 +24', tone: 'good' }],
  }, 0);
  assert.equal(restored.runCultivation, 37 + 120 + 480);
  // Paid sword level1→2 costs124; learning the heart costs100; starter sword was free.
  assert.equal(restored.runGold, 50 + 124 + 100 - 150);
  assert.equal(restored.merit, 12 + 20);
  assert.equal(restored.lifetimeBattleWins, 12);
  assert.equal(restored.highestRealm, 2);
  assert.equal(restored.logs[0]!.text, '금자 +24');
  const twice = hydrateGameState(JSON.parse(JSON.stringify(restored)), 0);
  assert.equal(twice.runCultivation, restored.runCultivation);
  assert.equal(twice.runGold, restored.runGold);
  assert.equal(twice.merit, restored.merit);
});

test('rebirth remains locked before hwa realm regardless of saved wealth', () => {
  for (let realm = 0; realm < REBIRTH_REALM; realm++) {
    const state = { ...createInitialState(0), realm, runCultivation: 1e9, runGold: 1e9, merit: 1e9 };
    assert.equal(getRebirthPreview(state).eligible, false);
    assert.equal(getRebirthPreview(state).totalJade, 0);
    assert.strictEqual(rebirth(state, 10_000), state);
  }
});

test('rebirth preview transparently converts cumulative gains with diminishing returns', () => {
  const state = { ...createInitialState(0), realm: 5, runCultivation: 23_200, runGold: 350, merit: 70 };
  assert.deepEqual(getRebirthPreview(state), {
    eligible: true, realmBonus: 20, cultivationBonus: 15, goldBonus: 5, meritBonus: 7,
    totalJade: 47, runCultivation: 23_200, runGold: 350, merit: 70,
  });
  assert.deepEqual([5, 6, 7, 8].map(realm => getRebirthPreview({ ...state, realm }).realmBonus), [20, 30, 50, 80]);
  const spent = upgradeTechnique({ ...state, gold: 150 }, 'fog-sword');
  assert.equal(spent.gold, 26);
  assert.equal(getRebirthPreview(spent).totalJade, 47, 'spending earned currency does not reduce rebirth reward');
});

test('rebirth grants jade once, resets current life, and preserves permanent records', () => {
  const state = {
    ...createInitialState(40_000), name: '청운', realm: 5, highestRealm: 7,
    gold: 900, jade: 80, totalJadeEarned: 100, rebirthCount: 2,
    runCultivation: 23_200, runGold: 350, merit: 70, battleWins: 20, lifetimeBattleWins: 180,
    cultivation: 1000, techniqueLevels: { 'fog-sword': 4, 'river-heart': 3, 'swallow-step': 2, 'stone-fist': 1 },
    equippedTechnique: 'river-heart', mode: 'expedition' as const, regionId: REGIONS[3]!.id,
    defeats: 4, offlineReward: { seconds: 60, cultivation: 72, gold: 0 },
  };
  const next = rebirth(state, 50_000);
  assert.equal(next.jade, 127);
  assert.equal(next.totalJadeEarned, 147);
  assert.equal(next.rebirthCount, 3);
  assert.equal(next.name, '청운');
  assert.equal(next.highestRealm, 7);
  assert.equal(next.lifetimeBattleWins, 180);
  assert.equal(next.realm, 0);
  assert.equal(next.cultivation, 0);
  assert.equal(next.gold, 150);
  assert.equal(next.runCultivation, 0);
  assert.equal(next.runGold, 0);
  assert.equal(next.merit, 0);
  assert.equal(next.battleWins, 0);
  assert.equal(next.defeats, 0);
  assert.deepEqual(next.techniqueLevels, createInitialState(0).techniqueLevels);
  assert.equal(next.equippedTechnique, 'fog-sword');
  assert.equal(next.regionId, REGIONS[0]!.id);
  assert.equal(next.hp, 110);
  assert.equal(next.mode, 'training');
  assert.equal(next.lastTick, 50_000);
  assert.equal(next.offlineReward, null);
  assert.match(next.logs.at(-1)!.text, new RegExp(`${CURRENCIES.jade.name} \\+47`));
  assert.strictEqual(rebirth(next, 50_000), next, 'a rapid double confirm cannot claim again');
  assert.equal(state.jade, 80, 'the prior life is immutable');
});

test('restoring a new life never reuses prior-life wealth, merit or victories', () => {
  const state = {
    ...createInitialState(0), realm: 5, highestRealm: 8, lifetimeBattleWins: 400,
    battleWins: 100, runCultivation: 23_200, runGold: 350, merit: 150,
  };
  const born = rebirth(state, 1_000);
  const loaded = hydrateGameState(JSON.parse(JSON.stringify(born)), 1_000);
  assert.equal(loaded.runCultivation, 0);
  assert.equal(loaded.runGold, 0);
  assert.equal(loaded.merit, 0);
  assert.equal(loaded.highestRealm, 8);
  assert.equal(loaded.lifetimeBattleWins, 400);
  assert.equal(loaded.jade, born.jade);
  assert.strictEqual(rebirth(loaded, 1_000), loaded);
});

test('rebirth timestamp never moves backwards and creates no duplicate offline growth', () => {
  const state = { ...createInitialState(10_000), realm: 5, runCultivation: 22_200, merit: 50 };
  const next = rebirth(state, 2_000);
  assert.equal(next.lastTick, 10_000);
  assert.strictEqual(advanceGame(next, 9_000), next);
  assert.equal(hydrateGameState(next, 10_000).cultivation, 0);
});

test('corrupt new save fields are sanitized and missing earned counters recovered', () => {
  const state = hydrateGameState({
    ...createInitialState(0), realm: 5, cultivation: 100, gold: 500, battleWins: 3,
    jade: Infinity, rebirthCount: -20, totalJadeEarned: NaN,
    runCultivation: NaN, runGold: -100, merit: NaN, lifetimeBattleWins: -1, highestRealm: NaN,
  }, 0);
  assert.equal(state.jade, 0);
  assert.equal(state.rebirthCount, 0);
  assert.equal(state.totalJadeEarned, 0);
  assert.equal(state.runCultivation, 22_300);
  assert.equal(state.runGold, 350);
  assert.equal(state.merit, 53);
  assert.equal(state.lifetimeBattleWins, 3);
  assert.equal(state.highestRealm, 5);
  for (const value of Object.values(getRebirthPreview(state))) assert.notEqual(value, NaN);
});

test('jade wallet cap pays exactly the previewed amount and never consumes a full wallet life', () => {
  const state = { ...createInitialState(0), realm: 5, jade: 1e12 - 3, totalJadeEarned: 1e12 - 3 };
  const preview = getRebirthPreview(state);
  assert.equal(preview.totalJade, 3);
  assert.equal(rebirth(state, 1_000).jade - state.jade, preview.totalJade);
  const full = { ...state, jade: 1e12 };
  assert.equal(getRebirthPreview(full).eligible, false);
  assert.strictEqual(rebirth(full, 1_000), full);
});
