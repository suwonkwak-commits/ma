import { CURRENCIES, REALMS, REBIRTH_REALM, REGIONS, TECHNIQUES } from './content.ts';
export type { Technique, Region } from './content.ts';
export { REBIRTH_REALM } from './content.ts';

export type GameEvent = {
  id: number;
  text: string;
  tone: 'normal' | 'good' | 'danger';
};

export type GameState = {
  version: 2;
  name: string;
  realm: number;
  cultivation: number;
  gold: number;
  /** Earned premium currency; purchases are not implemented by the local prototype. */
  jade: number;
  rebirthCount: number;
  totalJadeEarned: number;
  /** Actual gains in this life, including resources that have already been spent. */
  runCultivation: number;
  runGold: number;
  merit: number;
  lifetimeBattleWins: number;
  highestRealm: number;
  hp: number;
  techniqueLevels: Record<string, number>;
  equippedTechnique: string;
  mode: 'training' | 'expedition';
  regionId: string;
  enemyHp: number;
  battleWins: number;
  defeats: number;
  lastTick: number;
  logs: GameEvent[];
  /** Rewards are applied exactly once before this summary is displayed. */
  offlineReward: null | { seconds: number; cultivation: number; gold: number };
};

export const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
const MAX_VALUE = 1_000_000_000_000;
const MAX_TECHNIQUE_LEVEL = 30;
const LOG_LIMIT = 24;
const TURN_MS = 2_000;

function safeNow(now: number): number {
  return Number.isFinite(now) && now >= 0 ? now : 0;
}

function bounded(value: unknown, fallback = 0, maximum = MAX_VALUE): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(maximum, Math.max(0, value))
    : fallback;
}

function appendLog(state: GameState, text: string, tone: GameEvent['tone'] = 'normal'): GameState {
  const nextId = (state.logs.at(-1)?.id ?? 0) + 1;
  return { ...state, logs: [...state.logs, { id: nextId, text, tone }].slice(-LOG_LIMIT) };
}

export function createInitialState(now: number): GameState {
  return {
    version: 2,
    name: '이름 없는 협객',
    realm: 0,
    cultivation: 0,
    gold: 150,
    jade: 0,
    rebirthCount: 0,
    totalJadeEarned: 0,
    runCultivation: 0,
    runGold: 0,
    merit: 0,
    lifetimeBattleWins: 0,
    highestRealm: 0,
    hp: 110,
    techniqueLevels: { 'fog-sword': 1, 'river-heart': 0, 'swallow-step': 0, 'stone-fist': 0 },
    equippedTechnique: 'fog-sword',
    mode: 'training',
    regionId: REGIONS[0]!.id,
    enemyHp: REGIONS[0]!.enemyHp,
    battleWins: 0,
    defeats: 0,
    lastTick: safeNow(now),
    logs: [{ id: 1, text: '청죽림에 첫발을 내디뎠다. 당신의 강호가 시작된다.', tone: 'normal' }],
    offlineReward: null,
  };
}

export function getStats(state: GameState) {
  const sword = state.techniqueLevels['fog-sword'] ?? 0;
  const heart = state.techniqueLevels['river-heart'] ?? 0;
  const step = state.techniqueLevels['swallow-step'] ?? 0;
  const fist = state.techniqueLevels['stone-fist'] ?? 0;
  const active = state.techniqueLevels[state.equippedTechnique] ?? 0;
  const attack = 17 + state.realm * 9 + sword * 2 + fist * 3 + active * 5;
  const defense = 3 + state.realm * 4 + step * 3 + heart;
  const maxHp = 110 + state.realm * 35 + heart * 12 + fist * 4;
  const cultivationPerSecond = 1.2 + state.realm * 0.4 + heart * 0.35;
  return { attack, defense, maxHp, power: attack * 4 + defense * 3 + maxHp, cultivationPerSecond };
}

export function getRealmProgress(state: GameState) {
  const required = REALMS[state.realm + 1]?.threshold ?? 0;
  return { current: state.cultivation, required, ratio: required === 0 ? 1 : Math.min(1, state.cultivation / required) };
}

export function getUpgradeCost(state: GameState, id: string): number {
  const technique = TECHNIQUES.find((entry) => entry.id === id);
  if (!technique) return Infinity;
  return Math.ceil(technique.baseCost * 1.55 ** (state.techniqueLevels[id] ?? 0));
}

/** Manual practice supplements passive growth and is useful during the first minute. */
export function train(state: GameState): GameState {
  if (state.mode !== 'training') return state;
  const gain = Math.min(MAX_VALUE - state.cultivation, 12 + state.realm * 3);
  return {
    ...state,
    cultivation: state.cultivation + gain,
    runCultivation: Math.min(MAX_VALUE, state.runCultivation + gain),
    hp: Math.min(getStats(state).maxHp, state.hp + 3),
  };
}

