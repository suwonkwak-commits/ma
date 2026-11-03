import React, { useState } from 'react';
import {
  ActivityIndicator, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Check, ChevronRight, Coins, Compass, Feather, HelpCircle, Leaf, Settings2, Shield, Sparkles, Swords, X } from 'lucide-react-native';
import { useGame } from './src/hooks/useGame';
import { breakthrough, claimOfflineRewards, equipTechnique, getStats, returnToTraining, startExpedition, train, upgradeTechnique } from './src/game/engine';
import { REALMS } from './src/game/content';
import { JournalScreen, TechniquesScreen, TrainingScreen, WorldScreen } from './src/ui/screens';

const C = { bg: '#071411', panel: '#0d211c', line: '#244037', gold: '#d4b77b', ink: '#ede8da', muted: '#8ba69b', jade: '#a6c6ad' };
const serif = Platform.select({ web: 'Georgia, "Noto Serif KR", serif', ios: 'Georgia', default: 'serif' });
const tabs = [
  { id: 'training', label: '수련', subtitle: 'THE INNER PATH', Icon: Leaf },
  { id: 'world', label: '강호', subtitle: 'THE WANDERING', Icon: Compass },
  { id: 'techniques', label: '무공', subtitle: 'THE MARTIAL ARTS', Icon: Swords },
  { id: 'journal', label: '여록', subtitle: 'YOUR CHRONICLES', Icon: BookOpen },
] as const;
type Tab = (typeof tabs)[number]['id'];

