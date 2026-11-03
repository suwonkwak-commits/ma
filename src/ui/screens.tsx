import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { REALMS, REGIONS, TECHNIQUES } from '../game/content';
import { type GameState, getRealmProgress, getStats, getUpgradeCost } from '../game/engine';
import { colors as C } from './theme';
import { PixelBar, PixelButton, PixelIcon, PixelPanel, PixelText } from './pixel/primitives';

export type ScreenProps = {
  state: GameState;
  onTrain: () => void;
  onBreakthrough: () => void;
  onExpedition: (id: string) => void;
  onReturn: () => void;
  onUpgrade: (id: string) => void;
  onEquip: (id: string) => void;
};

const fmt = (value: number) => Math.floor(value).toLocaleString('ko-KR');
const realm = (index: number) => REALMS[index]?.name ?? '삼류';
const techIcons = ['sword', 'book', 'boot', 'fist'];
const techColors = ['#8adef0', '#e1c36c', '#79ca9a', '#e9a174'];

function PanelHeader({ title, hint }: { title: string; hint: string }) {
  return <View style={s.panelHeader}><PixelText size={14} color={C.gold}>{title}</PixelText><PixelText size={10} color={C.dim}>{hint}</PixelText></View>;
}

function IconBox({ name, color, size = 44 }: { name: string; color?: string; size?: number }) {
  return <View style={[s.iconBox, { width: size, height: size }]}><PixelIcon name={name} size={Math.round(size * .65)} color={color} /></View>;
}

function StatCell({ icon, title, value, color = C.text }: { icon: string; title: string; value: string; color?: string }) {
  return <View style={s.statCell}><View style={s.statCellTitle}><PixelIcon name={icon} size={14} color={color} /><PixelText size={10} color={C.muted}>{title}</PixelText></View><PixelText size={17} color={color}>{value}</PixelText></View>;
}

export function TrainingScreen({ state, onTrain, onBreakthrough, onReturn }: ScreenProps) {
  const stats = getStats(state);
  const progress = getRealmProgress(state);
  const maxRealm = state.realm >= REALMS.length - 1;
  const canBreakthrough = !maxRealm && progress.current >= progress.required;
  const technique = TECHNIQUES.find(item => item.id === state.equippedTechnique)!;
  return <View style={s.screen}>
    <PanelHeader title="협객 성장" hint="CHARACTER" />
    <PixelPanel padding={10}>
      <View style={s.identityRow}><IconBox name="person" color="#6eb9d6" size={50} /><View style={{ flex: 1, gap: 2 }}><PixelText size={15}>{state.name}</PixelText><PixelText size={11} color={C.gold}>{realm(state.realm)} · 강호의 초행자</PixelText></View><View style={{ alignItems: 'flex-end' }}><PixelText size={10} color={C.muted}>전투력</PixelText><PixelText size={20} color={C.jade}>{fmt(stats.power)}</PixelText></View></View>
      <View style={s.statsGrid}><StatCell icon="sword" title="공격력" value={fmt(stats.attack)} color={C.gold} /><StatCell icon="shield" title="방어력" value={fmt(stats.defense)} /><StatCell icon="heart" title="최대 체력" value={fmt(stats.maxHp)} color={C.red} /><StatCell icon="fire" title="수련 / 초" value={`+${stats.cultivationPerSecond.toFixed(1)}`} color={C.blue} /></View>
    </PixelPanel>
    <PixelPanel title="내공 수련" right={<PixelText size={10} color={state.mode === 'training' ? C.jade : C.gold}>{state.mode === 'training' ? '자동 수련 중' : '강호 탐험 중'}</PixelText>}>
      <View style={s.between}><PixelText size={12}>{realm(state.realm)} <PixelText color={C.dim}>→</PixelText> {maxRealm ? '최고 경지' : realm(state.realm + 1)}</PixelText><PixelText size={11} color={C.gold}>{fmt(state.cultivation)}{maxRealm ? '' : ` / ${fmt(progress.required)}`}</PixelText></View>
      <PixelBar ratio={progress.ratio} height={10} label="내공 수련 진행률" />
      <View style={s.actionRow}>
        <PixelButton label={state.mode === 'training' ? '집중 수련' : '수련 복귀'} accessibilityLabel={state.mode === 'training' ? '호흡 가다듬기' : '수련으로 돌아오기'} onPress={state.mode === 'training' ? onTrain : onReturn} style={{ flex: 1 }} icon={<PixelIcon name="fire" size={16} color="#e9d580" />} />
        <PixelButton label={maxRealm ? '최고 경지' : '경지 돌파'} accessibilityLabel="경지 돌파" tone="gold" onPress={onBreakthrough} disabled={!canBreakthrough} style={{ flex: 1 }} icon={<PixelIcon name="arrow" size={15} />} />
      </View>
      <PixelText size={10} color={canBreakthrough ? C.jade : C.muted} style={{ textAlign: 'center' }}>{canBreakthrough ? '내공 충만! 경지를 돌파할 수 있습니다.' : maxRealm ? '화경에 도달했습니다. 강호에 이름을 남기세요.' : `돌파까지 내공 ${fmt(Math.max(0, progress.required - state.cultivation))} 필요 · 집중 수련 +${12 + state.realm * 3}`}</PixelText>
    </PixelPanel>
    <PixelPanel title="운용 무공" padding={9}>
      <View style={s.identityRow}><IconBox name={techIcons[TECHNIQUES.indexOf(technique)]} color={C.blue} size={40} /><View style={{ flex: 1 }}><PixelText size={13} color={C.gold}>{technique.name} · 제 {state.techniqueLevels[technique.id]}성</PixelText><PixelText size={10} color={C.muted}>{technique.category} · 운용 공격력 +{state.techniqueLevels[technique.id] * 5}</PixelText></View><View style={s.equippedTag}><PixelText size={10} color={C.jade}>운용 중</PixelText></View></View>
    </PixelPanel>
    <PixelText size={10} color={C.dim} style={s.footnote}>자리를 비워도 최대 8시간 내공이 쌓입니다.</PixelText>
  </View>;
}

