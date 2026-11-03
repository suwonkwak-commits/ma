import test from 'node:test';
import assert from 'node:assert/strict';
import { REALMS, REGIONS } from './content.ts';
import {
  MAX_OFFLINE_SECONDS, advanceGame, breakthrough, claimOfflineRewards, createInitialState,
  equipTechnique, getRealmProgress, getStats, getUpgradeCost, hydrateGameState,
  returnToTraining, startExpedition, train, upgradeTechnique,
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
  assert.equal(next.silver, 50);
  assert.equal(next.techniqueLevels['river-heart'], 1);
  assert.equal(state.techniqueLevels['river-heart'], 0);
  assert.ok(getStats(next).cultivationPerSecond > getStats(state).cultivationPerSecond);
  assert.strictEqual(upgradeTechnique(next, 'river-heart'), next, 'insufficient silver is rejected');
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

test('automatic combat awards silver and cultivation only on a kill', () => {
  const explorer = startExpedition(createInitialState(0), REGIONS[0]!.id);
  const firstTurn = advanceGame(explorer, 2_000);
  assert.equal(firstTurn.enemyHp, REGIONS[0]!.enemyHp - getStats(explorer).attack);
  assert.equal(firstTurn.battleWins, 0);
  const win = advanceGame(firstTurn, 6_000);
  assert.equal(win.battleWins, 1);
  assert.equal(win.silver, 150 + REGIONS[0]!.rewardSilver);
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
  assert.equal(next.silver, explorer.silver);
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
  for (const raw of [null, [], 'bad', { version: 2 }]) {
    assert.deepEqual(hydrateGameState(raw, 10_000), createInitialState(10_000));
  }
});

test('save restoration sanitizes corrupt resources, realm, techniques and logs', () => {
  const state = hydrateGameState({
    version: 1, realm: 999, cultivation: NaN, silver: -4, hp: Infinity,
    techniqueLevels: { 'fog-sword': -1, 'river-heart': Infinity, 'swallow-step': 3.8, unknown: 900 },
    equippedTechnique: 'unknown', regionId: 'missing', lastTick: 999_999,
    logs: [null, { text: 'invalid tone', tone: 'html' }, { text: 'safe', tone: 'good', id: Infinity }],
  }, 10_000);
  assert.equal(state.realm, REALMS.length - 1);
  assert.equal(state.cultivation, 0);
  assert.equal(state.silver, 0);
  assert.equal(state.techniqueLevels['swallow-step'], 3);
  assert.equal(state.techniqueLevels.unknown, undefined);
  assert.equal(state.equippedTechnique, 'swallow-step');
  assert.equal(state.regionId, REGIONS[0]!.id);
  assert.equal(state.lastTick, 10_000);
  assert.deepEqual(state.logs, [{ text: 'safe', tone: 'good', id: 1 }]);
  assert.equal(state.offlineReward, null, 'a future timestamp does not grant offline growth');
});

test('cold starts during expeditions return to rest and preserve valid progress', () => {
  const state = { ...startExpedition(createInitialState(20_000), REGIONS[0]!.id), silver: 246, battleWins: 4 };
  const restored = hydrateGameState(JSON.parse(JSON.stringify(state)), 20_000);
  assert.equal(restored.silver, 246);
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
  const state = { ...createInitialState(0), silver: 1e12, techniqueLevels: { 'fog-sword': 30 } };
  assert.strictEqual(upgradeTechnique(state, 'fog-sword'), state);
});

test('event history is bounded during long active sessions', () => {
  let state = { ...createInitialState(0), silver: 1_000_000 };
  for (let i = 0; i < 29; i++) state = upgradeTechnique(state, 'fog-sword');
  assert.ok(state.logs.length <= 24);
  assert.equal(new Set(state.logs.map((entry) => entry.id)).size, state.logs.length);
});
