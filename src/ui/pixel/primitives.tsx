import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { colors as C, pixelFont } from '../theme';

export function PixelText({ size = 12, color = C.text, style, ...props }: TextProps & { size?: number; color?: string }) {
  return <Text {...props} style={[{ fontFamily: pixelFont, fontSize: size, lineHeight: Math.round(size * 1.5), color, includeFontPadding: false }, style]} />;
}

export function PixelPanel({ children, title, right, style, padding = 10 }: { children: React.ReactNode; title?: string; right?: React.ReactNode; style?: StyleProp<ViewStyle>; padding?: number }) {
  return <View style={[s.panel, style]}>
    {title && <View style={s.panelTitle}><View style={s.titleAccent} /><PixelText size={13} color={C.gold} style={{ flex: 1 }}>{title}</PixelText>{right}</View>}
    <View style={{ padding, gap: 9 }}>{children}</View>
  </View>;
}

export function PixelButton({ label, onPress, disabled = false, tone = 'green', small = false, style, accessibilityLabel, icon }: {
  label: string; onPress: () => void; disabled?: boolean; tone?: 'green' | 'gold' | 'blue' | 'danger'; small?: boolean;
  style?: StyleProp<ViewStyle>; accessibilityLabel?: string; icon?: React.ReactNode;
}) {
  const fills = { green: '#3eaa70', gold: '#ab8e3f', blue: '#345569', danger: '#aa5e4f' };
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.button, { backgroundColor: disabled ? '#354653' : fills[tone], borderTopColor: disabled ? '#52616b' : tone === 'gold' ? '#e4c66f' : '#86cfa5', borderLeftColor: disabled ? '#52616b' : tone === 'gold' ? '#e4c66f' : '#86cfa5' }, small && { paddingHorizontal: 10 }, pressed && !disabled && { transform: [{ translateY: 1 }], borderTopColor: '#1a2830', borderLeftColor: '#1a2830' }, style]}>
    {icon}<PixelText size={small ? 11 : 12} color={disabled ? '#91a0a7' : '#fff9df'} style={{ textAlign: 'center' }}>{label}</PixelText>
  </Pressable>;
}

export function PixelBar({ ratio, color = C.gold, height = 8, label }: { ratio: number; color?: string; height?: number; label?: string }) {
  const bounded = Math.max(0, Math.min(1, ratio));
  return <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(bounded * 100) }} style={[s.bar, { height }]}>
    <View style={{ height: '100%', width: `${bounded * 100}%`, backgroundColor: color }}><View style={{ height: 2, backgroundColor: '#ffffff38' }} /></View>
  </View>;
}