export function WorldScreen({ state, onExpedition, onReturn }: ScreenProps) {
  const current = REGIONS.find(item => item.id === state.regionId)!;
  const stats = getStats(state);
  return <View style={s.screen}>
    <PanelHeader title="강호 유람" hint={`${REGIONS.filter(item => state.realm >= item.requiredRealm).length} / ${REGIONS.length} 지역 개방`} />
    {state.mode === 'expedition' && <PixelPanel title="交戰 · 자동 전투 진행 중" right={<PixelIcon name="sword" size={18} />}>
      <View style={s.between}><PixelText size={12} color={C.gold}>{current.enemyName}</PixelText><PixelText size={11} color={C.red}>{fmt(state.enemyHp)} / {fmt(current.enemyHp)}</PixelText></View><PixelBar ratio={state.enemyHp / current.enemyHp} color={C.red} height={8} label="상대 체력" />
      <View style={s.between}><PixelText size={11} color={C.muted}>나의 체력 {fmt(state.hp)} / {fmt(stats.maxHp)}</PixelText><PixelText size={11} color={C.gold}>{fmt(state.battleWins)}승</PixelText></View>
      <PixelButton label="수련으로 복귀" accessibilityLabel="탐험 종료하고 수련으로 돌아가기" onPress={onReturn} tone="blue" small />
    </PixelPanel>}
    {REGIONS.map((region, i) => {
      const locked = state.realm < region.requiredRealm;
      const active = state.mode === 'expedition' && state.regionId === region.id;
      return <PixelPanel key={region.id} padding={9} style={locked ? { opacity: .65 } : undefined}>
        <View style={s.regionHeading}><IconBox name="map" size={42} /><View style={{ flex: 1, gap: 1 }}><PixelText size={14} color={active ? C.jade : C.gold}>0{i + 1}. {region.name}</PixelText><PixelText size={10} color={C.muted}>{region.subtitle}</PixelText></View><View style={[s.realmTag, active && { borderColor: C.green }]}><PixelText size={10} color={active ? C.jade : C.muted}>{realm(region.requiredRealm)} 이상</PixelText></View></View>
        <View style={s.regionInfo}><PixelText size={11} color={C.muted}>{region.enemyName}</PixelText><View style={s.inline}><PixelIcon name="sword" size={12} /><PixelText size={10} color={C.muted}>{region.enemyAttack}</PixelText><PixelIcon name="heart" size={12} color={C.red} /><PixelText size={10} color={C.muted}>{fmt(region.enemyHp)}</PixelText></View></View>
        <View style={[s.between, { gap: 6 }]}><View style={{ flex: 1 }}><View style={s.inline}><PixelIcon name="coin" size={15} /><PixelText size={11} color={C.gold}>+{fmt(region.rewardSilver)}</PixelText><PixelText size={10} color={C.blue}>내공 +{fmt(region.rewardCultivation)}</PixelText></View></View><PixelButton label={locked ? `${realm(region.requiredRealm)} 개방` : active ? '유람 중' : '출정'} accessibilityLabel={`${region.name} 탐험`} onPress={() => onExpedition(region.id)} disabled={locked || active} small style={{ minWidth: 86 }} /></View>
      </PixelPanel>;
    })}
    <PixelText size={10} color={C.dim} style={s.footnote}>패배하면 안전한 곳으로 복귀해 체력을 회복합니다.</PixelText>
  </View>;
}

