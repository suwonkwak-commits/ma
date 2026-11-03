import { test, expect, type Page } from '@playwright/test';
import { createInitialState } from '../src/game/engine';

const KEY = '@murim-chronicles/game-v1';
const readSave = (page: Page) => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null'), KEY);

async function seedSave(page: Page, data: Record<string, unknown>) {
  await page.addInitScript(({ key, data }) => {
    if (!sessionStorage.getItem('rebirth-fixture-seeded')) {
      localStorage.setItem(key, JSON.stringify({ ...data, lastTick: Date.now() }));
      sessionStorage.setItem('rebirth-fixture-seeded', 'yes');
    }
  }, { key: KEY, data });
}

test('manual cultivation, breakthrough and region unlock persist after reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: '경지 돌파', exact: true })).toBeDisabled();
  const train = page.getByRole('button', { name: '호흡 가다듬기', exact: true });
  for (let i = 0; i < 10; i++) await train.click();
  await page.getByRole('button', { name: '경지 돌파', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.realm).toBe(1);
  await page.getByRole('tab', { name: '강호', exact: true }).click();
  await expect(page.getByRole('button', { name: '운하 나루 탐험', exact: true })).toBeEnabled();
  await page.reload();
  await expect(page.getByRole('button', { name: '호흡 가다듬기', exact: true })).toBeVisible();
  await expect.poll(async () => (await readSave(page))?.realm).toBe(1);
});

test('technique learning deducts gold, enables equip and survives restart', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: '무공', exact: true }).click();
  await expect(page.getByRole('button', { name: '유수심법 운용', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '유수심법 수련', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.gold).toBe(50);
  await page.getByRole('button', { name: '유수심법 운용', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.equippedTechnique).toBe('river-heart');
  await page.reload();
  await page.getByRole('tab', { name: '무공', exact: true }).click();
  await expect(page.getByRole('button', { name: '유수심법 운용', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '유수심법 강화', exact: true })).toBeDisabled();
});

test('automatic combat awards a real victory and stops when returned to training', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: '강호', exact: true }).click();
  await expect(page.getByRole('button', { name: '운하 나루 탐험', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '청죽림 탐험', exact: true }).click();
  await expect(page.getByText('交戰 · 자동 전투 진행 중')).toBeVisible();
  await expect.poll(async () => (await readSave(page))?.battleWins, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  const won = await readSave(page);
  expect(won.gold).toBeGreaterThanOrEqual(174);
  await page.getByRole('button', { name: '탐험 종료하고 수련으로 돌아가기', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.mode).toBe('training');
  await page.getByRole('tab', { name: '여록', exact: true }).click();
  await expect(page.getByText('길목의 산적을 물리쳤다. 금자 +24 · 내공 +20', { exact: true }).first()).toBeVisible();
});

test('offline reward is capped, restored and acknowledged without double payout', async ({ page }) => {
  const saved = createInitialState(Date.now() - 12 * 60 * 60 * 1000);
  await page.addInitScript(({ key, data }) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key, JSON.stringify(data));
      sessionStorage.setItem('seeded', 'yes');
    }
  }, { key: KEY, data: saved });
  await page.goto('/');
  await expect(page.getByText('고요 속에서도, 성장', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '오프라인 보상 확인', exact: true }).click();
  const first = await readSave(page);
  expect(first.cultivation).toBeGreaterThanOrEqual(34560);
  expect(first.cultivation).toBeLessThan(34580);
  expect(first.offlineReward).toBeNull();
  await page.reload();
  await expect(page.getByRole('button', { name: '호흡 가다듬기', exact: true })).toBeVisible();
  // A new real-time tick may accrue, but the twelve-hour payout must never repeat.
  await expect.poll(async () => (await readSave(page))?.cultivation).toBeLessThan(34600);
});