export function breakthrough(state: GameState): GameState {
  const progress = getRealmProgress(state);
  if (!progress.required || progress.current < progress.required) return state;
  const next = {
    ...state,
    realm: state.realm + 1,
    highestRealm: Math.max(state.highestRealm, state.realm + 1),
    cultivation: state.cultivation - progress.required,
    merit: Math.min(MAX_VALUE, state.merit + 10),
  };
  next.hp = getStats(next).maxHp;
  return appendLog(next, `${REALMS[next.realm]!.name}의 경지에 올랐다. 새로운 강호가 열린다.`, 'good');
}

export function upgradeTechnique(state: GameState, id: string): GameState {
  const technique = TECHNIQUES.find((entry) => entry.id === id);
  if (!technique || (state.techniqueLevels[id] ?? 0) >= MAX_TECHNIQUE_LEVEL) return state;
  const cost = getUpgradeCost(state, id);
  if (state.gold < cost) return state;
  const next = {
    ...state,
    gold: state.gold - cost,
    techniqueLevels: { ...state.techniqueLevels, [id]: (state.techniqueLevels[id] ?? 0) + 1 },
  };
  const gainedHp = getStats(next).maxHp - getStats(state).maxHp;
  next.hp = Math.min(getStats(next).maxHp, next.hp + gainedHp);
  return appendLog(next, `${technique.name} ${next.techniqueLevels[id]}성을 익혔다.`, 'good');
}

export function equipTechnique(state: GameState, id: string): GameState {
  const technique = TECHNIQUES.find((entry) => entry.id === id);
  if (!technique || !(state.techniqueLevels[id]! > 0) || id === state.equippedTechnique) return state;
  return appendLog({ ...state, equippedTechnique: id }, `${technique.name}을 주력 무공으로 삼았다.`);
}

export function startExpedition(state: GameState, regionId: string): GameState {
  const region = REGIONS.find((entry) => entry.id === regionId);
  if (!region || region.requiredRealm > state.realm || state.hp <= 0) return state;
  if (state.mode === 'expedition' && state.regionId === regionId) return state;
  return appendLog(
    { ...state, mode: 'expedition', regionId, enemyHp: region.enemyHp },
    `${region.name}에 들어섰다. ${region.enemyName}과 마주쳤다.`,
  );
}

export function returnToTraining(state: GameState): GameState {
  if (state.mode === 'training') return state;
  return appendLog({ ...state, mode: 'training' }, '숨을 고르고 운기조식에 든다.');
}

function applyOfflineGrowth(state: GameState, now: number, elapsedSeconds: number): GameState {
  const seconds = Math.min(MAX_OFFLINE_SECONDS, Math.max(0, elapsedSeconds));
  const cultivation = Math.min(MAX_VALUE - state.cultivation, seconds * getStats(state).cultivationPerSecond);
  const next: GameState = {
    ...state,
    mode: 'training',
    cultivation: state.cultivation + cultivation,
    runCultivation: Math.min(MAX_VALUE, state.runCultivation + cultivation),
    hp: Math.min(getStats(state).maxHp, state.hp + seconds * 4),
    lastTick: now,
    offlineReward: seconds >= 5 ? { seconds, cultivation, gold: 0 } : state.offlineReward,
  };
  return seconds >= 5
    ? appendLog(next, `자리를 비운 동안 운기조식으로 내공 ${Math.floor(cultivation).toLocaleString('ko-KR')}을 쌓았다.`, 'good')
    : next;
}

function battleTurn(state: GameState): GameState {
  const region = REGIONS.find((entry) => entry.id === state.regionId)!;
  const stats = getStats(state);
  const enemyHp = state.enemyHp - stats.attack;
  // The killing strike ends the exchange before the opponent can retaliate.
  if (enemyHp <= 0) {
    const gold = Math.min(MAX_VALUE - state.gold, region.rewardGold);
    const cultivation = Math.min(MAX_VALUE - state.cultivation, region.rewardCultivation);
    return appendLog(
      {
        ...state,
        enemyHp: region.enemyHp,
        hp: Math.min(stats.maxHp, state.hp + 8),
        battleWins: Math.min(MAX_VALUE, state.battleWins + 1),
        lifetimeBattleWins: Math.min(MAX_VALUE, state.lifetimeBattleWins + 1),
        gold: state.gold + gold,
        runGold: Math.min(MAX_VALUE, state.runGold + gold),
        cultivation: state.cultivation + cultivation,
        runCultivation: Math.min(MAX_VALUE, state.runCultivation + cultivation),
        merit: Math.min(MAX_VALUE, state.merit + 1),
      },
      `${region.enemyName}을 물리쳤다. ${CURRENCIES.gold.name} +${gold} · 내공 +${cultivation}`,
      'good',
    );
  }
  const hp = state.hp - Math.max(1, region.enemyAttack - stats.defense);
  if (hp <= 0) {
    return appendLog(
      { ...state, mode: 'training', hp: Math.ceil(stats.maxHp * 0.35), enemyHp: region.enemyHp, defeats: Math.min(MAX_VALUE, state.defeats + 1) },
      '상대의 기세에 밀려 물러났다. 안전한 곳에서 운기조식으로 회복한다.',
      'danger',
    );
  }
  return { ...state, enemyHp, hp };
}