function effectSummary(id: string, level: number) {
  switch (id) {
    case 'fog-sword': return `공격력 +${level * 2}`;
    case 'river-heart': return `내공 / 초 +${(level * .35).toFixed(2)} · 체력 +${level * 12}`;
    case 'swallow-step': return `방어력 +${level * 3}`;
    default: return `공격력 +${level * 3} · 체력 +${level * 4}`;
  }
}

export function TechniquesScreen({ state, onUpgrade, onEquip }: ScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = TECHNIQUES.find(item => item.id === selected);
  const detailIndex = detail ? TECHNIQUES.indexOf(detail) : 0;
  const level = detail ? state.techniqueLevels[detail.id] ?? 0 : 0;
  const cost = detail ? getUpgradeCost(state, detail.id) : 0;
  const stats = getStats(state);
  const nextStats = detail ? getStats({ ...state, techniqueLevels: { ...state.techniqueLevels, [detail.id]: Math.min(30, level + 1) } }) : stats;
  return <View style={s.screen}>
    <PanelHeader title="무공 비급" hint={`${Object.values(state.techniqueLevels).filter(value => value > 0).length} / ${TECHNIQUES.length} 습득`} />
    <View style={s.notice}><PixelIcon name="book" size={17} /><PixelText size={10} color={C.muted} style={{ flex: 1 }}>보유 효과는 모두 적용 · 운용 무공은 추가 공격력</PixelText></View>
    {TECHNIQUES.map((technique, index) => {
      const ownLevel = state.techniqueLevels[technique.id] ?? 0;
      const equipped = state.equippedTechnique === technique.id;
      const ownCost = getUpgradeCost(state, technique.id);
      const mastered = ownLevel >= 30;
      const affordable = state.silver >= ownCost;
      return <PixelPanel key={technique.id} padding={9} style={equipped ? { borderTopColor: '#a99151', borderLeftColor: '#a99151' } : undefined}>
        <View style={s.techniqueRow}>
          <Pressable accessibilityRole="button" accessibilityLabel={`${technique.name} 상세 정보`} onPress={() => setSelected(technique.id)} style={s.techniqueIcon}><PixelIcon name={techIcons[index]} size={34} color={techColors[index]} /><View style={s.iconGrade}><PixelText size={9} color={C.gold}>{['검', '심', '보', '권'][index]}</PixelText></View></Pressable>
          <View style={{ flex: 1, gap: 2 }}><View style={[s.between, { gap: 4 }]}><PixelText size={14} color={C.gold}>{technique.name}</PixelText><PixelText size={11} color={ownLevel ? C.text : C.dim}>{ownLevel ? `${ownLevel}성` : '미수련'}</PixelText></View><PixelText size={10} color={C.muted}>{effectSummary(technique.id, ownLevel)}</PixelText><PixelBar ratio={ownLevel / 30} height={5} color={techColors[index]} label={`${technique.name} 수련 깊이`} /></View>
        </View>
        <View style={s.techniqueBottom}><View style={{ flex: 1 }}><View style={s.inline}><PixelIcon name="coin" size={15} /><PixelText size={11} color={affordable ? C.gold : C.red}>{mastered ? '대성' : fmt(ownCost)}</PixelText><PixelText size={9} color={C.dim}>{equipped ? '운용 중' : technique.category}</PixelText></View></View><PixelButton label={mastered ? '대성' : ownLevel ? '강화' : '수련'} accessibilityLabel={`${technique.name} ${ownLevel ? '강화' : '수련'}`} onPress={() => onUpgrade(technique.id)} disabled={!affordable || mastered} small style={{ minWidth: 66 }} /><PixelButton label={equipped ? '운용 중' : '운용'} accessibilityLabel={`${technique.name} 운용`} onPress={() => onEquip(technique.id)} disabled={equipped || ownLevel === 0} tone="blue" small style={{ minWidth: 63 }} /></View>
      </PixelPanel>;
    })}
    <PixelText size={10} color={C.dim} style={s.footnote}>비급 그림을 누르면 효과와 다음 성장치를 볼 수 있습니다.</PixelText>
    <Modal visible={!!detail} transparent animationType="none" onRequestClose={() => setSelected(null)}>
      <View style={s.modalBackdrop}><View style={s.detailWindow} accessibilityViewIsModal>
        <View style={s.detailHeader}><PixelText size={15} color="#302715">무공 비급</PixelText><Pressable accessibilityRole="button" accessibilityLabel="무공 상세 닫기" onPress={() => setSelected(null)} style={s.modalClose}><PixelIcon name="cross" size={18} color="#452b1f" /></Pressable></View>
        <ScrollView contentContainerStyle={s.detailBody}>
          {detail && <><View style={s.identityRow}><View style={[s.techniqueIcon, { width: 68, height: 68 }]}><PixelIcon name={techIcons[detailIndex]} size={48} color={techColors[detailIndex]} /></View><View style={{ flex: 1, gap: 4 }}><PixelText size={16} color={C.gold}>{detail.name}</PixelText><PixelText size={12}>{detail.category} · {level ? `제 ${level}성` : '미수련'}</PixelText><PixelText size={10} color={C.muted}>최대 수련 30성</PixelText></View></View>
          <View style={s.descriptionBox}><PixelText size={12}>{detail.description}</PixelText></View>
          <View style={s.between}><PixelText size={12} color={C.gold}>현재 보유 효과</PixelText><PixelText size={10} color={C.jade}>{state.equippedTechnique === detail.id ? '운용 중' : level ? '습득 완료' : '미습득'}</PixelText></View>
          <View style={s.effectBox}><PixelText size={12}>{effectSummary(detail.id, level)}</PixelText><PixelText size={10} color={C.dim}>{detail.id === 'river-heart' ? `방어력 +${level} 포함` : '습득한 무공의 보유 효과는 항상 적용됩니다.'}</PixelText></View>
          {level < 30 && <><PixelText size={12} color={C.gold}>다음 성장 · {level + 1}성</PixelText><View style={s.effectBox}>{[
            ['공격력', stats.attack, nextStats.attack],
            ['방어력', stats.defense, nextStats.defense],
            ['최대 체력', stats.maxHp, nextStats.maxHp],
            ['수련 / 초', stats.cultivationPerSecond, nextStats.cultivationPerSecond],
          ].map(([label, before, after]) => <View key={String(label)} style={s.between}><PixelText size={11} color={C.muted}>{String(label)}</PixelText><PixelText size={11}>{typeof before === 'number' ? before.toFixed(label === '수련 / 초' ? 2 : 0) : before} <PixelText color={C.dim}>→</PixelText> <PixelText color={Number(after) > Number(before) ? C.jade : C.text}>{typeof after === 'number' ? after.toFixed(label === '수련 / 초' ? 2 : 0) : after}</PixelText></PixelText></View>)}</View></>}
          <View style={s.inline}><PixelIcon name="coin" size={19} /><PixelText size={14} color={C.gold}>{level >= 30 ? '최고 성취 달성' : `필요 은전 ${fmt(cost)}`}</PixelText></View>
          <View style={s.actionRow}><PixelButton label={level ? '무공 강화' : '무공 수련'} accessibilityLabel={`${detail.name} 상세 ${level ? '강화' : '수련'}`} onPress={() => onUpgrade(detail.id)} disabled={state.silver < cost || level >= 30} style={{ flex: 1 }} /><PixelButton label={state.equippedTechnique === detail.id ? '운용 중' : '주력 운용'} accessibilityLabel={`${detail.name} 상세 운용`} onPress={() => onEquip(detail.id)} disabled={state.equippedTechnique === detail.id || level === 0} tone="blue" style={{ flex: 1 }} /></View>
          <PixelText size={10} color={C.dim}>주력으로 운용하면 무공 1성마다 공격력 +5가 추가됩니다.</PixelText></>}
        </ScrollView>
      </View></View>
    </Modal>
  </View>;
}