test('guide and reset require an explicit confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '호흡 가다듬기', exact: true }).click();
  await page.getByRole('button', { name: '게임 안내', exact: true }).click();
  await expect(page.getByText('한 걸음씩, 나의 강호', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  await page.getByRole('button', { name: '설정', exact: true }).click();
  await page.getByRole('button', { name: '모든 수련 기록 초기화', exact: true }).click();
  await page.getByRole('button', { name: '기록 유지하기', exact: true }).click();
  expect((await readSave(page)).cultivation).toBeGreaterThanOrEqual(12);
  await page.getByRole('button', { name: '모든 수련 기록 초기화', exact: true }).click();
  await page.getByRole('button', { name: '기록을 지우고 다시 시작', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.gold).toBe(150);
  expect((await readSave(page)).cultivation).toBeLessThan(12);
});

test('all screens render without script errors or horizontal overflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  for (const tab of ['수련', '강호', '무공', '여록']) {
    await page.getByRole('tab', { name: tab, exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('tab', { name: '수련', exact: true }).click();
  await expect(page.getByRole('button', { name: '호흡 가다듬기', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: `test-results/${test.info().project.name}-training.png`, fullPage: true });
  if (test.info().project.name === 'mobile') {
    await page.setViewportSize({ width: 360, height: 780 });
    for (const name of ['수련', '강호', '무공', '여록']) {
      await page.getByRole('tab', { name, exact: true }).click();
      const overflow = await page.getByRole('button').evaluateAll(buttons => buttons.some(button => {
        const rect = button.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
      }));
      expect(overflow).toBe(false);
    }
  }
});

test('a storage read failure never overwrites existing progress and can be retried', async ({ page }) => {
  const saved = { ...createInitialState(Date.now()), gold: 777, realm: 2 };
  await page.addInitScript(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
    const originalGet = Storage.prototype.getItem;
    const originalSet = Storage.prototype.setItem;
    (window as any).__failGameRead = true;
    (window as any).__gameWrites = 0;
    Storage.prototype.getItem = function (name) {
      if (name === key && (window as any).__failGameRead) throw new Error('simulated read failure');
      return originalGet.call(this, name);
    };
    Storage.prototype.setItem = function (name, value) {
      if (name === key) (window as any).__gameWrites++;
      return originalSet.call(this, name, value);
    };
  }, { key: KEY, data: saved });
  await page.goto('/');
  await expect(page.getByText('저장 기록을 불러오지 못했습니다.', { exact: true })).toBeVisible();
  // Wait beyond the autosave interval to prove failed reads cannot overwrite data.
  await page.waitForTimeout(3200);
  expect(await page.evaluate(() => (window as any).__gameWrites)).toBe(0);
  await page.evaluate(() => { (window as any).__failGameRead = false; });
  await page.getByRole('button', { name: '저장 기록 다시 불러오기', exact: true }).click();
  await expect(page.getByRole('button', { name: '호흡 가다듬기', exact: true })).toBeVisible();
  expect((await readSave(page)).gold).toBe(777);
  expect((await readSave(page)).realm).toBe(2);
});

test('bundled pixel font and persistent battlefield work while AUTO changes real game state', async ({ page }) => {
  await page.goto('/');
  const stage = page.getByTestId('battle-stage');
  await expect(stage).toBeVisible();
  expect(await page.evaluate(() => Array.from(document.fonts).some(face =>
    face.family.replace(/["']/g, '') === 'PixelKR' && face.status === 'loaded'
  ) && document.fonts.check('12px PixelKR', '무림여록'))).toBe(true);
  await page.getByRole('button', { name: '자동 전투 시작', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.mode).toBe('expedition');
  for (const tab of ['강호', '무공', '여록', '수련']) {
    await page.getByRole('tab', { name: tab, exact: true }).click();
    await expect(stage).toBeVisible();
    await expect(page.getByRole('button', { name: '자동 전투 중지', exact: true })).toBeVisible();
  }
  await page.screenshot({ path: `test-results/${test.info().project.name}-pixel-auto.png`, fullPage: true });
  await page.getByRole('button', { name: '자동 전투 중지', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.mode).toBe('training');
  await expect(page.getByRole('button', { name: '자동 전투 시작', exact: true })).toBeVisible();
});

test('pixel technique detail previews real growth and its upgrade persists', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: '무공', exact: true }).click();
  await page.getByRole('button', { name: '청무검법 상세 정보', exact: true }).click();
  await expect(page.getByText('다음 성장 · 2성', { exact: true })).toBeVisible();
  await expect(page.getByText('31', { exact: true })).toBeVisible();
  await page.screenshot({ path: `test-results/${test.info().project.name}-pixel-technique-detail.png`, fullPage: true });
  await page.getByRole('button', { name: '청무검법 상세 강화', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.techniqueLevels?.['fog-sword']).toBe(2);
  expect((await readSave(page)).gold).toBe(26);
  await expect(page.getByText('다음 성장 · 3성', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '무공 상세 닫기', exact: true }).click();
  await expect(page.getByText('2성', { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: `test-results/${test.info().project.name}-pixel-techniques.png`, fullPage: true });
  await page.reload();
  await page.getByRole('tab', { name: '무공', exact: true }).click();
  await page.getByRole('button', { name: '청무검법 상세 정보', exact: true }).click();
  await expect(page.getByText('제 2성', { exact: false })).toBeVisible();
  expect((await readSave(page)).gold).toBe(26);
});

test('legacy silver saves migrate to gold without losing realm or earned progression', async ({ page }) => {
  // A real v1 payload has no gold, jade, rebirth or cumulative-earned fields.
  await seedSave(page, {
    version: 1, name: '이어가는 협객', realm: 5, cultivation: 1000, silver: 777,
    hp: 110, techniqueLevels: { 'fog-sword': 1, 'river-heart': 0, 'swallow-step': 0, 'stone-fist': 0 },
    equippedTechnique: 'fog-sword', mode: 'training', regionId: 'bamboo-path',
    enemyHp: 56, battleWins: 20, defeats: 1, lastTick: 0,
    logs: [{ id: 1, text: '이전 강호의 기록', tone: 'normal' }], offlineReward: null,
  });
  await page.goto('/');
  const rebirth = page.getByRole('button', { name: '환생하기', exact: true });
  await rebirth.scrollIntoViewIfNeeded();
  await expect(rebirth).toBeEnabled();
  await expect.poll(async () => (await readSave(page))?.version).toBe(2);
  const migrated = await readSave(page);
  expect(migrated.gold).toBe(777);
  expect(migrated.realm).toBe(5);
  expect(migrated.jade).toBe(0);
  expect(migrated.runCultivation).toBeGreaterThanOrEqual(23200);
  expect(migrated.highestRealm).toBe(5);
  expect(migrated.lifetimeBattleWins).toBe(20);
  await page.reload();
  await expect(page.getByRole('button', { name: '환생하기', exact: true })).toBeEnabled();
  expect((await readSave(page)).gold).toBe(777);
});

test('rebirth requires Hwagyeong and canceling its preview preserves progress', async ({ page }) => {
  await page.goto('/');
  const rebirth = page.getByRole('button', { name: '환생하기', exact: true });
  await rebirth.scrollIntoViewIfNeeded();
  await expect(rebirth).toBeDisabled();
  await seedSave(page, {
    ...createInitialState(Date.now()), realm: 5, highestRealm: 5,
    cultivation: 1000, runCultivation: 23200, merit: 50, jade: 11, totalJadeEarned: 11,
  });
  await page.reload();
  await rebirth.scrollIntoViewIfNeeded();
  await expect(rebirth).toBeEnabled();
  await rebirth.click();
  await expect(page.getByTestId('rebirth-confirmation')).toBeVisible();
  await page.getByRole('button', { name: '환생 취소', exact: true }).click();
  await expect(page.getByTestId('rebirth-confirmation')).not.toBeVisible();
  await expect.poll(async () => (await readSave(page))?.realm).toBe(5);
  const kept = await readSave(page);
  expect(kept.jade).toBe(11);
  expect(kept.rebirthCount).toBe(0);
  expect(kept.cultivation).toBeGreaterThanOrEqual(1000);
});

test('rebirth converts earned resources once and preserves premium jade and lifetime records', async ({ page }) => {
  await seedSave(page, {
    ...createInitialState(Date.now()), realm: 5, highestRealm: 5, cultivation: 1000,
    gold: 500, runCultivation: 23200, runGold: 350, merit: 70,
    battleWins: 20, lifetimeBattleWins: 20, jade: 11, rebirthCount: 1, totalJadeEarned: 11,
  });
  await page.goto('/');
  // Spending gold on a technique must not reduce the earned-gold conversion.
  await page.getByRole('tab', { name: '무공', exact: true }).click();
  await page.getByRole('button', { name: '청무검법 강화', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.techniqueLevels?.['fog-sword']).toBe(2);
  expect((await readSave(page)).gold).toBe(376);
  await page.getByRole('tab', { name: '수련', exact: true }).click();
  await page.getByRole('button', { name: '환생하기', exact: true }).click();
  const confirmation = page.getByTestId('rebirth-confirmation');
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByLabel('환생 예상 보상 47 천옥', { exact: true })).toBeVisible();
  await page.screenshot({ path: `test-results/${test.info().project.name}-rebirth-preview.png`, fullPage: true });
  await page.getByRole('button', { name: '환생 확정', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.rebirthCount).toBe(2);
  const reborn = await readSave(page);
  expect(reborn.jade).toBe(58);
  expect(reborn.totalJadeEarned).toBe(58);
  expect(reborn.realm).toBe(0);
  expect(reborn.gold).toBe(150);
  expect(reborn.cultivation).toBeLessThan(12);
  expect(reborn.runGold).toBe(0);
  expect(reborn.merit).toBe(0);
  expect(reborn.battleWins).toBe(0);
  expect(reborn.lifetimeBattleWins).toBe(20);
  expect(reborn.highestRealm).toBe(5);
  expect(reborn.techniqueLevels['fog-sword']).toBe(1);
  await expect(page.getByRole('button', { name: '환생하기', exact: true })).toBeDisabled();
  await page.screenshot({ path: `test-results/${test.info().project.name}-rebirth-complete.png`, fullPage: true });
  await page.reload();
  await expect(page.getByRole('button', { name: '환생하기', exact: true })).toBeDisabled();
  expect((await readSave(page)).jade).toBe(58);
  expect((await readSave(page)).rebirthCount).toBe(2);
});

test('the prologue opens from the character screen, pages correctly and restarts when reopened', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '서막 읽기', exact: true }).click();
  const reader = page.getByTestId('story-reader');
  await expect(reader).toBeVisible();
  await expect(reader.getByLabel('서막 1쪽, 전체 5쪽', { exact: true })).toBeVisible();
  await expect(reader.getByRole('button', { name: '이전 이야기', exact: true })).toBeDisabled();
  await page.screenshot({ path: `test-results/${test.info().project.name}-story-prologue.png`, fullPage: true });
  for (let i = 0; i < 4; i++) await reader.getByRole('button', { name: '다음 이야기', exact: true }).click();
  await expect(reader.getByLabel('서막 5쪽, 전체 5쪽', { exact: true })).toBeVisible();
  await reader.getByRole('button', { name: '이전 이야기', exact: true }).click();
  await expect(reader.getByLabel('서막 4쪽, 전체 5쪽', { exact: true })).toBeVisible();
  await reader.getByRole('button', { name: '다음 이야기', exact: true }).click();
  await reader.getByRole('button', { name: '강호로 돌아가기', exact: true }).click();
  await expect(reader).not.toBeVisible();
  await page.getByRole('button', { name: '서막 읽기', exact: true }).click();
  await expect(reader.getByLabel('서막 1쪽, 전체 5쪽', { exact: true })).toBeVisible();
  await reader.getByRole('button', { name: '이야기 닫기', exact: true }).click();
  await expect(reader).not.toBeVisible();
});

test('campaign plans are readable from the menu without granting factions or changing saved wealth', async ({ page }) => {
  await seedSave(page, { ...createInitialState(Date.now()), gold: 777, jade: 11, totalJadeEarned: 11, realm: 5, highestRealm: 5 });
  await page.goto('/');
  await page.getByRole('button', { name: '설정', exact: true }).click();
  await page.getByRole('button', { name: '강호의 서사 읽기', exact: true }).click();
  const reader = page.getByTestId('story-reader');
  await expect(reader).toBeVisible();
  await reader.getByRole('button', { name: '이야기 문파', exact: true }).click();
  await expect(reader.getByText(/문파 영입·파견은 추가 예정입니다/)).toBeVisible();
  await expect(reader.getByText('01. 모용세가', { exact: true })).toBeVisible();
  await reader.getByText('07. 무당파', { exact: true }).scrollIntoViewIfNeeded();
  await expect(reader.getByText('07. 무당파', { exact: true })).toBeVisible();
  await reader.getByText(/16\. 마교/).scrollIntoViewIfNeeded();
  await expect(reader.getByText(/16\. 마교/)).toBeVisible();
  await page.screenshot({ path: `test-results/${test.info().project.name}-story-campaign.png`, fullPage: true });
  await reader.getByRole('button', { name: '이야기 세계관', exact: true }).click();
  await expect(reader.getByText('빼앗긴 강호의 질서', { exact: true })).toBeVisible();
  await reader.getByRole('button', { name: '이야기 환생', exact: true }).click();
  await expect(reader.getByText('실제 환생 조건과 현재 보상은 캐릭터의 환생 메뉴에서 확인할 수 있습니다.', { exact: true })).toBeVisible();
  await reader.getByRole('button', { name: '강호로 돌아가기', exact: true }).click();
  await expect(reader).not.toBeVisible();
  await expect.poll(async () => (await readSave(page))?.gold).toBe(777);
  const after = await readSave(page);
  expect(after.jade).toBe(11);
  expect(after.realm).toBe(5);
  expect(after.rebirthCount).toBe(0);
});
