import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { ArrowUpRight, ArrowRight, CircleDot, Flame, Mountain, LockKeyhole, Swords, Shield, Heart, Sparkles, Wind, BookOpen, Check, ScrollText, Trophy, Coins, Feather } from 'lucide-react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Ellipse } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { REALMS, TECHNIQUES, REGIONS } from '../game/content';
import { GameState, getStats, getRealmProgress, getUpgradeCost } from '../game/engine';
import { colors as C, serif } from './theme';

export type ScreenProps = {
  state: GameState;
  onTrain: () => void;
  onBreakthrough: () => void;
  onExpedition: (id: string) => void;
  onReturn: () => void;
  onUpgrade: (id: string) => void;
  onEquip: (id: string) => void;
};

const number = (value: number) => Math.floor(value).toLocaleString('ko-KR');
const realmName = (index: number) => REALMS[index]?.name ?? '초입';

function Eyebrow({ children, color = C.gold }: { children: React.ReactNode; color?: string }) {
  return <Text style={[s.eyebrow, { color }]}>{children}</Text>;
}

function SectionHeading({ eyebrow, title, right }: { eyebrow: string; title: string; right?: React.ReactNode }) {
  return <View style={s.sectionHeading}><View style={{ gap: 7 }}><Eyebrow>{eyebrow}</Eyebrow><Text style={s.sectionTitle}>{title}</Text></View>{right}</View>;
}

function Button({ children, onPress, disabled = false, secondary = false, icon, accessibilityLabel }: { children: string; onPress: () => void; disabled?: boolean; secondary?: boolean; icon?: React.ReactNode; accessibilityLabel?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? children} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.buttonSecondary, disabled && s.buttonDisabled, pressed && !disabled && { opacity: 0.8, transform: [{ scale: 0.99 }] }]}><Text style={[s.buttonText, secondary && { color: C.gold }, disabled && { color: C.dim }]}>{children}</Text>{icon}</Pressable>;
}

function ProgressBar({ ratio, color = C.gold, height = 4 }: { ratio: number; color?: string; height?: number }) {
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(Math.max(0, Math.min(1, ratio)) * 100) }} style={[s.barTrack, { height }]}><View style={{ height, width: `${Math.max(0, Math.min(1, ratio)) * 100}%`, backgroundColor: color, borderRadius: 10 }} /></View>;
}