export function JournalScreen({ state }: ScreenProps) {
  const [page, setPage] = useState<'logs' | 'collection'>('logs');
  const milestones = [
    { name: '첫 호흡', detail: '협객의 길을 시작하다', done: true, icon: 'fire' },
    { name: '문턱을 넘다', detail: '첫 번째 경지 돌파', done: state.realm >= 1, icon: 'arrow' },
    { name: '강호의 첫 승', detail: '자동 전투 1회 승리', done: state.battleWins >= 1, icon: 'sword' },
    { name: '벼린 한 수', detail: '무공 하나를 제5성까지 강화', done: Object.values(state.techniqueLevels).some(value => value >= 5), icon: 'book' },
    { name: '백전의 협객', detail: '자동 전투 100회 승리', done: state.battleWins >= 100, icon: 'helmet' },
  ];
  return <View style={s.screen}>
    <PanelHeader title="무림 도감" hint="CHRONICLE" />
    <View style={s.actionRow}><PixelButton label="수행 기록" accessibilityLabel="수행 기록 보기" onPress={() => setPage('logs')} tone={page === 'logs' ? 'gold' : 'blue'} style={{ flex: 1 }} /><PixelButton label="강호 도감" accessibilityLabel="강호 도감 보기" onPress={() => setPage('collection')} tone={page === 'collection' ? 'gold' : 'blue'} style={{ flex: 1 }} /></View>
    <PixelPanel padding={9}><View style={s.journalStats}><View style={s.journalStat}><PixelText size={18} color={C.gold}>{fmt(state.battleWins)}</PixelText><PixelText size={10} color={C.muted}>승리한 대결</PixelText></View><View style={s.journalStat}><PixelText size={18} color={C.text}>{realm(state.realm)}</PixelText><PixelText size={10} color={C.muted}>지금의 경지</PixelText></View><View style={s.journalStat}><PixelText size={18} color={C.red}>{fmt(state.defeats)}</PixelText><PixelText size={10} color={C.muted}>다시 일어선 날</PixelText></View></View></PixelPanel>
    {page === 'logs' ? <PixelPanel title="강호의 기록" padding={0}>{[...state.logs].reverse().map((event, index) => <View key={event.id} style={[s.logRow, index % 2 === 0 && { backgroundColor: '#203645' }]}><PixelIcon name={event.tone === 'good' ? 'star' : event.tone === 'danger' ? 'shield' : 'scroll'} size={17} color={event.tone === 'good' ? C.gold : event.tone === 'danger' ? C.red : C.dim} /><PixelText size={11} color={event.tone === 'good' ? C.gold : event.tone === 'danger' ? C.red : C.muted} style={{ flex: 1 }}>{event.text}</PixelText></View>)}</PixelPanel> : <>
      <PixelPanel title="길 위의 이정표" padding={0}>{milestones.map(item => <View key={item.name} style={[s.milestone, !item.done && { opacity: .6 }]}><IconBox name={item.icon} color={item.done ? C.gold : C.dim} size={34} /><View style={{ flex: 1 }}><PixelText size={12} color={item.done ? C.gold : C.muted}>{item.name}</PixelText><PixelText size={10} color={C.muted}>{item.detail}</PixelText></View>{item.done ? <PixelIcon name="check" size={17} color={C.jade} /> : <PixelText size={10} color={C.dim}>미달성</PixelText>}</View>)}</PixelPanel>
      <PixelPanel title="강호 견문록"><View style={s.discoveryGrid}>{REGIONS.map((region, index) => <View key={region.id} style={[s.discovery, state.realm < region.requiredRealm && { opacity: .4 }]}><PixelIcon name="map" size={28} /><PixelText size={10} color={state.realm >= region.requiredRealm ? C.gold : C.dim}>0{index + 1}. {region.name}</PixelText><PixelText size={9} color={C.dim}>{state.realm >= region.requiredRealm ? '개방' : `${realm(region.requiredRealm)} 필요`}</PixelText></View>)}</View></PixelPanel>
    </>}
  </View>;
}

