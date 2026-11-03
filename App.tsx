import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useGame } from './src/hooks/useGame';
import { breakthrough, claimOfflineRewards, equipTechnique, getRealmProgress, getStats, returnToTraining, startExpedition, train, upgradeTechnique } from './src/game/engine';
import { REALMS, REGIONS, TECHNIQUES } from './src/game/content';
import { JournalScreen, TechniquesScreen, TrainingScreen, WorldScreen } from './src/ui/screens';
import { PixelBar, PixelButton, PixelIcon, PixelPanel, PixelText } from './src/ui/pixel/primitives';
import PixelScene from './src/ui/pixel/PixelScene';

const C = { bg: '#101b25', gold: '#e0c271', muted: '#94adb9', green: '#62d393', cyan: '#7ccee3' };
const tabs = [
  { id: 'training', label: '캐릭터', accessible: '수련', icon: 'person' },
  { id: 'techniques', label: '무공', accessible: '무공', icon: 'sword' },
  { id: 'world', label: '강호', accessible: '강호', icon: 'map' },
  { id: 'journal', label: '도감', accessible: '여록', icon: 'book' },
] as const;
type Tab = (typeof tabs)[number]['id'];
type Dialog = 'guide' | 'settings' | 'reset' | null;
const number = (value: number) => Math.floor(value).toLocaleString('ko-KR');
const shortNumber = (value: number) => value >= 10000 ? `${(value / 10000).toFixed(1)}만` : number(value);

