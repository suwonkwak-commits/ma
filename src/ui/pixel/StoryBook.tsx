import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { PROLOGUE, REBIRTH_LORE, SECT_DRAFTS, STORY_PILLARS } from '../../game/story';
import { colors as C } from '../theme';
import { PixelButton, PixelIcon, PixelPanel, PixelText } from './primitives';

type StoryTab = 'prologue' | 'world' | 'sects' | 'rebirth';
const TABS: Array<{ id: StoryTab; label: string }> = [
  { id: 'prologue', label: '서막' },
  { id: 'world', label: '세계관' },
  { id: 'sects', label: '문파' },
  { id: 'rebirth', label: '환생' },
];

export type StoryBookProps = { visible: boolean; onClose: () => void };

/** Story reading has no game actions, grants, unlocks, or persistence side effects. */
export function StoryBook({ visible, onClose }: StoryBookProps) {
  const { height } = useWindowDimensions();
  const [tab, setTab] = useState<StoryTab>('prologue');
  const [pageIndex, setPageIndex] = useState(0);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const page = PROLOGUE.pages[pageIndex];
  const lastPage = pageIndex === PROLOGUE.pages.length - 1;

  useEffect(() => {
    if (!visible) return;
    setTab('prologue');
    setPageIndex(0);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [visible]);

  const selectTab = (next: StoryTab) => {
    setTab(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const turnPage = (direction: -1 | 1) => {
    setPageIndex(index => Math.max(0, Math.min(PROLOGUE.pages.length - 1, index + direction)));
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  return <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
    <View style={s.backdrop}>
      <View testID="story-reader" accessibilityViewIsModal style={[s.window, { height: Math.max(260, Math.min(height - 56, 820)) }]}>
        <View style={s.header}>
          <View style={s.titleRow}><PixelIcon name="book" size={24} /><PixelText size={16} color="#302715">강호의 서사</PixelText></View>
          <Pressable accessibilityRole="button" accessibilityLabel="이야기 닫기" onPress={onClose} style={s.closeButton}><PixelIcon name="cross" size={18} color="#452b1f" /></Pressable>
        </View>

        <View style={s.tabs}>
          {TABS.map(item => <PixelButton key={item.id} label={item.label} accessibilityLabel={`이야기 ${item.label}`} onPress={() => selectTab(item.id)} tone={tab === item.id ? 'gold' : 'blue'} small style={{ flex: 1, paddingHorizontal: 4 }} />)}
        </View>

        <ScrollView ref={scroll} style={s.scroll} contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
          {tab === 'prologue' && <>
            <View style={s.introduction}><PixelText size={11} color={C.gold}>{PROLOGUE.subtitle}</PixelText><PixelText size={20} color={C.text}>{PROLOGUE.title}</PixelText></View>
            <View style={s.chapterRule}><View style={s.rule} /><PixelText size={10} color={C.gold}>서막 {pageIndex + 1} / {PROLOGUE.pages.length}</PixelText><View style={s.rule} /></View>
            <PixelPanel padding={15}>
              <PixelText size={17} color={C.gold}>{page.title}</PixelText>
              <View style={s.paragraphs}>{page.paragraphs.map((paragraph, index) => <PixelText key={`${page.id}-${index}`} size={13} style={s.storyText}>{paragraph}</PixelText>)}</View>
            </PixelPanel>
            <View style={s.storySeal}><PixelIcon name="sword" size={24} color={C.gold} /><PixelText size={11} color={C.dim} style={{ flex: 1, textAlign: 'center' }}>잃은 것은 내공, 잃지 않은 것은 깨달음.</PixelText></View>
          </>}

          {tab === 'world' && <>
            <View style={s.introduction}><PixelText size={11} color={C.gold}>WORLD OF MURIM</PixelText><PixelText size={19}>빼앗긴 강호의 질서</PixelText></View>
            {STORY_PILLARS.map((pillar, index) => <PixelPanel key={pillar.title} title={`${String(index + 1).padStart(2, '0')}  ${pillar.title}`} padding={13}><PixelText size={13} style={s.storyText}>{pillar.text}</PixelText></PixelPanel>)}
          </>}

          {tab === 'sects' && <>
            <View style={s.introduction}><PixelText size={11} color={C.gold}>CAMPAIGN · 제안 경로</PixelText><PixelText size={19}>되찾은 사람들이 만드는 강호</PixelText></View>
            <View style={s.futureNote}><PixelIcon name="scroll" size={18} /><PixelText size={11} color={C.muted} style={{ flex: 1 }}>문파 영입·파견은 추가 예정입니다. 아래 문파와 보상은 이야기 구상이며, 현재 획득한 세력이 아닙니다.</PixelText></View>
            {SECT_DRAFTS.map((sect, index) => <PixelPanel key={sect.id} title={`${String(index + 1).padStart(2, '0')}. ${sect.name}`} right={<PixelText size={9} color={C.dim}>해방 구상</PixelText>} padding={13}>
              <PixelText size={13} color={C.gold}>{sect.identity}</PixelText>
              {[
                ['침식된 이유', sect.corruption],
                ['해방과 합류', sect.liberation],
                ['함께할 인재', sect.personnel],
                ['표국과 파견', sect.dispatch],
                ['되찾을 전승', sect.legacy],
                ['특별한 외형 구상', sect.paidCosmetic],
              ].map(([title, text]) => <View key={title} style={s.sectParagraph}><PixelText size={10} color={C.gold}>{title}</PixelText><PixelText size={12} style={s.storyText}>{text}</PixelText></View>)}
            </PixelPanel>)}
          </>}

          {tab === 'rebirth' && <>
            <View style={s.introduction}><PixelText size={11} color={C.gold}>A LIFE REFORGED</PixelText><PixelText size={19}>{REBIRTH_LORE.title}</PixelText></View>
            <PixelPanel padding={15}><View style={s.paragraphs}>{REBIRTH_LORE.paragraphs.map((paragraph, index) => <PixelText key={index} size={13} style={s.storyText}>{paragraph}</PixelText>)}</View></PixelPanel>
            <View style={s.futureNote}><PixelIcon name="jade" size={20} /><PixelText size={11} color={C.muted} style={{ flex: 1 }}>실제 환생 조건과 현재 보상은 캐릭터의 환생 메뉴에서 확인할 수 있습니다.</PixelText></View>
          </>}
        </ScrollView>

        <View style={s.footer}>
          {tab === 'prologue' ? <>
            <View style={s.pageDots} accessibilityLabel={`서막 ${pageIndex + 1}쪽, 전체 ${PROLOGUE.pages.length}쪽`}>
              {PROLOGUE.pages.map((item, index) => <View key={item.id} style={[s.dot, index === pageIndex && s.activeDot]} />)}
            </View>
            <View style={s.pageActions}><PixelButton label="이전" accessibilityLabel="이전 이야기" onPress={() => turnPage(-1)} disabled={pageIndex === 0} tone="blue" small style={{ flex: 1 }} /><PixelButton label={lastPage ? '강호로 돌아가기' : '다음 이야기'} accessibilityLabel={lastPage ? '강호로 돌아가기' : '다음 이야기'} onPress={lastPage ? onClose : () => turnPage(1)} tone="gold" small style={{ flex: 1 }} /></View>
          </> : <PixelButton label="강호로 돌아가기" onPress={onClose} tone="gold" />}
        </View>
      </View>
    </View>
  </Modal>;
}

export default StoryBook;

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#02090de8', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 20 },
  window: { width: '100%', maxWidth: 430, maxHeight: '94%', backgroundColor: '#203443', borderWidth: 3, borderTopColor: '#b6a164', borderLeftColor: '#b6a164', borderBottomColor: '#6c613b', borderRightColor: '#6c613b' },
  header: { minHeight: 48, backgroundColor: '#c4a653', borderBottomWidth: 3, borderBottomColor: '#75612e', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 13 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  closeButton: { width: 44, height: 45, alignItems: 'center', justifyContent: 'center', backgroundColor: '#dda04b', borderLeftWidth: 2, borderLeftColor: '#86713b' },
  tabs: { padding: 8, gap: 4, flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#0c1b25', backgroundColor: '#1b2d3b' },
  scroll: { flex: 1 },
  body: { padding: 13, paddingBottom: 22, gap: 13 },
  introduction: { gap: 7, paddingVertical: 3 },
  chapterRule: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 3 },
  rule: { height: 1, backgroundColor: '#5d6248', flex: 1 },
  paragraphs: { gap: 14 },
  storyText: { color: '#ced8d8', lineHeight: 22 },
  storySeal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  futureNote: { flexDirection: 'row', alignItems: 'flex-start', padding: 10, gap: 9, backgroundColor: '#142731', borderWidth: 1, borderColor: '#415666' },
  sectParagraph: { borderTopWidth: 1, borderTopColor: '#3a5360', paddingTop: 7, gap: 3 },
  footer: { padding: 10, gap: 9, backgroundColor: '#182b37', borderTopWidth: 2, borderTopColor: '#59717b' },
  pageDots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 7 },
  dot: { width: 5, height: 5, backgroundColor: '#4e6877' },
  activeDot: { backgroundColor: '#e5c66b', width: 14 },
  pageActions: { flexDirection: 'row', gap: 6 },
});