const s = StyleSheet.create({
  screen: { gap: 7 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 3, minHeight: 25, gap: 8 },
  iconBox: { borderWidth: 2, borderTopColor: '#0b1722', borderLeftColor: '#0b1722', borderBottomColor: '#587485', borderRightColor: '#587485', backgroundColor: '#152430', alignItems: 'center', justifyContent: 'center' },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statsGrid: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#405968', paddingTop: 8, gap: 4 },
  statCell: { flex: 1, gap: 3, alignItems: 'center' },
  statCellTitle: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  actionRow: { flexDirection: 'row', gap: 6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  equippedTag: { paddingHorizontal: 5, paddingVertical: 3, borderWidth: 1, borderColor: '#3a785a', backgroundColor: '#183b30' },
  footnote: { paddingVertical: 4, paddingHorizontal: 4, textAlign: 'center' },
  realmTag: { backgroundColor: '#142631', borderWidth: 1, borderColor: '#446170', paddingHorizontal: 6, paddingVertical: 3 },
  regionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  regionInfo: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#365361', paddingTop: 5, gap: 7 },
  notice: { flexDirection: 'row', gap: 6, padding: 8, backgroundColor: '#192b37', alignItems: 'center' },
  techniqueRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  techniqueIcon: { width: 54, height: 54, backgroundColor: '#13232e', borderWidth: 2, borderTopColor: '#09131e', borderLeftColor: '#09131e', borderBottomColor: '#577483', borderRightColor: '#577483', alignItems: 'center', justifyContent: 'center' },
  iconGrade: { position: 'absolute', top: 0, left: 3 },
  techniqueBottom: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: '#000000c9', alignItems: 'center', justifyContent: 'center', padding: 20 },
  detailWindow: { width: '100%', maxWidth: 400, maxHeight: '88%', borderWidth: 3, borderTopColor: '#b6a164', borderLeftColor: '#b6a164', borderBottomColor: '#6c613b', borderRightColor: '#6c613b', backgroundColor: '#203443' },
  detailHeader: { height: 47, backgroundColor: '#c4a653', borderBottomWidth: 3, borderBottomColor: '#75612e', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15 },
  modalClose: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 2, borderLeftColor: '#86713b', backgroundColor: '#dda04b' },
  detailBody: { padding: 15, gap: 13 },
  descriptionBox: { backgroundColor: '#12222d', padding: 11, borderWidth: 1, borderColor: '#0a161f' },
  effectBox: { padding: 10, backgroundColor: '#182c38', gap: 5, borderWidth: 1, borderColor: '#3b5869' },
  journalStats: { flexDirection: 'row', justifyContent: 'space-around' },
  journalStat: { alignItems: 'center', flex: 1, gap: 1 },
  logRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 9, paddingVertical: 11, alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#10232e' },
  milestone: { flexDirection: 'row', gap: 8, padding: 9, borderBottomWidth: 1, borderBottomColor: '#10232e', alignItems: 'center' },
  discoveryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  discovery: { width: '48%', padding: 8, backgroundColor: '#152834', alignItems: 'center', gap: 4 },
});