function Game() {
  const { width, height } = useWindowDimensions();
  const desktop = width >= 600;
  const [tab, setTab] = useState<Tab>('training');
  const [dialog, setDialog] = useState<Dialog>(null);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const { game, loaded, saveStatus, act, reset, retrySave, retryLoad } = useGame();
  const stats = getStats(game);
  const progress = getRealmProgress(game);
  const region = REGIONS.find(item => item.id === game.regionId) ?? REGIONS[0];
  const onJourney = game.mode === 'expedition';
  const sceneHeight = Math.max(170, Math.min(tab === 'training' ? 280 : 218, height * (tab === 'training' ? 0.34 : 0.27)));
  const quest = game.battleWins === 0
    ? { title: '첫 번째 강호 · 산적 1명 처치', status: '0 / 1', target: 'world' as Tab }
    : game.realm === 0
      ? { title: '경지의 문턱 · 이류에 도달', status: `${number(Math.min(game.cultivation, 120))} / 120`, target: 'training' as Tab }
      : { title: '협객의 발자취 · 전투 100회 승리', status: `${number(Math.min(game.battleWins, 100))} / 100`, target: 'journal' as Tab };
  const changeTab = (next: Tab) => { setTab(next); scroll.current?.scrollTo({ y: 0, animated: false }); };
  const props = {
    state: game,
    onTrain: () => act(train),
    onBreakthrough: () => act(breakthrough),
    onExpedition: (id: string) => act(previous => startExpedition(previous, id)),
    onReturn: () => act(returnToTraining),
    onUpgrade: (id: string) => act(previous => upgradeTechnique(previous, id)),
    onEquip: (id: string) => act(previous => equipTechnique(previous, id)),
  };

  return <SafeAreaView style={s.outer} edges={['top', 'bottom']}>
    <StatusBar barStyle="light-content" />
    {desktop && <View style={s.desktopBrand}><PixelText size={18} color={C.gold}>무림여록</PixelText><PixelText size={10} color={C.muted}>한 걸음의 수련, 끝없는 강호</PixelText></View>}
    <View style={[s.gameFrame, desktop && { height: Math.min(height - 100, 920), flex: undefined, borderWidth: 2, borderColor: '#3b5360' }]}>
      <View style={s.header}>
        <View style={s.avatar}><PixelIcon name="person" size={29} /></View>
        <View style={s.playerInfo}><PixelText size={12} numberOfLines={1}>{game.name}</PixelText><PixelText size={10} color={C.cyan}>{REALMS[game.realm].name} · {onJourney ? '강호 유람' : '운기조식'}</PixelText></View>
        <View style={s.wallet} accessibilityLabel={`은전 ${number(game.silver)}, 내공 ${number(game.cultivation)}`}>
          <View style={s.walletItem}><PixelIcon name="coin" size={13} /><PixelText size={11} color={C.gold}>{shortNumber(game.silver)}</PixelText></View>
          <View style={s.walletItem}><PixelIcon name="gem" size={13} /><PixelText size={11} color={C.cyan}>{shortNumber(game.cultivation)}</PixelText></View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="게임 안내" onPress={() => setDialog('guide')} style={s.headerButton}><PixelText size={19} color={C.gold}>?</PixelText></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="설정" onPress={() => setDialog('settings')} style={s.headerButton}><PixelIcon name="gear" size={19} /></Pressable>
      </View>

      {!loaded ? <View style={s.loading}>
        {saveStatus === 'error' ? <>
          <PixelText size={16}>저장 기록을 불러오지 못했습니다.</PixelText>
          <PixelText style={s.centeredBody}>기존 기록을 보호하기 위해 수련을 잠시 멈췄습니다.</PixelText>
          <PixelButton label="다시 불러오기" accessibilityLabel="저장 기록 다시 불러오기" onPress={retryLoad} />
        </> : <><ActivityIndicator color={C.gold} /><PixelText color={C.muted}>당신의 강호를 펼치는 중</PixelText></>}
      </View> : <>
        <View style={[s.stage, { height: sceneHeight }]} testID="battle-stage">
          <PixelScene state={game} height={sceneHeight} />
          <View style={s.stageHud} pointerEvents="box-none">
            <View style={s.stageTitleRow}>
              <View style={s.zonePill}><PixelText size={11} color="#d7eecc">{region.name} · {REGIONS.indexOf(region) + 1}-1</PixelText></View>
              <View style={s.zonePill}><PixelIcon name="sword" size={11} /><PixelText size={11}>토벌 {number(game.battleWins)}</PixelText></View>
            </View>
            <View style={s.healthRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ height: 14 }}><PixelBar ratio={game.hp / stats.maxHp} color="#56b3ce" height={14} label={`체력 ${number(game.hp)} / ${number(stats.maxHp)}`} /><PixelText size={9} style={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center' }}>HP {number(game.hp)} / {number(stats.maxHp)}</PixelText></View>
                <PixelBar ratio={progress.ratio} color="#cf9b50" height={6} label="경지 돌파 내공" />
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={onJourney ? '자동 전투 중지' : '자동 전투 시작'} onPress={() => act(onJourney ? returnToTraining : previous => startExpedition(previous, region.id))} style={[s.autoButton, onJourney && { backgroundColor: '#357a53', borderTopColor: '#7cce8b' }]}>
                <PixelText size={12} color={onJourney ? '#e2f4ca' : '#c3d2d5'}>AUTO</PixelText><PixelText size={9} color={onJourney ? '#e2f4ca' : C.muted}>{onJourney ? 'ON' : 'OFF'}</PixelText>
              </Pressable>
            </View>
          </View>
          <View style={s.stageStatus} pointerEvents="none"><View style={[s.statusDot, { backgroundColor: onJourney ? C.green : C.cyan }]} /><PixelText size={10} color="#d9e8d4">{onJourney ? '자동 전투 · 무공을 다듬는 중' : '운기조식 · 내공을 쌓는 중'}</PixelText></View>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="현재 목표 확인" onPress={() => changeTab(quest.target)} style={s.questStrip}>
          <View style={s.questMarker}><PixelIcon name="scroll" size={15} /></View>
          <PixelText size={11} style={{ flex: 1 }} numberOfLines={1}>{quest.title}</PixelText>
          <PixelText size={10} color={C.gold}>{quest.status}</PixelText><PixelText color={C.gold}>▶</PixelText>
        </Pressable>

        <View style={s.quickbar}>
          <View style={s.quickSlots}>{TECHNIQUES.map((technique, i) => {
            const learned = (game.techniqueLevels[technique.id] ?? 0) > 0;
            const active = game.equippedTechnique === technique.id;
            return <Pressable key={technique.id} accessibilityRole="button" accessibilityLabel={`${technique.name} 빠른 운용`} accessibilityState={{ disabled: !learned, selected: active }} disabled={!learned} onPress={() => props.onEquip(technique.id)} style={[s.skillSlot, active && { borderColor: C.gold, backgroundColor: '#344a48' }, !learned && { opacity: 0.4 }]}>
              <PixelIcon name={['sword', 'heart', 'boot', 'fist'][i]} size={22} />
              <PixelText size={8} color={active ? C.gold : C.muted}>{learned ? `${game.techniqueLevels[technique.id]}성` : '미습득'}</PixelText>
            </Pressable>;
          })}</View>
          <View style={s.powerLabel}><PixelText size={9} color={C.muted}>전투력</PixelText><PixelText size={17} color={C.gold}>{shortNumber(stats.power)}</PixelText></View>
        </View>

        <View style={s.panelTabHeader}><View style={s.panelName}><View style={s.panelSquare} /><PixelText size={13} color={C.gold}>{tabs.find(item => item.id === tab)!.label}</PixelText></View><PixelText size={9} color={C.muted}>{tab === 'training' ? '수련과 경지' : tab === 'world' ? '강호 유람' : tab === 'techniques' ? '무공을 벼리는 시간' : '협객의 발자취'}</PixelText></View>
        {saveStatus === 'error' && <Pressable accessibilityRole="button" accessibilityLabel="저장 재시도" onPress={retrySave} style={s.saveError}><PixelText size={11} color="#ffb39d">저장하지 못했습니다. 눌러서 다시 시도</PixelText></Pressable>}
        <ScrollView ref={scroll} style={s.panelScroll} contentContainerStyle={s.panelContent} showsVerticalScrollIndicator={false}>
          {tab === 'training' && <TrainingScreen {...props} />}
          {tab === 'techniques' && <TechniquesScreen {...props} />}
          {tab === 'world' && <WorldScreen {...props} />}
          {tab === 'journal' && <JournalScreen {...props} />}
          <View style={s.saveLine}><View style={[s.statusDot, { width: 4, height: 4 }]} /><PixelText size={9} color={C.muted}>{saveStatus === 'saved' ? '기기에 자동 저장 중' : '기기 저장 확인 필요'}</PixelText><PixelText size={9} color={C.muted}>무림여록</PixelText></View>
        </ScrollView>

        <View style={s.bottomNav} accessibilityRole="tablist">
          {tabs.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={item.accessible} accessibilityState={{ selected: tab === item.id }} onPress={() => changeTab(item.id)} style={({ pressed }) => [s.navItem, tab === item.id && s.navActive, pressed && { opacity: 0.7 }]}>
            <PixelIcon name={item.icon} size={23} color={tab === item.id ? C.gold : '#adc0c7'} /><PixelText size={11} color={tab === item.id ? '#ffe49a' : '#c2d1d8'}>{item.label}</PixelText>
            {item.id === 'training' && progress.ratio >= 1 && progress.required > 0 && <View style={s.notificationDot} />}
          </Pressable>)}
          <Pressable accessibilityRole="button" accessibilityLabel="메뉴" onPress={() => setDialog('settings')} style={s.navItem}><PixelIcon name="gear" size={23} /><PixelText size={11}>메뉴</PixelText></Pressable>
        </View>
      </>}

      <Modal visible={dialog !== null} transparent animationType="none" onRequestClose={() => setDialog(null)}>
        <View style={s.modalBackdrop}><View style={s.dialog} accessibilityViewIsModal>
          <View style={s.dialogHeading}><View style={s.headingCorner} /><PixelText size={16} color="#1c2630">{dialog === 'guide' ? '강호 입문서' : dialog === 'reset' ? '기록 초기화' : '메뉴 · 설정'}</PixelText><View style={s.headingCorner} /></View>
          <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={() => setDialog(null)} style={s.closeButton}><PixelText size={18} color="#f3d1b2">×</PixelText></Pressable>
          <ScrollView contentContainerStyle={s.dialogBody}>
            {dialog === 'guide' && <>
              <PixelText size={18} color={C.gold}>한 걸음씩, 나의 강호</PixelText>
              <PixelText style={s.bodyText}>수련으로 내공을 쌓고 경지를 넘으세요. AUTO를 켜면 현재 지역에서 자동 전투를 시작합니다.</PixelText>
              {[
                ['01', '수련하고 돌파하기', '캐릭터에서 호흡을 가다듬으면 내공이 증가합니다. 내공이 충만해지면 경지를 돌파하세요.'],
                ['02', '강호에서 실력 겨루기', '강호에서 지역을 선택하세요. 2초마다 자동으로 공격하며, 승리하면 은전과 내공을 얻습니다.'],
                ['03', '무공을 익혀 강해지기', '무공을 수련하고 강화하면 능력치가 오릅니다. 익힌 무공은 아래 슬롯으로 빠르게 운용할 수 있습니다.'],
              ].map(([n, title, body]) => <PixelPanel key={n} padding={12}><PixelText color={C.gold}>{n}  {title}</PixelText><PixelText style={s.bodyText}>{body}</PixelText></PixelPanel>)}
              <PixelText size={11} color={C.muted}>자리를 비우면 최대 8시간 동안 내공을 수련합니다. 재접속하면 안전하게 수련으로 복귀합니다.</PixelText>
              <PixelButton label="강호에 첫발 내딛기" tone="green" onPress={() => setDialog(null)} />
            </>}
            {dialog === 'settings' && <>
              <PixelPanel title="기기 자동 저장"><PixelText style={s.bodyText}>진행 상황은 이 기기에 3초마다, 행동할 때마다 저장됩니다. 현재 다른 기기와의 동기화는 지원하지 않습니다.</PixelText></PixelPanel>
              <PixelButton label="게임 안내 다시 보기" tone="blue" onPress={() => setDialog('guide')} />
              <PixelButton label="모든 수련 기록 초기화" tone="danger" onPress={() => setDialog('reset')} />
              <PixelText style={s.bodyText}>앱을 삭제하거나 브라우저 데이터를 지우면 기록이 사라질 수 있습니다. 현재 결제와 광고는 없습니다.</PixelText>
              <PixelPanel title="만드는 이야기"><PixelText size={12} color={C.gold}>무림여록 · 도트 에디션</PixelText><PixelText style={s.bodyText}>폰트: Neo둥근모 v1.601{ '\n' }© 2017–2021 Eunbin Jeong (Dalgona.){ '\n' }SIL Open Font License 1.1</PixelText></PixelPanel>
            </>}
            {dialog === 'reset' && <>
              <PixelText size={17} color={C.gold}>새로운 길을 걸을까요?</PixelText>
              <PixelText style={s.bodyText}>경지, 은전, 무공, 전투 기록이 모두 초기화됩니다. 초기화한 기록은 복구할 수 없습니다.</PixelText>
              <PixelButton label="기록을 지우고 다시 시작" tone="danger" onPress={() => { reset(); changeTab('training'); setDialog(null); }} />
              <PixelButton label="기록 유지하기" tone="blue" onPress={() => setDialog('settings')} />
            </>}
          </ScrollView>
        </View></View>
      </Modal>

      <Modal visible={loaded && !!game.offlineReward && dialog === null} transparent animationType="none" onRequestClose={() => act(claimOfflineRewards)}>
        <View style={s.modalBackdrop}><View style={s.dialog} accessibilityViewIsModal>
          <View style={s.dialogHeading}><View style={s.headingCorner} /><PixelText size={16} color="#1c2630">방치 수련 보상</PixelText><View style={s.headingCorner} /></View>
          <View style={[s.dialogBody, { paddingTop: 30 }]}>
            <View style={{ alignItems: 'center', gap: 16 }}><PixelIcon name="scroll" size={54} /><PixelText size={19} color={C.gold}>고요 속에서도, 성장</PixelText><PixelText style={s.centeredBody}>{Math.floor((game.offlineReward?.seconds ?? 0) / 60)}분 {Math.floor(game.offlineReward?.seconds ?? 0) % 60}초 동안{ '\n' }단전의 기운이 더 깊어졌습니다.</PixelText></View>
            <PixelPanel title="쌓인 내공"><PixelText size={28} color={C.cyan} style={{ textAlign: 'center', padding: 12 }}>+{number(game.offlineReward?.cultivation ?? 0)}</PixelText></PixelPanel>
            <PixelButton label="수련 이어가기" accessibilityLabel="오프라인 보상 확인" tone="green" onPress={() => act(claimOfflineRewards)} />
            <PixelText size={11} color={C.muted} style={{ textAlign: 'center' }}>내공에 반영되었습니다 · 최대 8시간 누적</PixelText>
          </View>
        </View></View>
      </Modal>
    </View>
  </SafeAreaView>;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ PixelKR: require('./assets/fonts/NeoDunggeunmo.ttf') });
  if (!fontsLoaded) return <View style={s.fontLoading}><ActivityIndicator color={C.gold} /><Text style={s.fontLoadingText}>{fontError ? '글꼴을 불러오지 못했습니다. 앱을 다시 열어주세요.' : '강호에 들어가는 중...'}</Text></View>;
  return <SafeAreaProvider><Game /></SafeAreaProvider>;
}