function Landscape({ variant = 0 }: { variant?: number }) {
  return <Svg width="100%" height="100%" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice">
    <Defs><SvgGradient id={`mist${variant}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#24483c" stopOpacity="0.4" /><Stop offset="1" stopColor="#071411" stopOpacity="0" /></SvgGradient></Defs>
    <Circle cx="445" cy="105" r="51" fill="#d4b77b" opacity="0.12" />
    <Circle cx="445" cy="105" r="44" fill="none" stroke="#d4b77b" opacity="0.42" strokeWidth="0.7" />
    <Path d="M-30 303 L34 225 L70 245 L144 102 L196 183 L232 157 L313 264 L372 192 L426 223 L488 147 L548 252 L628 196 L660 380 L-20 380 Z" fill={`url(#mist${variant})`} stroke="#416351" strokeWidth="0.7" opacity="0.75" />
    <Path d="M-30 303 L34 225 L70 245 L144 102 L135 166 L158 158 L184 213 L196 183 M232 157 L225 208 L245 201 L277 254 M488 147 L467 216 L490 203 L522 264" fill="none" stroke="#6e8b68" strokeWidth="0.6" opacity="0.5" />
    <Path d="M-10 332 L73 302 L130 315 L225 243 L295 298 L373 270 L452 321 L521 273 L620 305 L620 380 L-10 380 Z" fill="#122c23" stroke="#3d5e4a" strokeWidth="0.7" />
    <Path d="M-10 358 L61 344 L115 353 L202 318 L279 346 L327 328 L426 357 L498 326 L610 344 L620 380 L-10 380 Z" fill="#0b1b16" />
    <Path d="M394 254 Q460 243 504 252 M80 271 Q163 262 202 270 M285 322 Q357 309 424 320" fill="none" stroke="#99ad90" strokeWidth="0.7" opacity="0.28" />
    <Path d="M385 81 Q390 76 395 81 M405 69 Q410 65 415 69" fill="none" stroke="#d4b77b" opacity="0.5" />
  </Svg>;
}

function CultivationSeal({ ratio, compact = false }: { ratio: number; compact?: boolean }) {
  const circumference = 2 * Math.PI * 76;
  return <View style={[s.sealWrap, compact && { width: 150, height: 150 }]}>
    <Svg width={compact ? 150 : 224} height={compact ? 150 : 224} viewBox="0 0 224 224" style={StyleSheet.absoluteFill}>
      <Circle cx={112} cy={112} r={108} stroke="#254439" strokeWidth={0.7} fill="none" />
      <Circle cx={112} cy={112} r={97} stroke="#254439" strokeWidth={0.7} strokeDasharray="2 9" fill="none" />
      <Circle cx={112} cy={112} r={76} stroke="#294236" strokeWidth={2} fill="#10271e" />
      <Circle cx={112} cy={112} r={76} stroke={C.gold} strokeWidth={2.5} fill="none" strokeDasharray={`${circumference * Math.min(1, Math.max(0, ratio))} ${circumference}`} rotation={-90} origin="112,112" strokeLinecap="round" />
      <Circle cx={112} cy={112} r={65} stroke="#38513c" strokeWidth={0.7} fill="none" />
      <Path d="M112 2 L115 8 L112 14 L109 8 Z M112 210 L115 216 L112 222 L109 216 Z M2 112 L8 109 L14 112 L8 115 Z M210 112 L216 109 L222 112 L216 115 Z" fill={C.gold} opacity={0.5} />
      <Ellipse cx={112} cy={112} rx={88} ry={32} stroke="#6e825a" strokeWidth={0.5} fill="none" rotation={-35} origin="112,112" opacity={0.25} />
    </Svg>
    <Text style={[s.sealCharacter, compact && { fontSize: 42, lineHeight: 56 }]}>修</Text><Text style={s.sealCaption}>마음을 다스리다</Text>
  </View>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <View style={s.stat}><View style={s.statLabel}>{icon}<Text style={s.smallMuted}>{label}</Text></View><Text style={s.statValue}>{value}</Text></View>;
}

export function TrainingScreen(props: ScreenProps) {
  const { state, onTrain, onBreakthrough, onReturn } = props;
  const wide = useWindowDimensions().width >= 900;
  const stats = getStats(state);
  const progress = getRealmProgress(state);
  const maxRealm = state.realm >= REALMS.length - 1;
  const canBreakthrough = !maxRealm && state.cultivation >= progress.required;
  const nextRealm = REALMS[state.realm + 1];
  const technique = TECHNIQUES.find(item => item.id === state.equippedTechnique);
  return <View style={[s.screen, !wide && { gap: 16 }]}>
    <View style={[s.hero, !wide && { minHeight: 180 }]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { left: '28%', opacity: 0.8 }]}><Landscape /></View>
      <LinearGradient colors={['#11261ff0', '#11261f50', '#11261f00']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      <View style={[s.heroCopy, !wide && { padding: 20, gap: 10 }]}><View style={s.heroTag}><View style={s.goldDot} /><Text style={s.heroTagText}>한 걸음의 수련, 끝없는 강호</Text></View><Text style={[s.heroTitle, !wide && { fontSize: 26, lineHeight: 36 }]}>고요히 쌓아,{ '\n' }경지를 넘어서다.</Text>{wide && <Text style={s.heroDescription}>이름 없는 협객의 작은 시작.{ '\n' }오늘의 한 호흡이 내일의 전설이 됩니다.</Text>}<View style={[s.chapter, !wide && { marginTop: 0 }]}><View style={s.chapterLine} /><Text style={s.chapterText}>第一章 · 강호에 첫발을 딛다</Text></View></View>
      <View style={[s.heroStamp, !wide && { top: 16, right: 16 }]}><Text style={s.heroStampText}>初心</Text></View>
    </View>

    <View style={[s.columns, wide && { flexDirection: 'row' }]}>
      <View style={[s.mainColumn, wide && { flex: 1.45 }]}>
        <View style={[s.cultivationCard, !wide && { padding: 18 }]}>
          <View style={s.cardHeader}><View style={{ gap: 6 }}><Eyebrow>修鍊 · CULTIVATION</Eyebrow><Text style={s.cardTitle}>운기조식</Text></View><View style={s.livePill}><View style={[s.goldDot, { backgroundColor: state.mode === 'training' ? C.jade : C.gold }]} /><Text style={[s.pillText, { color: state.mode === 'training' ? C.jade : C.gold }]}>{state.mode === 'training' ? '자동 수련 중' : '강호 탐험 중'}</Text></View></View>
          <View style={[s.meditationArea, !wide && { paddingTop: 8, paddingBottom: 8 }]}><View style={s.meditationRule} /><CultivationSeal ratio={progress.ratio} compact={!wide} /><View style={s.meditationRule} /></View>
          <Text style={s.realmLabel}>{realmName(state.realm)}</Text>
          <Text style={[s.realmHint, !wide && { marginTop: 6, marginBottom: 12 }]}>{maxRealm ? '더 높은 강호는 다음 이야기에서 이어집니다.' : `다음 경지, ${nextRealm?.name}의 문턱을 향하여`}</Text>
          <View style={s.progressLabels}><Text style={s.smallMuted}>축적한 내공</Text><Text style={s.progressValue}>{number(state.cultivation)}<Text style={s.progressDenominator}>{maxRealm ? '' : ` / ${number(progress.required)}`}</Text></Text></View>
          <ProgressBar ratio={progress.ratio} />
          <View style={[s.cultivationRate, !wide && { paddingVertical: 8 }]}><Sparkles size={12} color={C.goldFaint} /><Text style={s.tinyMuted}>호흡마다 단단해지는 내공 · 수련 시 초당 +{stats.cultivationPerSecond.toFixed(1)}</Text></View>
          <View style={[s.actionRow, !wide && { flexWrap: 'wrap' }]}>
            <View style={{ flex: 1, minWidth: wide ? 140 : 120 }}><Button accessibilityLabel={state.mode === 'training' ? '호흡 가다듬기' : '수련으로 돌아오기'} onPress={state.mode === 'training' ? onTrain : onReturn} icon={<Wind size={16} color={C.background} />}>{state.mode === 'training' ? '호흡 가다듬기' : '수련으로 돌아오기'}</Button></View>
            <View style={{ flex: 1, minWidth: wide ? 140 : 120 }}><Button accessibilityLabel="경지 돌파" secondary onPress={onBreakthrough} disabled={!canBreakthrough} icon={<ArrowUpRight size={16} color={canBreakthrough ? C.gold : C.dim} />}>{maxRealm ? '최고 경지 달성' : '경지 돌파'}</Button></View>
          </View>
          <Text style={s.buttonHint}>{canBreakthrough ? '내공이 충만합니다. 새로운 경지에 도전하세요.' : maxRealm ? '지금의 경지로 강호에 이름을 남겨 보세요.' : `돌파까지 내공 ${number(Math.max(0, progress.required - state.cultivation))} 필요`}</Text>
        </View>
      </View>

      <View style={[s.sideColumn, wide && { flex: 1 }]}>
        <View style={s.card}>
          <SectionHeading eyebrow="俠客 · YOUR JOURNEY" title="협객의 길" right={<View style={s.miniSeal}><Text style={s.miniSealText}>俠</Text></View>} />
          <View style={s.identity}><View style={s.avatar}><Text style={s.avatarCharacter}>無</Text></View><View style={{ gap: 7 }}><Text style={s.playerName}>{state.name}</Text><Text style={s.smallMuted}>세상에 이름을 새길 자</Text><View style={s.realmBadge}><Text style={s.realmBadgeText}>{realmName(state.realm)}</Text></View></View></View>
          <View style={s.statGrid}><Stat icon={<Swords size={14} color={C.gold} />} label="공격" value={number(stats.attack)} /><Stat icon={<Shield size={14} color={C.jade} />} label="방어" value={number(stats.defense)} /><Stat icon={<Heart size={14} color={C.red} />} label="체력" value={number(stats.maxHp)} /><Stat icon={<Flame size={14} color={C.gold} />} label="전투력" value={number(stats.power)} /></View>
          <View style={s.equippedRow}><View style={s.smallIconBox}><Swords size={17} color={C.gold} /></View><View style={{ flex: 1, gap: 4 }}><Text style={s.tinyMuted}>현재 운용 중인 무공</Text><Text style={s.equippedName}>{technique?.name ?? '기초 검법'}</Text></View><Text style={s.levelText}>제 {state.techniqueLevels[state.equippedTechnique] ?? 1}성</Text></View>
        </View>
        <View style={s.noteCard}><View style={s.noteAccent} /><Text style={s.noteQuote}>“급히 오르려 하지 마라.{ '\n' }뿌리 깊은 나무가 바람을 견딘다.”</Text><Text style={s.noteAttribution}>— 이름 없는 노인의 가르침</Text><View style={s.noteFooter}><Feather size={13} color={C.goldFaint} /><Text style={s.tinyMuted}>자리를 비워도 수련은 이어집니다 · 최대 8시간</Text></View></View>
      </View>
    </View>
    <View style={s.pathFooter}><View style={s.pathFooterLine} /><Text style={s.pathFooterText}>강호는 서두르지 않는 이를 기다립니다.</Text><View style={s.pathFooterLine} /></View>
  </View>;
}

export function WorldScreen({ state, onExpedition, onReturn }: ScreenProps) {
  const wide = useWindowDimensions().width >= 900;
  const stats = getStats(state);
  const current = REGIONS.find(region => region.id === state.regionId) ?? REGIONS[0];
  return <View style={s.screen}>
    <View style={s.pageIntroduction}><Eyebrow>江湖 · THE WORLD</Eyebrow><Text style={s.pageTitle}>세상 밖으로,{ '\n' }한 걸음 더.</Text><Text style={s.pageDescription}>산문을 나서면 모든 만남이 수련이 됩니다.{ '\n' }자신의 경지에 맞는 길을 선택하세요.</Text></View>
    {state.mode === 'expedition' && current && <View style={s.battleCard}>
      <View style={s.cardHeader}><View style={{ gap: 6 }}><Eyebrow>交戰 · 자동 전투 진행 중</Eyebrow><Text style={s.cardTitle}>{current.name}</Text></View><Swords size={24} color={C.gold} /></View>
      <View style={s.battleVersus}><View style={s.combatant}><Text style={s.combatantName}>{state.name}</Text><Text style={s.tinyMuted}>체력 {number(state.hp)} / {number(stats.maxHp)}</Text><ProgressBar ratio={state.hp / stats.maxHp} color={C.jade} height={5} /></View><Text style={s.versus}>對</Text><View style={s.combatant}><Text style={[s.combatantName, { textAlign: 'right' }]}>{current.enemyName}</Text><Text style={[s.tinyMuted, { textAlign: 'right' }]}>체력 {number(state.enemyHp)} / {number(current.enemyHp)}</Text><ProgressBar ratio={state.enemyHp / current.enemyHp} color={C.red} height={5} /></View></View>
      <View style={s.battleFooter}><Text style={[s.smallMuted, { flex: 1 }]}>호흡을 맞추어 공격합니다.{ '\n' }승리하면 다음 상대와 겨룹니다.</Text><Pressable accessibilityRole="button" accessibilityLabel="탐험 종료하고 수련으로 돌아가기" onPress={onReturn} style={s.smallOutlineButton}><Text style={s.smallOutlineText}>수련으로 복귀</Text><ArrowRight size={14} color={C.gold} /></Pressable></View>
    </View>}
    <View style={s.regionGrid}>{REGIONS.map((region, index) => {
      const locked = state.realm < region.requiredRealm;
      const active = state.mode === 'expedition' && state.regionId === region.id;
      return <View key={region.id} style={[s.regionCard, wide && { width: '48%' }, locked && { opacity: 0.65 }, active && { borderColor: C.goldFaint }]}>
        <View style={s.regionArt}><Landscape variant={index + 1} /><View style={s.regionNumber}><Text style={s.regionNumberText}>0{index + 1}</Text></View><View style={s.regionCharacter}><Text style={s.regionCharacterText}>{['林', '谷', '山', '城'][index] ?? '路'}</Text></View></View>
        <View style={s.regionBody}><View style={s.cardHeader}><View style={{ gap: 5 }}><Eyebrow color={C.muted}>{region.subtitle}</Eyebrow><Text style={s.cardTitle}>{region.name}</Text></View>{locked ? <LockKeyhole size={18} color={C.dim} /> : <Mountain size={21} color={C.gold} />}</View><Text style={s.regionDescription}>{region.description}</Text><View style={s.regionRewards}><View style={s.rewardItem}><Coins size={13} color={C.gold} /><Text style={s.rewardText}>은전 +{number(region.rewardSilver)}</Text></View><View style={s.rewardItem}><Sparkles size={13} color={C.jade} /><Text style={s.rewardText}>내공 +{number(region.rewardCultivation)}</Text></View></View><Button accessibilityLabel={`${region.name} 탐험`} onPress={() => onExpedition(region.id)} secondary={!active} disabled={locked || active} icon={locked ? <LockKeyhole size={14} color={C.dim} /> : <ArrowUpRight size={16} color={active ? C.dim : C.gold} />}>{locked ? `${realmName(region.requiredRealm)} 경지부터 입장` : active ? '현재 탐험 중' : '길을 나서다'}</Button></View>
      </View>;
    })}</View>
    <View style={s.inlineNote}><Shield size={16} color={C.muted} /><Text style={[s.smallMuted, { flex: 1 }]}>패배하면 체력을 회복하며 수련으로 돌아갑니다. 먼저 무공을 강화하면 더 멀리 나아갈 수 있습니다.</Text></View>
  </View>;
}

const techniqueIcons = [Swords, CircleDot, Wind, Flame];

export function TechniquesScreen({ state, onUpgrade, onEquip }: ScreenProps) {
  const wide = useWindowDimensions().width >= 900;
  return <View style={s.screen}>
    <View style={s.pageIntroduction}><Eyebrow>武功 · MARTIAL ARTS</Eyebrow><Text style={s.pageTitle}>백 번의 초식보다,{ '\n' }깊이 있는 한 수.</Text><Text style={s.pageDescription}>익숙한 초식을 벼리고 자신만의 길을 찾으세요.{ '\n' }은전으로 무공을 강화하고, 주력 무공을 운용합니다.</Text></View>
    <View style={s.techniqueIntro}><View style={s.smallIconBox}><BookOpen size={18} color={C.gold} /></View><View style={{ flex: 1, gap: 5 }}><Text style={s.equippedName}>수련은 모든 무공에 남습니다</Text><Text style={s.smallMuted}>강화한 무공은 능력치에 반영되며, 운용 무공은 전투의 중심이 됩니다.</Text></View></View>
    <View style={s.regionGrid}>{TECHNIQUES.map((technique, index) => {
      const level = state.techniqueLevels[technique.id] ?? 0;
      const equipped = state.equippedTechnique === technique.id;
      const cost = getUpgradeCost(state, technique.id);
      const canAfford = state.silver >= cost;
      const mastered = level >= 30;
      const Icon = techniqueIcons[index % techniqueIcons.length];
      return <View key={technique.id} style={[s.techniqueCard, wide && { width: '48%' }, equipped && { borderColor: '#6a6445' }]}>
        <View style={s.cardHeader}><View style={[s.techniqueIcon, equipped && { backgroundColor: '#292d1f', borderColor: '#665d3c' }]}><Icon size={27} color={equipped ? C.gold : C.muted} strokeWidth={1.3} /></View><View style={{ flex: 1, gap: 7 }}><Text style={s.techniqueCategory}>{technique.category} · MARTIAL ART 0{index + 1}</Text><Text style={s.techniqueName}>{technique.name}</Text></View>{equipped && <View style={s.equippedPill}><Check size={10} color={C.gold} /><Text style={s.equippedPillText}>운용 중</Text></View>}</View>
        <Text style={s.techniqueDescription}>{technique.description}</Text>
        <View style={s.techniqueLevel}><Text style={s.smallMuted}>수련 깊이</Text><Text style={s.techniqueLevelValue}>{level > 0 ? `제 ${level}성` : '미수련'}</Text></View>
        <ProgressBar ratio={level / 30} />
        <View style={s.techniqueActions}><View style={{ flex: 1 }}><Button accessibilityLabel={`${technique.name} ${level ? '강화' : '수련'}`} onPress={() => onUpgrade(technique.id)} disabled={!canAfford || mastered} icon={mastered ? <Check size={14} color={C.dim} /> : <Coins size={14} color={canAfford ? C.background : C.dim} />}>{mastered ? '대성 · 최고 성취' : `${level ? '무공 강화' : '무공 수련'} · ${number(cost)}`}</Button></View><Pressable accessibilityRole="button" accessibilityLabel={`${technique.name} 운용`} accessibilityState={{ disabled: equipped || level === 0 }} disabled={equipped || level === 0} onPress={() => onEquip(technique.id)} style={({ pressed }) => [s.equipButton, (equipped || level === 0) && { opacity: 0.4 }, pressed && { opacity: 0.6 }]}><Text style={s.smallOutlineText}>{equipped ? '운용 중' : '운용'}</Text></Pressable></View>
        {!canAfford && !mastered && <Text style={s.costHint}>은전 {number(Math.max(0, cost - state.silver))}이 더 필요합니다. 강호에서 모아 보세요.</Text>}
      </View>;
    })}</View>
  </View>;
}

export function JournalScreen({ state }: ScreenProps) {
  const wide = useWindowDimensions().width >= 900;
  const milestones = [
    { title: '첫 호흡', detail: '협객의 길을 시작하다', done: true, character: '始' },
    { title: '문턱을 넘다', detail: '첫 번째 경지 돌파', done: state.realm >= 1, character: '境' },
    { title: '강호의 첫 승', detail: '자동 전투에서 1회 승리', done: state.battleWins >= 1, character: '勝' },
    { title: '벼린 한 수', detail: '무공 하나를 제 5성까지 강화', done: Object.values(state.techniqueLevels).some(level => level >= 5), character: '武' },
    { title: '백전의 협객', detail: '강호에서 100회 승리', done: state.battleWins >= 100, character: '俠' },
  ];
  return <View style={s.screen}>
    <View style={s.pageIntroduction}><Eyebrow>旅錄 · YOUR CHRONICLE</Eyebrow><Text style={s.pageTitle}>이름 없는 날들도,{ '\n' }전설의 한 페이지.</Text><Text style={s.pageDescription}>쌓아 온 수련과 지나온 싸움.{ '\n' }당신이 걸어온 길을 기록합니다.</Text></View>
    <View style={[s.columns, wide && { flexDirection: 'row' }]}>
      <View style={[s.card, { flex: 1.4 }]}><SectionHeading eyebrow="足跡 · FOOTPRINTS" title="강호의 기록" right={<ScrollText size={22} color={C.goldFaint} />} /><View style={s.journalStats}><View style={s.journalStat}><Text style={s.journalStatValue}>{number(state.battleWins)}</Text><Text style={s.smallMuted}>승리한 대결</Text></View><View style={s.journalStatDivider} /><View style={s.journalStat}><Text style={s.journalStatValue}>{realmName(state.realm)}</Text><Text style={s.smallMuted}>지금의 경지</Text></View><View style={s.journalStatDivider} /><View style={s.journalStat}><Text style={s.journalStatValue}>{number(state.defeats)}</Text><Text style={s.smallMuted}>다시 일어선 날</Text></View></View><View style={s.logList}>{[...state.logs].reverse().map((event, index) => <View key={event.id} style={s.logRow}><View style={s.logRail}><View style={[s.logDot, { backgroundColor: event.tone === 'good' ? C.gold : event.tone === 'danger' ? C.red : C.dim }]} />{index < state.logs.length - 1 && <View style={s.logLine} />}</View><View style={s.logContent}><Text style={[s.logText, event.tone === 'good' && { color: C.gold }, event.tone === 'danger' && { color: C.red }]}>{event.text}</Text><Text style={s.logLabel}>{event.tone === 'good' ? '성장의 순간' : event.tone === 'danger' ? '다음 걸음을 위한 쉼' : '강호의 하루'}</Text></View></View>)}</View></View>
      <View style={[s.card, { flex: 1 }]}><SectionHeading eyebrow="里程 · MILESTONES" title="길 위의 이정표" right={<Trophy size={21} color={C.goldFaint} />} /><View style={s.milestones}>{milestones.map(item => <View key={item.title} style={[s.milestone, !item.done && { opacity: 0.48 }]}><View style={[s.milestoneSeal, item.done && { borderColor: C.goldFaint, backgroundColor: '#252b1d' }]}><Text style={[s.milestoneCharacter, item.done && { color: C.gold }]}>{item.character}</Text></View><View style={{ flex: 1, gap: 6 }}><Text style={s.milestoneTitle}>{item.title}</Text><Text style={s.tinyMuted}>{item.detail}</Text></View>{item.done ? <Check size={15} color={C.gold} /> : <LockKeyhole size={13} color={C.dim} />}</View>)}</View><Text style={s.milestoneNote}>작은 성취가 모여 하나의 무림여록이 됩니다.</Text></View>
    </View>
  </View>;
}

const s = StyleSheet.create({
  screen: { gap: 24 },
  eyebrow: { fontSize: 9, fontWeight: '600', letterSpacing: 2.3, lineHeight: 15 },
  hero: { minHeight: 290, backgroundColor: '#11261f', borderWidth: 1, borderColor: C.border, borderRadius: 5, overflow: 'hidden', justifyContent: 'center' },
  heroCopy: { padding: 30, gap: 20 },
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  goldDot: { width: 4, height: 4, borderRadius: 4, backgroundColor: C.gold },
  heroTagText: { color: C.gold, fontSize: 10, letterSpacing: 1.4 },
  heroTitle: { fontFamily: serif, color: C.text, fontSize: 36, lineHeight: 51, letterSpacing: -1.6 },
  heroDescription: { color: C.muted, fontSize: 12, lineHeight: 22 },
  chapter: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 3 },
  chapterLine: { width: 24, height: 1, backgroundColor: C.goldFaint },
  chapterText: { color: C.goldFaint, fontSize: 10, letterSpacing: 1 },
  heroStamp: { position: 'absolute', right: 22, top: 25, borderWidth: 1, borderColor: '#885547', padding: 5, backgroundColor: '#67392b33' },
  heroStampText: { color: '#b37964', fontFamily: serif, fontSize: 13, letterSpacing: 3 },
  columns: { gap: 20 },
  mainColumn: { gap: 20 },
  sideColumn: { gap: 20 },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 5, padding: 24 },
  cultivationCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 5, padding: 24 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cardTitle: { fontFamily: serif, fontSize: 21, color: C.text, letterSpacing: -0.6 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 9 },
  pillText: { fontSize: 9 },
  meditationArea: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, paddingTop: 24, paddingBottom: 14 },
  meditationRule: { flex: 1, height: 1, backgroundColor: C.border },
  sealWrap: { width: 224, height: 224, alignItems: 'center', justifyContent: 'center' },
  sealCharacter: { fontFamily: serif, fontSize: 56, lineHeight: 75, color: C.gold, marginTop: 2 },
  sealCaption: { fontSize: 8, letterSpacing: 2, color: C.goldFaint },
  realmLabel: { textAlign: 'center', fontFamily: serif, fontSize: 23, color: C.text, letterSpacing: 3 },
  realmHint: { textAlign: 'center', fontSize: 10, color: C.muted, marginTop: 9, marginBottom: 28 },
  progressLabels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  smallMuted: { color: C.muted, fontSize: 11, lineHeight: 18 },
  tinyMuted: { color: C.muted, fontSize: 10, lineHeight: 17 },
  progressValue: { fontSize: 12, fontWeight: '600', color: C.gold, fontVariant: ['tabular-nums'] },
  progressDenominator: { color: C.dim, fontWeight: '400', fontSize: 10 },
  barTrack: { borderRadius: 10, backgroundColor: '#253b30', width: '100%', overflow: 'hidden' },
  cultivationRate: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  button: { minHeight: 46, borderRadius: 3, backgroundColor: C.gold, paddingHorizontal: 15, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: C.gold },
  buttonText: { color: C.background, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  buttonSecondary: { backgroundColor: 'transparent', borderColor: '#5b583c' },
  buttonDisabled: { backgroundColor: '#12271f', borderColor: C.border },
  buttonHint: { color: C.goldFaint, fontSize: 9, lineHeight: 17, textAlign: 'center', marginTop: 12 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 15, marginBottom: 25 },
  sectionTitle: { fontFamily: serif, fontSize: 21, color: C.text, letterSpacing: -0.6 },
  miniSeal: { borderWidth: 1, borderColor: '#526044', width: 25, height: 30, alignItems: 'center', justifyContent: 'center' },
  miniSealText: { color: C.goldFaint, fontSize: 14, fontFamily: serif },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 25 },
  avatar: { width: 65, height: 75, borderWidth: 1, borderColor: '#4d5e40', backgroundColor: '#1a3023', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  avatarCharacter: { fontFamily: serif, fontSize: 29, color: C.gold, opacity: 0.85 },
  playerName: { color: C.text, fontSize: 20, fontFamily: serif },
  realmBadge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#3e5038', backgroundColor: '#253020', paddingHorizontal: 8, paddingVertical: 4 },
  realmBadgeText: { fontSize: 9, color: C.gold },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 5, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.border, marginBottom: 20 },
  stat: { width: '50%', paddingVertical: 13 },
  statLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { color: C.text, fontFamily: serif, fontSize: 24, marginTop: 6, fontVariant: ['tabular-nums'] },
  equippedRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  smallIconBox: { width: 36, height: 40, backgroundColor: '#1c3023', borderWidth: 1, borderColor: '#394d34', alignItems: 'center', justifyContent: 'center', borderRadius: 3 },
  equippedName: { color: C.text, fontSize: 12, lineHeight: 20 },
  levelText: { color: C.gold, fontSize: 10 },
  noteCard: { backgroundColor: '#10231c', borderWidth: 1, borderColor: C.border, borderRadius: 5, padding: 24, overflow: 'hidden' },
  noteAccent: { position: 'absolute', top: 25, bottom: 68, width: 2, left: 0, backgroundColor: C.goldFaint },
  noteQuote: { color: '#c4c7ad', fontFamily: serif, fontSize: 14, lineHeight: 27 },
  noteAttribution: { color: C.goldFaint, fontSize: 9, marginTop: 12 },
  noteFooter: { flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 22, paddingTop: 15, borderTopWidth: 1, borderColor: C.border },
  pathFooter: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  pathFooterLine: { flex: 1, height: 1, backgroundColor: '#1a3025' },
  pathFooterText: { color: C.dim, fontSize: 9, letterSpacing: 0.5 },
  pageIntroduction: { paddingTop: 12, paddingBottom: 8, gap: 16 },
  pageTitle: { color: C.text, fontFamily: serif, fontSize: 31, lineHeight: 46, letterSpacing: -1 },
  pageDescription: { color: C.muted, fontSize: 12, lineHeight: 22 },
  battleCard: { padding: 24, gap: 26, backgroundColor: '#172b21', borderWidth: 1, borderColor: '#5d6241', borderRadius: 5 },
  battleVersus: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  combatant: { flex: 1, gap: 10 },
  combatantName: { fontSize: 13, color: C.text },
  versus: { fontFamily: serif, color: C.goldFaint, fontSize: 26, paddingTop: 10 },
  battleFooter: { borderTopWidth: 1, borderColor: '#354936', paddingTop: 17, flexDirection: 'row', alignItems: 'center', gap: 12 },
  smallOutlineButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#526044', paddingVertical: 11, paddingHorizontal: 12, borderRadius: 3 },
  smallOutlineText: { fontSize: 10, color: C.gold },
  regionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between' },
  regionCard: { width: '100%', borderWidth: 1, borderColor: C.border, borderRadius: 5, backgroundColor: C.card, overflow: 'hidden' },
  regionArt: { height: 155, overflow: 'hidden', backgroundColor: '#10271e', borderBottomWidth: 1, borderColor: C.border },
  regionNumber: { position: 'absolute', left: 20, top: 17 },
  regionNumberText: { color: C.goldFaint, fontFamily: serif, fontSize: 13 },
  regionCharacter: { position: 'absolute', right: 22, bottom: 13 },
  regionCharacterText: { color: C.goldFaint, fontFamily: serif, fontSize: 42, opacity: 0.7 },
  regionBody: { padding: 23, gap: 17 },
  regionDescription: { color: C.muted, fontSize: 11, lineHeight: 20, minHeight: 40 },
  regionRewards: { flexDirection: 'row', gap: 18, marginBottom: 4 },
  rewardItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rewardText: { color: '#a7b59d', fontSize: 10 },
  inlineNote: { padding: 18, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#0b1d17', borderWidth: 1, borderColor: '#1a3227', borderRadius: 4 },
  techniqueIntro: { padding: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, flexDirection: 'row', gap: 13, alignItems: 'center', borderRadius: 5 },
  techniqueCard: { width: '100%', borderWidth: 1, borderColor: C.border, backgroundColor: C.card, borderRadius: 5, padding: 23 },
  techniqueIcon: { width: 52, height: 62, borderWidth: 1, borderColor: C.border, backgroundColor: '#152b21', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  techniqueCategory: { fontSize: 8, color: C.goldFaint, letterSpacing: 1.2 },
  techniqueName: { fontFamily: serif, color: C.text, fontSize: 21 },
  equippedPill: { flexDirection: 'row', gap: 3, borderWidth: 1, borderColor: '#5c5b3f', paddingVertical: 5, paddingHorizontal: 6, borderRadius: 3, alignItems: 'center' },
  equippedPillText: { fontSize: 8, color: C.gold },
  techniqueDescription: { fontSize: 11, lineHeight: 21, color: C.muted, marginTop: 23, minHeight: 48 },
  techniqueLevel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  techniqueLevelValue: { color: C.gold, fontSize: 11 },
  techniqueActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  equipButton: { width: 68, minHeight: 46, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#4a543a', borderRadius: 3 },
  costHint: { fontSize: 9, color: C.goldFaint, marginTop: 10, lineHeight: 16 },
  journalStats: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.border, paddingVertical: 20, marginBottom: 30, gap: 8 },
  journalStat: { flex: 1, alignItems: 'center', gap: 7 },
  journalStatValue: { color: C.gold, fontFamily: serif, fontSize: 21 },
  journalStatDivider: { width: 1, height: 30, backgroundColor: C.border },
  logList: { gap: 0 },
  logRow: { flexDirection: 'row', gap: 14, minHeight: 64 },
  logRail: { width: 8, alignItems: 'center', paddingTop: 6 },
  logDot: { width: 5, height: 5, borderRadius: 5 },
  logLine: { width: 1, flex: 1, backgroundColor: C.border, marginTop: 5, marginBottom: 1 },
  logContent: { flex: 1, gap: 7, paddingBottom: 19 },
  logText: { color: '#bbc7b8', fontSize: 11, lineHeight: 20 },
  logLabel: { color: C.dim, fontSize: 9 },
  milestones: { gap: 20 },
  milestone: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  milestoneSeal: { width: 39, height: 47, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  milestoneCharacter: { fontFamily: serif, fontSize: 23, color: C.dim },
  milestoneTitle: { color: C.text, fontSize: 12 },
  milestoneNote: { fontFamily: serif, fontSize: 11, color: C.goldFaint, lineHeight: 21, marginTop: 28, borderTopWidth: 1, borderColor: C.border, paddingTop: 18 },
});