function Game() {
  const { width } = useWindowDimensions();
  const desktop = width >= 1000;
  const { game, loaded, saveStatus, act, reset, retrySave, retryLoad } = useGame();
  const [tab, setTab] = useState<Tab>('training');
  const [dialog, setDialog] = useState<'guide' | 'settings' | 'reset' | null>(null);
  const stats = getStats(game);
  const format = (n: number) => Math.floor(n).toLocaleString('ko-KR');
  const props = {
    state: game,
    onTrain: () => act(train),
    onBreakthrough: () => act(breakthrough),
    onExpedition: (id: string) => act(previous => startExpedition(previous, id)),
    onReturn: () => act(returnToTraining),
    onUpgrade: (id: string) => act(previous => upgradeTechnique(previous, id)),
    onEquip: (id: string) => act(previous => equipTechnique(previous, id)),
  };

  const navigation = (sidebar: boolean) => (
    <View style={sidebar ? s.navList : s.bottomList} accessibilityRole="tablist">
      {tabs.map(({ id, label, subtitle, Icon }) => (
        <Pressable key={id} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: tab === id }} onPress={() => setTab(id)}
          style={({ pressed }) => [sidebar ? s.sideTab : s.bottomTab, tab === id && (sidebar ? s.sideTabActive : s.bottomTabActive), pressed && s.pressed]}>
          <Icon size={sidebar ? 19 : 21} color={tab === id ? C.gold : C.muted} strokeWidth={1.5} />
          <View style={sidebar ? { flex: 1 } : undefined}>
            <Text style={[s.navText, tab === id && { color: C.gold }, !sidebar && { fontSize: 11, textAlign: 'center' }]}>{label}</Text>
            {sidebar && <Text style={s.navSubtitle}>{subtitle}</Text>}
          </View>
          {sidebar && tab === id && <View style={s.activeDot} />}
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <View style={s.topbar}>
        <View style={[s.topbarInner, !desktop && { paddingHorizontal: 16, height: 76 }]}>
          <View style={s.brand}>
            <View style={s.seal}><Text style={s.sealText}>武</Text></View>
            <View><Text style={s.brandText}>무림여록</Text><Text style={s.brandSub}>MURIM CHRONICLES</Text></View>
          </View>
          <View style={s.headerRight}>
            <View style={s.currency}><Coins size={16} color={C.gold} strokeWidth={1.5} /><Text style={s.currencyText}>{format(game.silver)}</Text>{desktop && <Text style={s.currencyUnit}>은전</Text>}</View>
            <Pressable accessibilityRole="button" accessibilityLabel="게임 안내" onPress={() => setDialog('guide')} style={s.iconButton}><HelpCircle size={20} color={C.muted} strokeWidth={1.5} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="설정" onPress={() => setDialog('settings')} style={s.iconButton}><Settings2 size={20} color={C.muted} strokeWidth={1.5} /></Pressable>
          </View>
        </View>
      </View>

      {!loaded ? <View style={s.loading}>
        {saveStatus === 'error' ? <>
          <Text style={s.loadingText}>저장 기록을 불러오지 못했습니다.</Text>
          <Text style={[s.dialogBody, { textAlign: 'center', paddingHorizontal: 30 }]}>기존 기록을 보호하기 위해 수련을 잠시 멈췄습니다.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="저장 기록 다시 불러오기" onPress={retryLoad} style={s.primaryButton}><Text style={s.primaryButtonText}>다시 불러오기</Text></Pressable>
        </> : <><ActivityIndicator color={C.gold} /><Text style={s.loadingText}>당신의 강호를 펼치는 중</Text></>}
      </View> : (
        <View style={[s.body, !desktop && { flexDirection: 'column' }]}>
          {desktop && <View style={s.sidebar}>
            <Text style={s.sidebarLabel}>나의 강호</Text>
            {navigation(true)}
            <View style={s.wanderer}>
              <Text style={s.wandererGlyph}>俠</Text>
              <Text style={s.wandererName}>{game.name}</Text>
              <View style={s.rank}><View style={s.activeDot} /><Text style={s.rankText}>{REALMS[game.realm].name} · {game.mode === 'training' ? '수련 중' : '유람 중'}</Text></View>
              <View style={s.profileLine} />
              <View style={s.profileStat}><Text style={s.smallMuted}>전투력</Text><Text style={s.profileValue}>{format(stats.power)}</Text></View>
              <View style={s.profileStat}><Text style={s.smallMuted}>누적 승리</Text><Text style={s.profileValue}>{format(game.battleWins)} 회</Text></View>
            </View>
            <View style={s.sideFooter}><Feather size={15} color={C.muted} /><Text style={s.sideQuote}>서두르지 않아도 좋다.{ '\n' }모든 걸음이 강호가 된다.</Text></View>
          </View>}

          <ScrollView style={s.main} contentContainerStyle={[s.mainContent, !desktop && { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 26 }]}>
            <View style={s.breadcrumb}><View style={s.statusDot} /><Text style={s.breadcrumbText}>강호의 여명</Text><ChevronRight size={12} color={C.muted} /><Text style={s.breadcrumbCurrent}>{tabs.find(item => item.id === tab)!.label}</Text><View style={{ flex: 1 }} /><Text style={s.chapter}>제 일 장</Text></View>
            {saveStatus === 'error' && <Pressable accessibilityRole="button" accessibilityLabel="저장 재시도" onPress={retrySave} style={s.saveError}><Text style={s.saveErrorText}>기기에 저장하지 못했습니다. 여기를 눌러 다시 시도하세요.</Text></Pressable>}
            {tab === 'training' && <TrainingScreen {...props} />}
            {tab === 'world' && <WorldScreen {...props} />}
            {tab === 'techniques' && <TechniquesScreen {...props} />}
            {tab === 'journal' && <JournalScreen {...props} />}
            <View style={s.footer}><View style={s.footerSave}><Check size={12} color={C.muted} /><Text style={s.footerText}>{saveStatus === 'saved' ? '이 기기에 자동 저장' : '기기 저장 확인 필요'}</Text></View><Text style={s.footerText}>무림여록 · 첫 번째 이야기</Text></View>
          </ScrollView>
          {!desktop && <View style={s.bottomNav}>{navigation(false)}</View>}
        </View>
      )}

      <Modal visible={dialog !== null} transparent animationType="fade" onRequestClose={() => setDialog(null)}>
        <View style={s.modalBackdrop}><View style={s.dialog} accessibilityViewIsModal>
          <View style={s.dialogHeader}><Text style={s.eyebrow}>MURIM CHRONICLES</Text><Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={() => setDialog(null)} style={s.iconButton}><X size={21} color={C.muted} /></Pressable></View>
          <ScrollView contentContainerStyle={{ gap: 18 }}>
            {dialog === 'guide' && <>
              <Text style={s.dialogTitle}>한 걸음씩, 나의 강호</Text>
              <Text style={s.dialogBody}>접속해 있는 동안 내공이 쌓입니다. 수련에 집중해 경지를 돌파하고, 익힌 무공으로 더 넓은 세상을 만나세요.</Text>
              {[
                ['01', '수련하고 돌파하기', '운기조식은 자동으로 진행됩니다. 집중 수련으로 내공을 더 쌓고, 내공이 차면 경지를 돌파하세요.'],
                ['02', '강호에서 실력 겨루기', '청죽림에서 유람을 시작하면 2초마다 자동 전투가 진행됩니다. 승리하면 은전과 내공을 얻습니다.'],
                ['03', '무공을 익혀 강해지기', '은전으로 무공을 익히거나 강화하세요. 익힌 무공은 모두 능력을 높이고, 주력 무공은 추가 공격력을 줍니다.'],
              ].map(([n, title, body]) => <View key={n} style={s.guideRow}><Text style={s.guideNumber}>{n}</Text><View style={{ flex: 1, gap: 5 }}><Text style={s.guideTitle}>{title}</Text><Text style={s.dialogBody}>{body}</Text></View></View>)}
              <Text style={s.note}>자리를 비우면 최대 8시간의 내공 수련을 인정합니다. 재접속 시 전투는 멈추고 안전하게 수련으로 복귀합니다.</Text>
              <Pressable accessibilityRole="button" onPress={() => setDialog(null)} style={s.primaryButton}><Text style={s.primaryButtonText}>강호에 첫발 내딛기</Text><ChevronRight size={16} color={C.bg} /></Pressable>
            </>}
            {dialog === 'settings' && <>
              <Text style={s.dialogTitle}>여행자의 설정</Text>
              <View style={s.settingsCard}><Shield size={22} color={C.gold} /><View style={{ flex: 1, gap: 6 }}><Text style={s.guideTitle}>기기 자동 저장</Text><Text style={s.dialogBody}>진행 상황은 이 기기에 3초마다, 행동할 때마다 저장됩니다. 현재 계정 연동과 다른 기기 간 동기화는 지원하지 않습니다.</Text></View></View>
              <Text style={s.dialogBody}>앱을 삭제하거나 브라우저 데이터를 지우면 기록이 사라질 수 있습니다. 첫 버전에는 결제와 광고가 없습니다.</Text>
              <Pressable accessibilityRole="button" onPress={() => setDialog('guide')} style={s.secondaryButton}><Text style={s.secondaryButtonText}>게임 안내 다시 보기</Text><ChevronRight size={16} color={C.gold} /></Pressable>
              <Pressable accessibilityRole="button" onPress={() => setDialog('reset')} style={s.resetButton}><Text style={s.resetText}>모든 수련 기록 초기화</Text></Pressable>
              <Text style={s.note}>버전 0.1.0 · 플레이 가능한 개발 버전</Text>
            </>}
            {dialog === 'reset' && <>
              <Text style={s.dialogTitle}>새로운 길을 걸을까요?</Text>
              <Text style={s.dialogBody}>경지, 은전, 무공, 전투 기록이 모두 초기화됩니다. 초기화한 기록은 복구할 수 없습니다.</Text>
              <Pressable accessibilityRole="button" onPress={() => { reset(); setTab('training'); setDialog(null); }} style={[s.primaryButton, { backgroundColor: '#d5a398' }]}><Text style={s.primaryButtonText}>기록을 지우고 다시 시작</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => setDialog('settings')} style={s.secondaryButton}><Text style={s.secondaryButtonText}>기록 유지하기</Text></Pressable>
            </>}
          </ScrollView>
        </View></View>
      </Modal>

      <Modal visible={loaded && !!game.offlineReward && dialog === null} transparent animationType="fade" onRequestClose={() => act(claimOfflineRewards)}>
        <View style={s.modalBackdrop}><View style={s.dialog} accessibilityViewIsModal>
          <View style={s.offlineIcon}><Sparkles size={28} color={C.gold} strokeWidth={1.2} /></View>
          <Text style={[s.eyebrow, { textAlign: 'center', marginTop: 20 }]}>WHILE YOU WERE AWAY</Text>
          <Text style={[s.dialogTitle, { textAlign: 'center', marginVertical: 15 }]}>고요 속에서도, 성장</Text>
          <Text style={[s.dialogBody, { textAlign: 'center' }]}>자리를 비운 {Math.floor((game.offlineReward?.seconds ?? 0) / 60)}분 {(Math.floor(game.offlineReward?.seconds ?? 0) % 60)}초 동안{ '\n' }호흡은 흐트러지지 않았습니다.</Text>
          <View style={s.rewardBox}><Text style={s.smallMuted}>쌓인 내공</Text><Text style={s.rewardValue}>+{format(game.offlineReward?.cultivation ?? 0)}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="오프라인 보상 확인" onPress={() => act(claimOfflineRewards)} style={s.primaryButton}><Text style={s.primaryButtonText}>수련 이어가기</Text><ChevronRight size={17} color={C.bg} /></Pressable>
          <Text style={[s.note, { textAlign: 'center', marginTop: 16 }]}>내공에 반영되었습니다 · 최대 8시간 누적</Text>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return <SafeAreaProvider><Game /></SafeAreaProvider>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topbar: { borderBottomWidth: 1, borderBottomColor: C.line, backgroundColor: '#0a1915' },
  topbarInner: { width: '100%', maxWidth: 1350, alignSelf: 'center', paddingHorizontal: 38, height: 86, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  seal: { width: 34, height: 38, borderWidth: 1, borderColor: '#9b6b49', alignItems: 'center', justifyContent: 'center', backgroundColor: '#382b21' },
  sealText: { color: C.gold, fontSize: 24, fontFamily: serif },
  brandText: { color: C.ink, fontFamily: serif, fontSize: 22, letterSpacing: 2 },
  brandSub: { color: C.muted, fontSize: 7, letterSpacing: 2.2, marginTop: 5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  currency: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingRight: 14, marginRight: 4, borderRightWidth: 1, borderRightColor: C.line },
  currencyText: { color: C.ink, fontSize: 16, fontVariant: ['tabular-nums'] },
  currencyUnit: { color: C.muted, fontSize: 10 },
  iconButton: { padding: 9, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, flexDirection: 'row', width: '100%', maxWidth: 1350, alignSelf: 'center' },
  sidebar: { width: 218, borderRightWidth: 1, borderRightColor: C.line, paddingHorizontal: 24, paddingTop: 37 },
  sidebarLabel: { color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 20, paddingLeft: 12 },
  navList: { gap: 9 },
  sideTab: { paddingVertical: 17, paddingHorizontal: 12, borderRadius: 5, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: 'transparent' },
  sideTabActive: { backgroundColor: '#182b21', borderColor: '#3d4930' },
  navText: { color: C.muted, fontSize: 15, fontWeight: '500' },
  navSubtitle: { fontSize: 6, letterSpacing: 1.1, color: C.muted, marginTop: 6 },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.gold },
  wanderer: { borderTopWidth: 1, borderTopColor: C.line, paddingTop: 27, marginTop: 35, alignItems: 'center' },
  wandererGlyph: { color: C.gold, fontFamily: serif, fontSize: 32, width: 60, height: 60, textAlign: 'center', lineHeight: 60, borderWidth: 1, borderColor: '#3a4a34', borderRadius: 30, backgroundColor: '#13271f', overflow: 'hidden' },
  wandererName: { color: C.ink, fontSize: 13, marginTop: 13 },
  rank: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 9 },
  rankText: { color: C.muted, fontSize: 10 },
  profileLine: { height: 1, backgroundColor: C.line, width: '100%', marginVertical: 22 },
  profileStat: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 13 },
  smallMuted: { fontSize: 11, color: C.muted },
  profileValue: { fontSize: 12, color: C.ink },
  sideFooter: { marginTop: 30, gap: 12, paddingTop: 22, borderTopWidth: 1, borderTopColor: C.line },
  sideQuote: { color: '#718c7e', fontSize: 10, lineHeight: 20 },
  main: { flex: 1 },
  mainContent: { padding: 38, paddingTop: 30, gap: 25, width: '100%', maxWidth: 1132, alignSelf: 'center' },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#88b29a' },
  breadcrumbText: { color: C.muted, fontSize: 10 },
  breadcrumbCurrent: { color: C.ink, fontSize: 10 },
  chapter: { color: C.muted, fontSize: 10, letterSpacing: 3 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 20, gap: 8 },
  footerSave: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { color: '#6d897b', fontSize: 9 },
  bottomNav: { borderTopWidth: 1, borderTopColor: C.line, backgroundColor: '#0b1b16' },
  bottomList: { flexDirection: 'row', justifyContent: 'space-around', minHeight: 73 },
  bottomTab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, borderTopWidth: 2, borderTopColor: 'transparent' },
  bottomTabActive: { borderTopColor: C.gold, backgroundColor: '#12241c' },
  pressed: { opacity: 0.65 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  loadingText: { fontFamily: serif, color: C.muted, fontSize: 14 },
  modalBackdrop: { flex: 1, backgroundColor: '#020a08dc', padding: 24, alignItems: 'center', justifyContent: 'center' },
  dialog: { width: '100%', maxWidth: 470, maxHeight: '90%', padding: 27, borderWidth: 1, borderColor: '#4d5138', borderRadius: 12, backgroundColor: '#10231c' },
  dialogHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  eyebrow: { color: C.gold, letterSpacing: 2.2, fontSize: 8 },
  dialogTitle: { fontFamily: serif, color: C.ink, fontSize: 25, lineHeight: 36 },
  dialogBody: { color: C.muted, fontSize: 13, lineHeight: 23 },
  guideRow: { flexDirection: 'row', gap: 14 },
  guideNumber: { fontFamily: serif, fontSize: 18, color: C.gold, paddingTop: 2 },
  guideTitle: { color: C.ink, fontSize: 14, lineHeight: 20 },
  note: { color: '#7e9789', fontSize: 11, lineHeight: 20 },
  primaryButton: { borderRadius: 5, backgroundColor: C.gold, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 12, minHeight: 50 },
  primaryButtonText: { color: C.bg, fontSize: 14, fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderColor: '#465137', borderRadius: 5, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 12 },
  secondaryButtonText: { color: C.gold, fontSize: 13 },
  resetButton: { padding: 14, alignItems: 'center' },
  resetText: { color: '#cb9384', fontSize: 12 },
  settingsCard: { padding: 17, borderWidth: 1, borderColor: C.line, borderRadius: 6, flexDirection: 'row', gap: 13 },
  offlineIcon: { borderWidth: 1, borderColor: '#555538', alignSelf: 'center', width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  rewardBox: { padding: 22, marginVertical: 25, gap: 10, alignItems: 'center', borderWidth: 1, borderColor: C.line, borderRadius: 6 },
  rewardValue: { color: C.gold, fontSize: 32, fontFamily: serif },
  saveError: { borderWidth: 1, borderColor: '#754c40', padding: 12, borderRadius: 5 },
  saveErrorText: { fontSize: 12, lineHeight: 19, color: '#e5b3a1' },
});