const s = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#090f15', alignItems: 'center', justifyContent: 'center' },
  desktopBrand: { width: 480, paddingBottom: 14, paddingHorizontal: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gameFrame: { flex: 1, width: '100%', maxWidth: 480, backgroundColor: C.bg, overflow: 'hidden' },
  header: { minHeight: 54, paddingHorizontal: 7, paddingVertical: 5, backgroundColor: '#253d4d', borderTopWidth: 2, borderTopColor: '#597483', borderBottomWidth: 3, borderBottomColor: '#090f17', flexDirection: 'row', gap: 6, alignItems: 'center' },
  avatar: { width: 34, height: 37, borderWidth: 2, borderTopColor: '#9eb0a5', borderLeftColor: '#9eb0a5', borderRightColor: '#18252b', borderBottomColor: '#18252b', backgroundColor: '#182630', alignItems: 'center', justifyContent: 'center' },
  playerInfo: { flex: 1, gap: 5, minWidth: 0 },
  wallet: { gap: 5, paddingLeft: 5 },
  walletItem: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 46 },
  headerButton: { minHeight: 44, width: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#203543' },
  stage: { flexShrink: 0, backgroundColor: '#1c494f', overflow: 'hidden' },
  stageHud: { position: 'absolute', top: 8, left: 9, right: 9, gap: 7 },
  stageTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  zonePill: { backgroundColor: '#0c2028bf', paddingHorizontal: 7, paddingVertical: 4, flexDirection: 'row', gap: 5, alignItems: 'center' },
  healthRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  autoButton: { width: 51, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 3, backgroundColor: '#344750', borderWidth: 2, borderTopColor: '#728b8d', borderLeftColor: '#728b8d', borderRightColor: '#15252c', borderBottomColor: '#15252c' },
  stageStatus: { position: 'absolute', bottom: 7, left: 9, flexDirection: 'row', gap: 5, alignItems: 'center', padding: 5, backgroundColor: '#0b2025cf' },
  statusDot: { width: 5, height: 5, backgroundColor: '#79b68e' },
  questStrip: { minHeight: 35, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: '#293f4b', borderTopWidth: 2, borderTopColor: '#61735e', borderBottomWidth: 2, borderBottomColor: '#0b171e', flexDirection: 'row', alignItems: 'center', gap: 7 },
  questMarker: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#71643c', borderWidth: 1, borderColor: '#c3a75a' },
  quickbar: { minHeight: 57, padding: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0b171f', borderBottomWidth: 2, borderBottomColor: '#3a535e' },
  quickSlots: { flexDirection: 'row', gap: 5 },
  skillSlot: { width: 43, height: 44, backgroundColor: '#182934', borderWidth: 2, borderTopColor: '#435a66', borderLeftColor: '#435a66', borderRightColor: '#050d14', borderBottomColor: '#050d14', alignItems: 'center', justifyContent: 'center', gap: 1 },
  powerLabel: { alignItems: 'flex-end', paddingRight: 6, gap: 3 },
  panelTabHeader: { minHeight: 34, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#263d4b', borderTopWidth: 1, borderTopColor: '#4b6575', borderBottomWidth: 2, borderBottomColor: '#0c1922' },
  panelName: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  panelSquare: { width: 5, height: 10, backgroundColor: C.gold },
  panelScroll: { flex: 1 },
  panelContent: { padding: 8, gap: 9, paddingBottom: 16 },
  saveLine: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'space-between', padding: 5 },
  saveError: { padding: 10, backgroundColor: '#5d3432', borderBottomWidth: 2, borderColor: '#c08465' },
  bottomNav: { minHeight: 65, flexDirection: 'row', backgroundColor: '#233745', borderTopWidth: 3, borderTopColor: '#79909b', padding: 3, gap: 3 },
  navItem: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#314a5b', borderWidth: 2, borderTopColor: '#6e8796', borderLeftColor: '#6e8796', borderRightColor: '#10202b', borderBottomColor: '#10202b' },
  navActive: { backgroundColor: '#625a3d', borderTopColor: '#e2c981', borderLeftColor: '#e2c981', borderRightColor: '#332b20', borderBottomColor: '#332b20' },
  notificationDot: { width: 6, height: 6, backgroundColor: '#e17b58', position: 'absolute', right: 4, top: 3 },
  loading: { flex: 1, gap: 18, padding: 20, alignItems: 'center', justifyContent: 'center' },
  fontLoading: { flex: 1, backgroundColor: '#101b25', alignItems: 'center', justifyContent: 'center', gap: 20 },
  fontLoadingText: { color: C.muted, fontSize: 13 },
  modalBackdrop: { flex: 1, backgroundColor: '#02090de8', paddingHorizontal: 22, paddingVertical: 34, alignItems: 'center', justifyContent: 'center' },
  dialog: { width: '100%', maxWidth: 400, maxHeight: '88%', backgroundColor: '#213746', borderWidth: 3, borderTopColor: '#a7b9bb', borderLeftColor: '#738e9a', borderRightColor: '#101c27', borderBottomColor: '#101c27' },
  dialogHeading: { marginTop: -15, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 17, borderWidth: 2, borderTopColor: '#f0da91', borderLeftColor: '#f0da91', borderRightColor: '#66502c', borderBottomColor: '#66502c', backgroundColor: '#c6aa58', flexDirection: 'row', alignItems: 'center', gap: 12 },
  headingCorner: { width: 4, height: 4, backgroundColor: '#f5db8c' },
  closeButton: { position: 'absolute', right: -10, top: -16, width: 44, height: 44, backgroundColor: '#a05e3d', borderWidth: 2, borderTopColor: '#e9a36b', borderLeftColor: '#e9a36b', borderRightColor: '#432c27', borderBottomColor: '#432c27', alignItems: 'center', justifyContent: 'center' },
  dialogBody: { padding: 16, paddingTop: 21, gap: 14 },
  bodyText: { fontSize: 13, lineHeight: 21, color: '#c0d1d7' },
  centeredBody: { fontSize: 13, lineHeight: 22, color: '#b5cad2', textAlign: 'center' },
});