export function advanceGame(state: GameState, now: number): GameState {
  now = safeNow(now);
  if (now <= state.lastTick) return state;
  const elapsedSeconds = (now - state.lastTick) / 1_000;
  // Suspended apps never replay thousands of battles. They resume at a safe rest point.
  if (elapsedSeconds > 60) return applyOfflineGrowth(state, now, elapsedSeconds);
  if (state.mode === 'training') {
    const gain = Math.min(MAX_VALUE - state.cultivation, elapsedSeconds * getStats(state).cultivationPerSecond);
    return {
      ...state,
      cultivation: state.cultivation + gain,
      runCultivation: Math.min(MAX_VALUE, state.runCultivation + gain),
      hp: Math.min(getStats(state).maxHp, state.hp + elapsedSeconds * 4),
      lastTick: now,
    };
  }
  const turns = Math.floor(now / TURN_MS) - Math.floor(state.lastTick / TURN_MS);
  let next = state;
  for (let turn = 0; turn < turns && next.mode === 'expedition'; turn++) next = battleTurn(next);
  return { ...next, lastTick: now };
}

/** Dismiss a summary; the reward is already in the saved balance. */
export function claimOfflineRewards(state: GameState): GameState {
  return state.offlineReward ? { ...state, offlineReward: null } : state;
}

export type RebirthPreview = {
  eligible: boolean;
  realmBonus: number;
  cultivationBonus: number;
  goldBonus: number;
  meritBonus: number;
  totalJade: number;
  runCultivation: number;
  runGold: number;
  merit: number;
};

/** A preview never mutates or consumes resources. Spent resources still count. */
export function getRebirthPreview(state: GameState): RebirthPreview {
  const validRealm = Number.isInteger(state.realm) && state.realm >= REBIRTH_REALM && state.realm < REALMS.length;
  const runCultivation = bounded(state.runCultivation);
  const runGold = bounded(state.runGold);
  const merit = Math.floor(bounded(state.merit));
  const realmBonus = validRealm ? [20, 30, 50, 80][state.realm - REBIRTH_REALM]! : 0;
  const cultivationBonus = Math.floor(Math.sqrt(runCultivation / 100));
  const goldBonus = Math.floor(Math.sqrt(runGold / 10));
  const meritBonus = Math.floor(merit / 10);
  const capacity = MAX_VALUE - bounded(state.jade);
  const eligible = validRealm && capacity > 0;
  const totalJade = eligible ? Math.min(capacity, realmBonus + cultivationBonus + goldBonus + meritBonus) : 0;
  return { eligible, realmBonus, cultivationBonus, goldBonus, meritBonus, totalJade, runCultivation, runGold, merit };
}

/** Claim exactly once by starting a new life below the eligibility threshold. */
export function rebirth(state: GameState, now: number): GameState {
  const preview = getRebirthPreview(state);
  if (!preview.eligible || preview.totalJade <= 0) return state;
  const next: GameState = {
    ...createInitialState(Math.max(safeNow(now), safeNow(state.lastTick))),
    name: state.name,
    jade: bounded(state.jade + preview.totalJade),
    rebirthCount: Math.min(MAX_VALUE, state.rebirthCount + 1),
    totalJadeEarned: Math.min(MAX_VALUE, state.totalJadeEarned + preview.totalJade),
    lifetimeBattleWins: state.lifetimeBattleWins,
    highestRealm: Math.max(state.highestRealm, state.realm),
    logs: state.logs,
  };
  return appendLog(next, `${REALMS[state.realm]!.name}에서 ${next.rebirthCount}번째 환생을 마쳤다. ${CURRENCIES.jade.name} +${preview.totalJade} · 삼류의 새 삶이 시작된다.`, 'good');
}

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function spentRealmCultivation(realm: number): number {
  return REALMS.slice(1, realm + 1).reduce((sum, entry) => sum + entry.threshold, 0);
}

function spentTechniqueGold(levels: Record<string, number>): number {
  let spent = 0;
  for (const technique of TECHNIQUES) {
    // The initial fog sword is a free technique, not an earned currency grant.
    const initialLevel = technique.id === 'fog-sword' ? 1 : 0;
    for (let level = initialLevel; level < (levels[technique.id] ?? 0); level++) {
      spent += Math.ceil(technique.baseCost * 1.55 ** level);
    }
  }
  return Math.min(MAX_VALUE, spent);
}

