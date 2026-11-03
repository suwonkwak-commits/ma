import { test, expect, type Page } from '@playwright/test';
import { createInitialState } from '../src/game/engine';

const KEY = '@murim-chronicles/game-v1';
const readSave = (page: Page) => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null'), KEY);

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

test('technique learning deducts silver, enables equip and survives restart', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: '무공', exact: true }).click();
  await expect(page.getByRole('button', { name: '유수심법 운용', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '유수심법 수련', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.silver).toBe(50);
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
  expect(won.silver).toBeGreaterThanOrEqual(174);
  await page.getByRole('button', { name: '탐험 종료하고 수련으로 돌아가기', exact: true }).click();
  await expect.poll(async () => (await readSave(page))?.mode).toBe('training');
  await page.getByRole('tab', { name: '여록', exact: true }).click();
  await expect(page.getByText('길목의 산적을 물리쳤다. 은전 +24 · 내공 +20', { exact: true }).first()).toBeVisible();
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
  await expect.poll(async () => (await readSave(page))?.silver).toBe(150);
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
  const saved = { ...createInitialState(Date.now()), silver: 777, realm: 2 };
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
  expect((await readSave(page)).silver).toBe(777);
  expect((await readSave(page)).realm).toBe(2);
});
