import React, { memo, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, StyleSheet, View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { GameState, getStats } from '../../game/engine';
import { REGIONS } from '../../game/content';

export type PixelSceneProps = { state: GameState; height?: number };

// Original pixel tiles and characters. The scene is drawn on a 384 × 256 grid.
const W = 384;
const H = 256;
type Palette = Record<string, string>;
const heroPalette: Palette = {
  '.': 'transparent', x: '#182527', h: '#202a31', t: '#454643',
  f: '#c98959', l: '#f1c88a', a: '#ffe1a4', b: '#263f58',
  c: '#466b7b', d: '#698a91', w: '#d8e0c8', v: '#9baead',
  r: '#9d3e3e', R: '#d35c4d', g: '#17232c', s: '#83979d',
};
const heroRows = [
  '..........hhhh..............',
  '.........httthhh............',
  '........hhtttthhh...hhh.....',
  '.......hhttttthhhhhhth......',
  '.......httttttthhhhh........',
  '.......httttllllhx..........',
  '.......httllllllax..........',
  '.......hhflllhllax..........',
  '........hfllllllax..........',
  '........xffllllax...........',
  '.........xffffax............',
  '......vvvvwwwwww............',
  '..vvvvwwwwwwwwwvx...........',
  'wwwwwwvvxbbccccbx...........',
  'vvvv....xbbccccbbx..........',
  '.......xbbcddddcbbxf........',
  '.......xbbccccccbbxlaf......',
  '.......xbbccccccbbxflaf.....',
  '.......xbbbccccbbbx.xff.....',
  '.......xxrRRRRRrrxx........',
  '.......xbrRRRRRrbx..........',
  '......xbbbbcccccbbx.........',
  '......xbbbccccccbbbx........',
  '.....xbbbcccccccbbbbx.......',
  '.....xbbbbccccccbbbbx.......',
  '.....xxgggxxxxggggxxx.......',
  '......xggx....xgggx.........',
  '.....xssgx....xgsssx........',
];
const banditPalette: Palette = {
  '.': 'transparent', x: '#182923', h: '#4a3826', H: '#79603c',
  f: '#c7925b', l: '#e5b878', e: '#233128', r: '#ab5740',
  g: '#4b6b39', G: '#709846', L: '#a4b35a', b: '#735a35',
  s: '#b9bba5', d: '#6f867d',
};
const banditRows = [
  '........hhhhh.........',
  '.......hHHHHHh........',
  '.....hhHHHHHHHhh......',
  '....hHHHHHHHHHHHh.....',
  '...hHHHHHHHHHHHHHh....',
  '..hhhhhhhhhhhhhhhh....',
  '......xllllllx........',
  '......xfellelx........',
  '......xflllllx........',
  '......xxffllxx........',
  '.......xrrrrx.........',
  '.....xxgGGGGgx........',
  '....xgGGLLGGGgx.......',
  '...xfgGLLGGGGGgx......',
  '..xlfxgGGGGGGGgxf.....',
  '..xffxgGGGGGGGgxlf....',
  '.....xgbbbbbbbgxlf....',
  '.....xgbbbbbbbgxfx....',
  '.....xggGGGGGggx......',
  '....xgggGGGGGgggx.....',
  '....xggggGGGggggx.....',
  '....xxxxggxggxxxx.....',
  '.....xbbbx.xbbbx......',
  '....xbbbbx.xbbbbx.....',
];

export const PixelHero = memo(function PixelHero({ x = 0, y = 0, scale = 2 }: { x?: number; y?: number; scale?: number }) {
  return <G transform={`translate(${x} ${y}) scale(${scale})`}>
    <PixelBitmap rows={heroRows} palette={heroPalette} />
    <Path d="M23 15h2v-2h2v-2h2V9h2V7h2V5h2V3h2V1h2v4h-2v2h-2v2h-2v2h-2v2h-2v2h-2v2h-2v2h-2Z" fill="#8aa6ac" />
    <Path d="M25 14h2v-2h2v-2h2V8h2V6h2V4h2V2h1v3h-2v2h-2v2h-2v2h-2v2h-2v2h-2Z" fill="#d5e3cd" />
    <Path d="M22 16h2v2h2v2h-2v-1h-2v-2h-2v-1Z" fill="#bda266" />
  </G>;
});

export const PixelBandit = memo(function PixelBandit({ x = 0, y = 0, scale = 2, faded = false }: { x?: number; y?: number; scale?: number; faded?: boolean }) {
  return <G transform={`translate(${x} ${y}) scale(${scale})`} opacity={faded ? 0.75 : 1}>
    <PixelBitmap rows={banditRows} palette={banditPalette} />
    <Path d="M2 16H0v-5h1V7h2v7h2v3H3v4H1v-3h1Z" fill="#506960" />
    <Path d="M0 12V8h1V5h2v8H2v2H1v-3Z" fill="#c1c4a1" />
    <Rect x={1} y={17} width={2} height={5} fill="#6c4d31" />
  </G>;
});

function PixelBitmap({ rows, palette }: { rows: readonly string[]; palette: Palette }) {
  return <>{rows.flatMap((row, y) => Array.from(row).flatMap((cell, x) => cell === '.' || !palette[cell]
    ? [] : <Rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={palette[cell]} />))}</>;
}

function Bamboo({ x, y, height, dark = false }: { x: number; y: number; height: number; dark?: boolean }) {
  return <G>
    <Rect x={x} y={y} width={5} height={height} fill={dark ? '#193f35' : '#376d47'} />
    <Rect x={x + 1} y={y} width={2} height={height} fill={dark ? '#275844' : '#6c9659'} />
    {Array.from({ length: Math.ceil(height / 23) }, (_, i) => <G key={i}>
      <Rect x={x - 1} y={y + i * 23} width={7} height={2} fill={dark ? '#123b32' : '#2a583d'} />
      {i % 2 === 0 && <G>
        <Path d={`M${x + 3} ${y + i * 23 + 2}h7v-3h9v-3h8v-3h9v3h-6v4h-9v3h-9v3h-9Z`} fill={dark ? '#23503c' : '#3d754c'} />
        <Path d={`M${x + 3} ${y + i * 23 + 2}h-6v-4h-8v-3h-8v-3h-5v4h6v4h8v3h8Z`} fill={dark ? '#1d4938' : '#4c8351'} />
      </G>}
    </G>)}
  </G>;
}

function Masonry({ x, y, width, height, dark = false }: { x: number; y: number; width: number; height: number; dark?: boolean }) {
  const rows = Math.ceil(height / 13);
  const palette = dark ? ['#34443c', '#3d4c42', '#414f44', '#35463e'] : ['#526356', '#5e6c58', '#68715d', '#4b5c50'];
  return <G>
    <Rect x={x} y={y} width={width} height={height} fill={dark ? '#25372f' : '#35483d'} />
    {Array.from({ length: rows }, (_, row) => Array.from({ length: Math.ceil(width / 24) + 1 }, (_, column) => {
      const left = x + column * 24 - (row % 2) * 12;
      const start = Math.max(x, left);
      const end = Math.min(x + width, left + 22);
      const tileHeight = Math.min(11, y + height - (y + row * 13));
      if (end <= start || tileHeight <= 0) return null;
      return <G key={`${row}-${column}`}>
        <Rect x={start} y={y + row * 13} width={end - start} height={tileHeight} fill={palette[(row * 3 + column * 7) % palette.length]} />
        <Rect x={start + 1} y={y + row * 13} width={Math.max(0, end - start - 2)} height={1} fill={dark ? '#536047' : '#7b8064'} opacity={0.5} />
        {(row + column) % 4 === 0 && <Rect x={start + 3} y={y + row * 13 + 6} width={3} height={1} fill="#233c31" />}
      </G>;
    }))}
  </G>;
}

function GuardianPillar({ x, y, height }: { x: number; y: number; height: number }) {
  return <G>
    <Rect x={x + 4} y={y + 4} width={28} height={height - 3} fill="#243c31" />
    <Rect x={x} y={y} width={28} height={height} fill="#6f775f" />
    <Rect x={x + 2} y={y} width={5} height={height} fill="#879071" />
    <Rect x={x + 24} y={y} width={4} height={height} fill="#495e4a" />
    {Array.from({ length: 3 }, (_, i) => <G key={i}>
      <Rect x={x - 3} y={y + 6 + i * 47} width={34} height={5} fill="#435946" />
      <Rect x={x - 2} y={y + 6 + i * 47} width={32} height={2} fill="#a0a17b" />
      <Path d={`M${x + 9} ${y + 17 + i * 47}h10v3h4v13h-4v4h-10v-4h-4v-13h4Z`} fill="#4b5f49" />
      <Rect x={x + 8} y={y + 20 + i * 47} width={12} height={12} fill="#7d8767" />
      <Rect x={x + 9} y={y + 23 + i * 47} width={3} height={3} fill="#344d3b" />
      <Rect x={x + 16} y={y + 23 + i * 47} width={3} height={3} fill="#344d3b" />
      <Rect x={x + 12} y={y + 27 + i * 47} width={4} height={2} fill="#4b5f49" />
      <Rect x={x + 8} y={y + 34 + i * 47} width={12} height={2} fill="#a0a17b" />
    </G>)}
    <Rect x={x - 4} y={y + height - 8} width={36} height={6} fill="#435742" />
    <Rect x={x - 5} y={y + height - 8} width={38} height={2} fill="#879071" />
  </G>;
}

function Bush({ x, y, scale = 1, dark = false }: { x: number; y: number; scale?: number; dark?: boolean }) {
  const shadow = dark ? '#132f2b' : '#1b4933';
  const mid = dark ? '#204a37' : '#326d40';
  const bright = dark ? '#376545' : '#70974c';
  return <G transform={`translate(${x} ${y}) scale(${scale})`}>
    <Path d="M0 22h4V12h7V8h9V3h10V0h12v6h10v8h7v9h5v18H0Z" fill={shadow} />
    <Path d="M4 20h7v-7h9V8h12V5h10v8h10v8h6v12H4Z" fill={mid} />
    <Path d="M10 18h7v-5h10V9h10v6h-8v5h-9v5H9ZM36 18h9v4h7v5H40v-3h-8v-4h4ZM19 29h8v-4h8v8h-9v5h-7Z" fill={bright} />
    <Path d="M13 17h4v-4h5v4h-5v4h-4ZM31 9h5v4h-5ZM44 23h5v4h-5ZM22 29h5v4h-5Z" fill={dark ? '#4d7750' : '#a6b768'} />
    <Rect x={5} y={31} width={5} height={4} fill="#163f2c" />
    <Rect x={35} y={31} width={7} height={3} fill="#163f2c" />
  </G>;
}

const Scenery = memo(function Scenery() {
  return <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
    <Rect width={W} height={H} fill="#83bfbd" />
    <Path d="M0 42h28V30h20V17h17V9h14v9h14v13h22v15h24v9h31V38h22V23h19v-9h17V4h19v10h15v13h16v15h25V31h24V17h17v10h16v18h27v37H0Z" fill="#6ba5a0" />
    <Path d="M0 83h22V71h20V53h19V40h17v13h13v17h19v13h29V66h25V54h24v15h17v15h24V68h19V54h18v-9h16v13h18v14h23v16h21V70h19v-9h20v80H0Z" fill="#508a7f" />
    <Rect x={238} y={57} width={75} height={2} fill="#a8d3c5" opacity={0.45} />
    <Rect x={269} y={62} width={57} height={2} fill="#a8d3c5" opacity={0.45} />
    <Rect x={282} y={86} width={85} height={3} fill="#a8d3c5" opacity={0.25} />
    <Bamboo x={310} y={39} height={178} dark />
    <Bamboo x={329} y={15} height={202} />
    <Bamboo x={355} y={32} height={190} />
    <Bamboo x={378} y={4} height={223} dark />
    <Bamboo x={293} y={70} height={152} dark />
    <Bush x={280} y={130} scale={1.3} dark />
    <Bush x={334} y={119} scale={1.15} />
    <Rect x={30} y={11} width={80} height={196} fill="#263d33" />
    <Masonry x={29} y={19} width={83} height={188} />
    <Masonry x={201} y={34} width={81} height={170} dark />
    <Masonry x={107} y={37} width={101} height={38} dark />
    <Rect x={12} y={31} width={110} height={9} fill="#314c40" />
    <Rect x={13} y={29} width={107} height={4} fill="#78866a" />
    <Rect x={19} y={25} width={94} height={4} fill="#9aa27d" />
    <Rect x={35} y={8} width={70} height={7} fill="#485e4e" />
    <Rect x={31} y={15} width={79} height={4} fill="#879172" />
    <Path d="M109 75h91v130h-11V94h-7V84h-54v10h-9v111h-10Z" fill="#253b31" />
    <Path d="M112 78h86v128h-12V95h-8V87h-46v8h-9v110h-11Z" fill="#758069" />
    <Rect x={122} y={89} width={5} height={109} fill="#9aa181" />
    <Rect x={182} y={95} width={5} height={110} fill="#485c48" />
    <Rect x={119} y={72} width={72} height={8} fill="#91977a" />
    <Rect x={124} y={79} width={62} height={3} fill="#a9ac89" />
    <Rect x={136} y={56} width={43} height={13} fill="#263e33" />
    <Rect x={139} y={59} width={37} height={7} fill="#69755c" />
    <Path d="M145 60h3v5h-3ZM153 60h3v2h5v3h-8ZM168 60h3v5h-3Z" fill="#b9ba8f" />
    <Rect x={131} y={110} width={45} height={84} fill="#183c30" />
    <Bamboo x={141} y={94} height={100} dark />
    <Bamboo x={163} y={95} height={99} dark />
    <Bush x={120} y={154} scale={1.1} dark />
    <GuardianPillar x={73} y={41} height={160} />
    <GuardianPillar x={205} y={48} height={154} />
    <Masonry x={235} y={5} width={22} height={31} />
    <Rect x={229} y={33} width={57} height={5} fill="#8a9476" />
    <Rect x={237} y={0} width={15} height={6} fill="#6a7b62" />
    <Path d="M38 11h17v4h12v3H44v7H33v-6h5ZM90 28h12v4h14v7H98v4H86v-7h4ZM198 41h20v4h19v4h-10v5h-22v-6h-7Z" fill="#376c42" />
    <Rect x={45} y={15} width={7} height={3} fill="#83a05e" />
    <Rect x={97} y={32} width={11} height={3} fill="#83a05e" />
    <Rect x={211} y={45} width={12} height={3} fill="#83a05e" />
    <Bush x={6} y={162} scale={1.5} />
    <Bush x={32} y={148} scale={1.3} dark />
    <Bush x={238} y={165} scale={1.15} />
    <Bush x={294} y={164} scale={1.4} dark />
    <Path d="M0 220h14v-5h21v4h29v-7h25v4h39v-3h31v6h29v-3h28v3h42v-5h25v3h24v-6h31v5h26v-3h25v7h20v36H0Z" fill="#213e30" />
    <Rect y={226} width={W} height={30} fill="#23382b" />
    <Rect y={224} width={W} height={4} fill="#668047" />
    <Rect y={228} width={W} height={4} fill="#3c5a37" />
    {Array.from({ length: 64 }, (_, i) => <G key={i}>
      <Rect x={i * 6} y={219 + ((i * 7) % 5)} width={2 + (i % 3)} height={5 + ((i * 3) % 5)} fill={['#94ad5e', '#638e48', '#3d733c', '#afba70'][i % 4]} />
      <Rect x={(i * 17) % W} y={234 + ((i * 7) % 18)} width={3 + (i % 3)} height={2 + (i % 2)} fill={['#405339', '#192f27', '#576244', '#354d32'][i % 4]} />
    </G>)}
    <Rect x={43} y={210} width={30} height={5} fill="#434a39" />
    <Rect x={46} y={207} width={23} height={4} fill="#72795c" />
    <Rect x={180} y={215} width={35} height={4} fill="#7c7d5b" />
    <Rect x={184} y={211} width={26} height={4} fill="#91906a" />
    <Rect x={302} y={208} width={23} height={7} fill="#3f5037" />
    <Rect x={305} y={205} width={18} height={4} fill="#839463" />
    <Path d="M0 0h12v105H8v55H0ZM376 0h8v174h-5v-50h-3Z" fill="#183b32" />
    <Path d="M0 14h20v5h17v6h-8v7H12v-7H0ZM0 57h13v5h14v7H12v9H0ZM369 38h15v13h-10v7h-16v-7h5v-7h6Z" fill="#28543d" />
    <Rect x={15} y={17} width={7} height={3} fill="#4a784a" />
    <Rect x={368} y={43} width={8} height={3} fill="#4a784a" />
  </Svg>;
});

export function PixelScene({ state, height = 256 }: PixelSceneProps) {
  const region = REGIONS.find(item => item.id === state.regionId) ?? REGIONS[0];
  const attack = getStats(state).attack;
  const [reducedMotion, setReducedMotion] = useState(false);
  const [active, setActive] = useState(AppState.currentState !== 'background');
  const [announcement, setAnnouncement] = useState({ text: '', victory: false });
  const idle = useRef(new Animated.Value(0)).current;
  const lunge = useRef(new Animated.Value(0)).current;
  const hit = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const strikeAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const previous = useRef({ enemyHp: state.enemyHp, battleWins: state.battleWins, regionId: state.regionId, mode: state.mode });

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReducedMotion(value); });
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    const app = AppState.addEventListener('change', value => setActive(value === 'active'));
    return () => { mounted = false; motion.remove(); app.remove(); };
  }, []);

  useEffect(() => {
    if (reducedMotion || !active) { idle.setValue(0); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(idle, { toValue: -2, duration: state.mode === 'training' ? 950 : 450, useNativeDriver: true, isInteraction: false }),
      Animated.timing(idle, { toValue: 0, duration: state.mode === 'training' ? 950 : 450, useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [active, idle, reducedMotion, state.mode]);

  useEffect(() => {
    const old = previous.current;
    previous.current = { enemyHp: state.enemyHp, battleWins: state.battleWins, regionId: state.regionId, mode: state.mode };
    const fighting = old.mode === 'expedition' && state.mode === 'expedition' && old.regionId === state.regionId;
    if (!fighting) {
      strikeAnimation.current?.stop();
      hit.setValue(0);
      lunge.setValue(0);
      return;
    }
    if (state.enemyHp >= old.enemyHp && state.battleWins <= old.battleWins) return;
    const victory = state.battleWins > old.battleWins;
    setAnnouncement({ text: victory ? `승리!  +${region.rewardGold}` : `${attack}`, victory });
    strikeAnimation.current?.stop();
    lunge.stopAnimation();
    hit.stopAnimation();
    floatY.stopAnimation();
    hit.setValue(1);
    floatY.setValue(0);
    const animations: Animated.CompositeAnimation[] = [];
    if (!reducedMotion) {
      animations.push(Animated.sequence([
        Animated.timing(lunge, { toValue: 10, duration: 80, useNativeDriver: true, isInteraction: false }),
        Animated.timing(lunge, { toValue: 0, duration: 180, useNativeDriver: true, isInteraction: false }),
      ]));
      animations.push(Animated.timing(floatY, { toValue: -22, duration: 750, useNativeDriver: true, isInteraction: false }));
    }
    const fade = Animated.sequence([
      Animated.delay(330),
      Animated.timing(hit, { toValue: 0, duration: reducedMotion ? 0 : 420, useNativeDriver: true, isInteraction: false }),
    ]);
    animations.push(fade);
    strikeAnimation.current = Animated.parallel(animations);
    strikeAnimation.current.start();
  }, [state.enemyHp, state.battleWins, state.regionId, state.mode, region.rewardGold, reducedMotion, floatY, hit, lunge, attack]);

  useEffect(() => () => { strikeAnimation.current?.stop(); idle.stopAnimation(); lunge.stopAnimation(); hit.stopAnimation(); floatY.stopAnimation(); }, [idle, lunge, hit, floatY]);

  return <View style={[styles.scene, { height }]} accessible accessibilityRole="image" accessibilityLabel={`${region.name}, ${state.mode === 'expedition' ? '협객과 산적의 자동 전투' : '협객이 운기조식으로 수련하는 중'}`}>
    <Scenery />
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" style={StyleSheet.absoluteFill}>
      <Rect x={106} y={219} width={48} height={4} fill="#112d24" opacity={0.65} />
      {state.mode === 'expedition' ? <>
        <Rect x={251} y={219} width={46} height={4} fill="#112d24" opacity={0.65} />
        <PixelBandit x={256} y={171} scale={2} />
        <PixelBandit x={326} y={173} scale={1.75} faded />
        <Rect x={256} y={164} width={43} height={4} fill="#1b2928" />
        <Rect x={257} y={165} width={Math.max(0, Math.round(41 * state.enemyHp / region.enemyHp))} height={2} fill="#c87559" />
      </> : <>
        <Rect x={264} y={180} width={7} height={41} fill="#735b39" />
        <Rect x={261} y={177} width={14} height={19} fill="#a08c57" />
        <Rect x={258} y={184} width={22} height={4} fill="#c0ac71" />
        <Rect x={264} y={174} width={8} height={7} fill="#c0ac71" />
        <Rect x={265} y={175} width={4} height={4} fill="#776342" />
        <Path d="M99 208h4v7h4v3h39v-3h5v-7h3v10h-5v3h-46v-3h-4Z" fill="#a3cca4" opacity={0.35} />
        <Rect x={109} y={201} width={2} height={5} fill="#c0dbb4" opacity={0.7} />
        <Rect x={150} y={191} width={2} height={4} fill="#c0dbb4" opacity={0.6} />
        <Rect x={104} y={183} width={2} height={3} fill="#c0dbb4" opacity={0.7} />
      </>}
    </Svg>
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateX: lunge }, { translateY: idle }] }]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <PixelHero x={107} y={162} scale={2} />
      </Svg>
    </Animated.View>
    {state.mode === 'expedition' && <>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: hit }]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
          <Path d="M195 168h10v3h10v4h10v5h8v7h8v11h-4v7h-9v4h-15v-4h13v-7h3v-9h-6v-7h-9v-5h-10v-5h-9Z" fill="#cae0c5" />
          <Path d="M207 174h10v5h11v8h8v11h-4v6h-13v3h-12v-3h12v-7h5v-8h-5v-8h-12Z" fill="#eff3ce" />
          <Rect x={252} y={186} width={4} height={4} fill="#fff0ad" />
          <Rect x={248} y={178} width={2} height={4} fill="#fff0ad" />
          <Rect x={260} y={180} width={3} height={3} fill="#d4ad6b" />
          <Rect x={262} y={193} width={3} height={3} fill="#fff0ad" />
        </Svg>
      </Animated.View>
      <Animated.Text pointerEvents="none" style={[styles.damage, announcement.victory && styles.victory, { opacity: hit, transform: [{ translateY: floatY }] }]}>{announcement.text}</Animated.Text>
    </>}
    <View pointerEvents="none" style={styles.bottomShade} />
  </View>;
}

export default PixelScene;

const styles = StyleSheet.create({
  scene: { width: '100%', backgroundColor: '#345e50', overflow: 'hidden' },
  damage: { position: 'absolute', left: '65%', top: '56%', color: '#f2e7aa', fontFamily: 'PixelKR', fontSize: 19, textShadowColor: '#173228', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 1 },
  victory: { left: '57%', color: '#eac563', fontSize: 16 },
  bottomShade: { position: 'absolute', bottom: 0, height: 3, left: 0, right: 0, backgroundColor: '#14291f' },
});