/** Treat local storage as untrusted: upgrades and future schema versions can change it. */
export function hydrateGameState(raw: unknown, now: number): GameState {
  now = safeNow(now);
  const initial = createInitialState(now);
  if (!object(raw) || (raw.version !== 1 && raw.version !== 2)) return initial;
  const legacy = raw.version === 1;
  const levels = Object.fromEntries(TECHNIQUES.map(({ id }) => [
    id, Math.floor(bounded(object(raw.techniqueLevels) ? raw.techniqueLevels[id] : undefined, initial.techniqueLevels[id], MAX_TECHNIQUE_LEVEL)),
  ]));
  // A save always has at least one usable technique.
  if (!Object.values(levels).some((level) => level > 0)) levels['fog-sword'] = 1;
  const equippedTechnique = typeof raw.equippedTechnique === 'string' && (levels[raw.equippedTechnique] ?? 0) > 0
    ? raw.equippedTechnique
    : TECHNIQUES.find(({ id }) => levels[id]! > 0)!.id;
  const realm = Math.floor(bounded(raw.realm, 0, legacy ? REBIRTH_REALM : REALMS.length - 1));
  const region = REGIONS.find((entry) => entry.id === raw.regionId && entry.requiredRealm <= realm) ?? REGIONS[0]!;
  const savedTime = typeof raw.lastTick === 'number' && Number.isFinite(raw.lastTick) && raw.lastTick >= 0
    ? Math.min(now, raw.lastTick)
    : now;
  const logs: GameEvent[] = Array.isArray(raw.logs)
    ? raw.logs.filter((entry): entry is Record<string, unknown> => object(entry))
      .filter((entry) => typeof entry.text === 'string' && ['normal', 'good', 'danger'].includes(String(entry.tone)))
      .slice(-LOG_LIMIT)
      .map((entry, index) => ({ id: index + 1, text: String(entry.text).replaceAll('은전', CURRENCIES.gold.name).slice(0, 240), tone: entry.tone as GameEvent['tone'] }))
    : initial.logs;
  const cultivation = bounded(raw.cultivation);
  const gold = bounded(legacy ? raw.silver : raw.gold, initial.gold);
  const battleWins = Math.floor(bounded(raw.battleWins));
  const minimumCultivation = Math.min(MAX_VALUE, cultivation + spentRealmCultivation(realm));
  const minimumGold = Math.min(MAX_VALUE, Math.max(0, gold + spentTechniqueGold(levels) - initial.gold));
  const minimumMerit = Math.min(MAX_VALUE, battleWins + realm * 10);
  const jade = legacy ? 0 : Math.floor(bounded(raw.jade));
  const state: GameState = {
    ...initial,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 24) : initial.name,
    realm,
    cultivation,
    gold,
    jade,
    rebirthCount: legacy ? 0 : Math.floor(bounded(raw.rebirthCount)),
    totalJadeEarned: legacy ? 0 : Math.max(jade, Math.floor(bounded(raw.totalJadeEarned))),
    runCultivation: legacy ? minimumCultivation : Math.max(minimumCultivation, bounded(raw.runCultivation)),
    runGold: legacy ? minimumGold : Math.max(minimumGold, bounded(raw.runGold)),
    merit: legacy ? minimumMerit : Math.max(minimumMerit, Math.floor(bounded(raw.merit))),
    lifetimeBattleWins: legacy ? battleWins : Math.max(battleWins, Math.floor(bounded(raw.lifetimeBattleWins))),
    highestRealm: legacy ? realm : Math.max(realm, Math.floor(bounded(raw.highestRealm, 0, REALMS.length - 1))),
    hp: bounded(raw.hp, initial.hp),
    techniqueLevels: levels,
    equippedTechnique,
    mode: raw.mode === 'expedition' ? 'expedition' : 'training',
    regionId: region.id,
    enemyHp: Math.max(1, bounded(raw.enemyHp, region.enemyHp, region.enemyHp)),
    battleWins,
    defeats: Math.floor(bounded(raw.defeats)),
    lastTick: savedTime,
    logs: logs.length ? logs : initial.logs,
    offlineReward: object(raw.offlineReward)
      ? {
        seconds: bounded(raw.offlineReward.seconds, 0, MAX_OFFLINE_SECONDS),
        cultivation: bounded(raw.offlineReward.cultivation),
        gold: bounded(legacy ? raw.offlineReward.silver : raw.offlineReward.gold),
      }
      : null,
  };
  state.hp = Math.min(getStats(state).maxHp, state.hp);
  const elapsedSeconds = (now - savedTime) / 1_000;
  // All cold starts return to safety, including saves taken in the middle of a duel.
  return applyOfflineGrowth(state, now, elapsedSeconds);
}