// Small original bitmap icons. Coordinates stay on a 16 x 16 pixel grid.
const icons: Record<string, Array<[number, number, number, number, string?]>> = {
  sword: [[11,1,3,2,'#effafa'],[9,3,4,2,'#bddde5'],[7,5,4,2,'#bddde5'],[5,7,4,2,'#bddde5'],[3,8,2,2,'#d7af51'],[5,10,2,2,'#d7af51'],[2,10,3,3,'#8b5940'],[1,13,2,2,'#5d3b32']],
  heart: [[2,3,4,2],[9,3,4,2],[1,5,13,4],[3,9,9,2],[5,11,5,2],[7,13,1,1]],
  shield: [[3,1,9,2],[2,3,11,7],[3,10,9,2],[5,12,5,2],[7,14,1,1],[6,4,3,7,'#d7c582'],[4,6,7,2,'#d7c582']],
  coin: [[4,1,7,2,'#f6df86'],[2,3,11,2,'#e7bd48'],[1,5,13,6,'#c18d26'],[3,11,9,2,'#e7bd48'],[5,13,5,1,'#816025'],[5,4,2,7,'#ffe79a'],[8,4,2,7,'#9c6a15'],[5,4,5,1,'#ffe79a']],
  gem: [[6,1,4,2,'#b8f5ff'],[4,3,8,3,'#67d9ed'],[3,6,10,4,'#2d94bd'],[5,10,6,3,'#167496'],[7,13,2,2,'#0b536d'],[6,3,2,7,'#c7ffff']],
  scroll: [[2,2,10,2,'#d6c493'],[1,4,12,8,'#a79870'],[3,4,10,8,'#e1d2a5'],[3,12,11,2,'#8c7350'],[5,5,6,1,'#7a7153'],[5,8,5,1,'#7a7153'],[5,10,4,1,'#7a7153']],
  boot: [[7,1,5,2],[6,3,5,6],[5,8,6,3],[3,10,9,3],[1,12,12,2],[7,3,3,1,'#c8d4d6'],[6,6,3,1,'#c8d4d6']],
  fist: [[4,2,2,6],[7,1,2,7],[10,2,2,7],[12,4,2,7],[2,7,3,5],[4,9,9,5],[6,14,6,1]],
  map: [[1,2,4,11,'#c7b47c'],[5,3,5,11,'#e0d2a0'],[10,1,5,12,'#a5b983'],[5,3,1,11,'#89764d'],[10,2,1,11,'#6e845d'],[7,5,2,2,'#bb684a'],[8,7,2,2,'#bb684a'],[6,9,2,2,'#bb684a']],
  helmet: [[5,1,6,2],[3,3,10,3],[2,6,12,6],[4,11,3,3],[10,11,3,3],[5,6,6,3,'#243744'],[7,1,2,4,'#d6bd66']],
  chest: [[2,3,12,3,'#b18c4c'],[1,6,14,7,'#775b36'],[2,8,12,4,'#ab8141'],[2,6,12,1,'#e4be65'],[7,6,3,5,'#ddc37f'],[8,8,1,2,'#654a29']],
  gear: [[6,1,4,3],[2,4,12,8],[6,12,4,3],[1,6,14,4],[5,5,6,6,'#1e3441'],[6,6,4,4,'#8ba0ac']],
  cross: [[3,2,2,2],[5,4,2,2],[7,6,2,2],[9,8,2,2],[11,10,2,2],[3,10,2,2],[5,8,2,2],[9,4,2,2],[11,2,2,2]],
  arrow: [[3,7,10,2],[8,3,2,2],[10,5,2,2],[10,9,2,2],[8,11,2,2]],
  star: [[7,1,2,3],[5,4,6,2],[1,6,14,2],[4,8,8,3],[3,11,3,3],[10,11,3,3]],
  person: [[6,1,5,2,'#292b36'],[5,3,7,5,'#d9af83'],[5,3,7,1,'#393645'],[3,8,11,5],[5,13,3,2,'#c5d0d1'],[10,13,3,2,'#c5d0d1'],[8,5,1,1,'#292b36'],[11,5,1,1,'#292b36']],
  book: [[1,3,6,10,'#b9c6cb'],[8,3,6,10,'#91a4b0'],[7,2,1,12,'#e3d2a0'],[2,5,4,1,'#567386'],[9,5,4,1,'#496575'],[2,8,4,1,'#567386'],[9,8,4,1,'#496575']],
  check: [[2,7,2,3],[4,9,2,3],[6,7,2,3],[8,5,2,3],[10,3,2,3],[12,1,2,3]],
  fire: [[8,1,2,4],[6,4,5,4],[3,6,9,7],[5,13,6,2],[7,8,3,5,'#ffdc75'],[8,10,2,4,'#fff2b3']],
};

export function PixelIcon({ name, size = 24, color = C.gold }: { name: string; size?: number; color?: string }) {
  const pixels = icons[name] ?? icons.star;
  return <Svg width={size} height={size} viewBox="0 0 16 16" accessibilityElementsHidden>
    {pixels.map(([x,y,w,h,fill], i) => <Rect key={i} x={x} y={y} width={w} height={h} fill={fill ?? color} />)}
  </Svg>;
}

const s = StyleSheet.create({
  panel: { backgroundColor: C.card, borderWidth: 2, borderTopColor: C.border, borderLeftColor: C.border, borderRightColor: '#0b151d', borderBottomColor: '#0b151d' },
  panelTitle: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#263f4f', minHeight: 31, paddingHorizontal: 9, borderBottomWidth: 2, borderBottomColor: '#0d1c26', gap: 7 },
  titleAccent: { width: 3, height: 12, backgroundColor: C.gold },
  button: { minHeight: 44, paddingHorizontal: 13, paddingVertical: 7, borderWidth: 2, borderTopColor: '#86cfa5', borderLeftColor: '#86cfa5', borderBottomColor: '#172b31', borderRightColor: '#172b31', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  bar: { backgroundColor: '#0a1720', borderWidth: 1, borderColor: '#0a131b', overflow: 'hidden' },
});
