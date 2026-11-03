import React, { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { CURRENCIES, REALMS, REBIRTH_REALM } from '../../game/content';
import { type GameState, getRebirthPreview } from '../../game/engine';
import { colors as C } from '../theme';
import { PixelButton, PixelIcon, PixelPanel, PixelText } from './primitives';

const fmt = (value: number) => Math.floor(value).toLocaleString('ko-KR');
const compact = (value: number) => value >= 100_000_000 ? `${(value / 100_000_000).toFixed(1)}억` : value >= 10_000 ? `${(value / 10_000).toFixed(1)}만` : fmt(value);

function realmName(index: number) {
  const item = REALMS[index] ?? REALMS[0];
  return 'hanja' in item && item.hanja ? `${item.name}(${item.hanja})` : item.name;
}

function RewardRow({ title, amount }: { title: string; amount: number }) {
  return <View style={s.between}><PixelText size={11} color={C.muted}>{title}</PixelText><PixelText size={12} color={C.jade}>+{fmt(amount)}</PixelText></View>;
}

export default function RebirthPanel({ state, onRebirth }: { state: GameState; onRebirth: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const submitted = useRef(false);
  const preview = getRebirthPreview(state);
  const jadeName = CURRENCIES.jade.name;
  const goldName = CURRENCIES.gold.name;
  const openConfirmation = () => {
    if (!preview.eligible) return;
    submitted.current = false;
    setConfirming(true);
  };
  const confirm = () => {
    if (submitted.current || !getRebirthPreview(state).eligible) return;
    submitted.current = true;
    setConfirming(false);
    onRebirth();
  };

  return <View testID="rebirth-panel" style={{ gap: 7 }}>
    <PixelPanel title="환생 · 다시 걷는 강호" right={<PixelText size={10} color={C.gold}>{fmt(state.rebirthCount)}회</PixelText>}>
      <View style={s.balanceRow}>
        <View style={s.balance}><View style={s.inline}><PixelIcon name="coin" size={14} /><PixelText size={10} color={C.muted}>{goldName}</PixelText></View><PixelText size={15} color={C.gold}>{compact(state.gold)}</PixelText></View>
        <View style={s.balance}><View style={s.inline}><PixelIcon name="jade" size={14} /><PixelText size={10} color={C.muted}>{jadeName}</PixelText></View><PixelText size={15} color={C.blue}>{compact(state.jade)}</PixelText></View>
        <View style={s.balance}><View style={s.inline}><PixelIcon name="star" size={14} /><PixelText size={10} color={C.muted}>공적</PixelText></View><PixelText size={15} color={C.text}>{compact(state.merit)}</PixelText></View>
      </View>
      <PixelText size={11} color={preview.eligible ? C.jade : C.muted}>{preview.eligible ? `${realmName(state.realm)} · 환생할 수 있습니다.` : `${realmName(REBIRTH_REALM)}부터 환생할 수 있습니다.`}</PixelText>
      <View style={s.realmGrid}>{REALMS.map((item, index) => <View key={item.name} accessibilityLabel={realmName(index)} style={[s.realmChip, index === state.realm && s.realmCurrent, index >= REBIRTH_REALM && { borderTopColor: '#8e7c4c' }]}>
        <PixelText size={11} color={index === state.realm ? C.gold : index <= state.highestRealm ? C.text : C.dim}>{item.name}</PixelText>
        <PixelText size={9} color={index === state.realm ? C.gold : C.dim}>{'hanja' in item && item.hanja ? item.hanja : index < state.realm ? '지나온 경지' : index === state.realm ? '현재 경지' : '다음 수련'}</PixelText>
      </View>)}</View>
      <View style={s.inputBox}>
        <View style={s.between}><PixelText size={10} color={C.muted}>이번 생 누적 내공</PixelText><PixelText size={11}>{fmt(preview.runCultivation)}</PixelText></View>
        <View style={s.between}><PixelText size={10} color={C.muted}>이번 생 획득 {goldName}</PixelText><PixelText size={11}>{fmt(preview.runGold)}</PixelText></View>
        <PixelText size={10} color={C.dim}>돌파·강화에 사용한 내공과 {goldName}도 누적 획득량에 포함됩니다. 새출발 지원금은 제외합니다.</PixelText>
      </View>
      <View style={s.rewardBox}>
        <PixelText size={12} color={C.gold}>현재 환생 예상 보상</PixelText>
        {preview.eligible ? <>
          <RewardRow title={`${realmName(state.realm)} 경지 보상`} amount={preview.realmBonus} />
          <RewardRow title="누적 내공 환산" amount={preview.cultivationBonus} />
          <RewardRow title={`누적 ${goldName} 환산`} amount={preview.goldBonus} />
          <RewardRow title="공적 환산" amount={preview.meritBonus} />
          <View style={s.totalReward}><PixelIcon name="jade" size={20} /><PixelText size={20} color={C.blue} accessibilityLabel={`환생 예상 보상 ${fmt(preview.totalJade)} ${jadeName}`}>+{fmt(preview.totalJade)} {jadeName}</PixelText></View>
        </> : <PixelText size={11} color={C.muted}>화경에 도달하면 누적 내공·{goldName}·공적의 환산 보상을 확인할 수 있습니다.</PixelText>}
      </View>
      <PixelButton label="환생" accessibilityLabel="환생하기" tone="gold" disabled={!preview.eligible} onPress={openConfirmation} icon={<PixelIcon name="jade" size={17} />} />
      <PixelText size={10} color={C.dim}>역대 최고 {realmName(state.highestRealm)} · 누적 승리 {fmt(state.lifetimeBattleWins)}회</PixelText>
      <PixelText size={10} color={C.dim}>{jadeName}은 환생으로 획득하는 프리미엄 재화입니다. 현재 현금 결제는 연결하지 않았습니다.</PixelText>
    </PixelPanel>

    <Modal visible={confirming} transparent animationType="none" onRequestClose={() => setConfirming(false)}>
      <View style={s.modalBackdrop}><View style={s.window} accessibilityViewIsModal testID="rebirth-confirmation">
        <View style={s.header}><PixelText size={15} color="#302715">환생 확인</PixelText><Pressable accessibilityRole="button" accessibilityLabel="환생 확인 창 닫기" onPress={() => setConfirming(false)} style={s.closeButton}><PixelIcon name="cross" size={18} color="#452b1f" /></Pressable></View>
        <ScrollView contentContainerStyle={s.modalBody}>
          <PixelText size={17} color={C.gold}>쌓아 온 삶을 기운으로 남깁니다.</PixelText>
          <PixelText size={12} color={C.muted}>현재 예상 보상은 누적 획득량을 기준으로 계산합니다. 사용한 내공과 {goldName} 때문에 보상이 줄어들지 않습니다.</PixelText>
          <View style={s.rewardBox}>
            <RewardRow title="경지 보상" amount={preview.realmBonus} />
            <RewardRow title="내공 환산" amount={preview.cultivationBonus} />
            <RewardRow title={`${goldName} 환산`} amount={preview.goldBonus} />
            <RewardRow title="공적 환산" amount={preview.meritBonus} />
            <View style={s.totalReward}><PixelIcon name="jade" size={22} /><PixelText size={22} color={C.blue} accessibilityLabel={`환생 예상 보상 ${fmt(preview.totalJade)} ${jadeName}`}>+{fmt(preview.totalJade)} {jadeName}</PixelText></View>
          </View>
          <PixelPanel title="새로운 생에 초기화되는 것" padding={10}>
            <PixelText size={11}>경지 → 삼류 · 보유 내공 → 0</PixelText>
            <PixelText size={11}>{goldName} → 150 (새출발 지원금)</PixelText>
            <PixelText size={11}>무공 → 청무검법 1성부터 다시 시작</PixelText>
            <PixelText size={11}>이번 생 전적·공적·누적 획득량 → 0</PixelText>
            <PixelText size={11}>지역 → 청죽림 · 전투 종료 후 수련 시작</PixelText>
          </PixelPanel>
          <PixelPanel title="계속 남는 것" padding={10}>
            <PixelText size={11} color={C.jade}>{jadeName} {fmt(state.jade)} + 보상 {fmt(preview.totalJade)}</PixelText>
            <PixelText size={11}>협객 이름 · 환생 횟수 · 역대 최고 경지</PixelText>
            <PixelText size={11}>누적 승리 · 지난 강호의 기록</PixelText>
          </PixelPanel>
          <PixelText size={11} color={C.red}>확정한 환생은 되돌릴 수 없습니다.</PixelText>
          <PixelButton label="환생 확정" accessibilityLabel="환생 확정" tone="gold" disabled={!preview.eligible} onPress={confirm} />
          <PixelButton label="이번 생을 계속하기" accessibilityLabel="환생 취소" tone="blue" onPress={() => setConfirming(false)} />
        </ScrollView>
      </View></View>
    </Modal>
  </View>;
}

const s = StyleSheet.create({
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  balanceRow: { flexDirection: 'row', gap: 5, borderBottomWidth: 1, borderBottomColor: '#405968', paddingBottom: 8 },
  balance: { flex: 1, gap: 3, alignItems: 'center' },
  realmGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  realmChip: { width: '32%', minHeight: 42, paddingVertical: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: '#152733', borderWidth: 1, borderColor: '#314b59' },
  realmCurrent: { backgroundColor: '#3c493b', borderColor: '#c6ab5e' },
  inputBox: { backgroundColor: '#182b38', padding: 9, gap: 5 },
  rewardBox: { backgroundColor: '#142631', padding: 10, gap: 7, borderWidth: 1, borderColor: '#405a69' },
  totalReward: { flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#365261', paddingTop: 8, marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: '#000000d8', alignItems: 'center', justifyContent: 'center', padding: 20 },
  window: { width: '100%', maxWidth: 400, maxHeight: '88%', borderWidth: 3, borderTopColor: '#b6a164', borderLeftColor: '#b6a164', borderBottomColor: '#6c613b', borderRightColor: '#6c613b', backgroundColor: '#203443' },
  header: { minHeight: 47, backgroundColor: '#c4a653', borderBottomWidth: 3, borderBottomColor: '#75612e', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15 },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 2, borderLeftColor: '#86713b', backgroundColor: '#dda04b' },
  modalBody: { padding: 13, gap: 11 },
});
