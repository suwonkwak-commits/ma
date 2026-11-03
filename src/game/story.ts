/**
 * Original story draft based on the player's premise.
 * Sect liberation, recruitment and dispatch below describe planned systems;
 * these records do not unlock factions or grant gameplay rewards.
 */
export type StoryPage = {
  id: string;
  title: string;
  paragraphs: readonly string[];
};

export const PROLOGUE = {
  title: '빼앗긴 강호의 새벽',
  subtitle: '천하십대고수였던 당신, 이름 없는 청년으로 다시 서다.',
  pages: [
    {
      id: 'fallen-world',
      title: '무릎 꿇은 강호',
      paragraphs: [
        '정마전쟁은 끝났다. 정파의 깃발이 내려간 자리마다 마교의 문양이 걸렸다. 중원의 명문도, 새외의 먼 관문도 천마의 이름을 따랐다.',
        '살아남은 장문인과 장로들은 패배를 슬퍼하지 않았다. 전후에 퍼진 귀일대법이 그들의 뜻을 묶었기 때문이다. 어제의 수호자들이 오늘은 제자들에게 복종을 명했다.',
      ],
    },
    {
      id: 'old-oath',
      title: '칼을 배운 까닭',
      paragraphs: [
        '당신 역시 그들 중 하나였다. 작은 정파 무관에서 첫 검을 쥐고, 끝내 천하십대고수라 불렸던 무인. 천마의 명령 아래 고향 무관으로 돌아온 날, 낡은 문패의 글귀가 눈에 들어왔다.',
        '“무공은 사람을 지키기 위해 배운다.” 잊었다고 믿었던 첫 가르침 앞에서, 굳게 잠겨 있던 기억에 금이 갔다.',
      ],
    },
    {
      id: 'burning-inner-power',
      title: '모든 내공을 태운 새벽',
      paragraphs: [
        '단전 깊이 박힌 사술은 의지만으로 끊어지지 않았다. 당신은 평생 쌓은 내공을 남김없이 태워, 명령을 새긴 각인과 낡은 경맥을 함께 무너뜨렸다.',
        '그 끝에서 오래 품었던 깨달음이 환골탈태의 길을 열었다. 정신을 되찾았을 때, 거울 속에는 젊은 몸이 있었다. 그러나 단전에는 한 줌의 내공조차 남아 있지 않았다.',
      ],
    },
    {
      id: 'remaining-insight',
      title: '사라지지 않은 것',
      paragraphs: [
        '어떤 초식이 상대의 허점을 가르는지, 기운이 어느 길로 돌아야 하는지 당신은 기억한다. 다만 새 몸은 그 힘을 받아 낼 준비가 되어 있지 않다.',
        '천마는 당신이 내공과 함께 죽었다고 믿는다. 새 몸에는 옛 고수를 알아볼 기운의 흔적도 없다. 삼류의 호흡부터 다시 쌓아야 한다. 이번에는 혼자 정상에 오르지 않으리라. 사람들과 함께 강호를 되찾으리라.',
      ],
    },
    {
      id: 'first-alliance',
      title: '다시, 사람을 모으다',
      paragraphs: [
        '청죽림을 벗어나는 길에서, 당신은 모용세가의 봉쇄를 피해 온 사람들을 만난다. 백성을 지키던 가문이 어째서 천마의 이름으로 사람을 가두는가.',
        '검을 빼앗는 것만으로 사술이 풀리지는 않는다. 가주를 제압하고 세가에 남은 각인을 끊어야 한다. 첫 가문이 제 이름을 되찾는 날, 빼앗긴 강호를 이을 여정도 시작된다.',
      ],
    },
  ] satisfies readonly StoryPage[],
} as const;

export const STORY_PILLARS = [
  {
    title: '깨달음은 남고, 힘은 다시 쌓는다',
    text: '주인공은 예전의 판단과 무학을 기억하지만 새 경맥에 맞는 내공을 길러야 한다. 약한 출발과 고수다운 전투 감각이 함께 성립한다.',
  },
  {
    title: '쓰러뜨린 뒤에 구할 사람이 남는다',
    text: '장문인·장로·가주를 제압하고 사술의 근원을 정화한다. 무고한 문도까지 적으로 몰지 않으며, 전투의 결말을 문파의 회복으로 잇는다.',
  },
  {
    title: '구한 이들이 다음 걸음을 돕는다',
    text: '해방된 문파는 재건 지원과 신뢰를 통해 플레이어가 이끄는 연맹에 합류한다. 표사·약사·장인 등 각자의 재능으로 표국과 거점을 운영한다.',
  },
  {
    title: '아홉 고수에게는 아홉 가지 사정이 있다',
    text: '다른 천하십대고수의 행방을 추적한다. 사술의 피해자도, 제자를 지키려 굴복한 이도, 각인 이전에 마교와 거래했던 이도 있다.',
  },
] as const;

export type SectDraft = {
  id: string;
  name: string;
  regionId: string | null;
  identity: string;
  corruption: string;
  liberation: string;
  personnel: string;
  dispatch: string;
  legacy: string;
  paidCosmetic: string;
};

// Proposed campaign order. Guangzhou/Guangxi order remains a route-design suggestion.
export const SECT_DRAFTS: readonly SectDraft[] = [
  {
    "id": "murong-family",
    "name": "모용세가",
    "identity": "강남의 표행과 가문들을 잇는 무림 세가. 빼앗긴 강호를 되찾는 첫 해방 대상이다.",
    "corruption": "사술에 묶인 가주가 주변 사람과 표행을 봉쇄한다. 가문의 위신이 마교의 통치 수단이 되었다.",
    "liberation": "각인 중추를 먼저 무너뜨려 사술을 약화시킨 뒤 가주를 제압한다. 갇힌 사람과 물자를 돌려보내며 첫 재건 서약을 맺는다.",
    "personnel": "가문의 호위 무인·집사·수습 표사.",
    "dispatch": "첫 호위 인력으로 표국을 일으키고, 짧은 표행으로 연맹의 재건을 돕는다.",
    "legacy": "세가 무학의 기초 전승·기본 가문 복식·첫 재건 인력.",
    "paidCosmetic": "가문 예복·추가 검기·표국 장식.",
    "regionId": null
  },
  {
    "id": "beggar-sect",
    "name": "개방",
    "identity": "여러 고을을 잇는 유랑 인력과 공개 정보망을 가진 방파. 작은 소문도 놓치지 않는다.",
    "corruption": "분타의 연락망이 천마에게 저항자를 찾아내는 감시망으로 뒤집혔다.",
    "liberation": "묶인 분타 책임자를 구하고 소식을 전하던 사람들을 되찾는다.",
    "personnel": "정보 전달자·정찰 무인·길잡이.",
    "dispatch": "지도 밖의 길과 숨은 자원을 찾고, 다음 분타와 문파에 이르는 단서를 전한다.",
    "legacy": "방파의 무학과 연락망·정찰용 복식.",
    "paidCosmetic": "표행 깃발·추가 복식·지도 표식 장식.",
    "regionId": null
  },
  {
    "id": "hebuk-paeng",
    "name": "하북팽가",
    "identity": "북부 육로의 호위와 도법을 잇는 무림 가문.",
    "corruption": "침식된 가주와 장로들이 관문을 장악하고 피난 행렬을 징발한다.",
    "liberation": "호송대를 보호하며 가주를 제압하고, 끊긴 북부 길목을 다시 연다.",
    "personnel": "도법 호위 무인·표두·육로 정찰 인력.",
    "dispatch": "위험한 육로와 무구 재료를 실은 표물을 지키며, 북부의 보급로를 잇는다.",
    "legacy": "도법 계열 전승·호위 복식·육로 표행 인력.",
    "paidCosmetic": "추가 도복·무구 장식·호송 수레 외형.",
    "regionId": null
  },
  {
    "id": "jinju-eon",
    "name": "진주언가",
    "identity": "권법과 근접 호위를 주축으로 삼는 무림 가문.",
    "corruption": "가문의 수련장이 마교의 병력 징발장으로 바뀌었다.",
    "liberation": "가주를 제압하고 징발된 문도들을 구한다. 싸울 힘을 백성에게 돌려주는 재건을 돕는다.",
    "personnel": "권사·짐꾼 겸 호위·수련 지도 인력.",
    "dispatch": "무거운 표물을 지키고 무너진 거점을 수리한다. 평소에는 후배들의 수련을 지도한다.",
    "legacy": "권법 계열 전승·가문 복식·수련 인력.",
    "paidCosmetic": "수련복 변형·권격 연출·연무장 장식.",
    "regionId": null
  },
  {
    "id": "shaolin",
    "name": "소림",
    "identity": "정화와 치료의 지혜를 지닌 문파. 수련을 통해 몸과 뜻을 함께 다스린다.",
    "corruption": "사술에 묶인 고승들이 구휼과 수련 질서를 통제한다.",
    "liberation": "장로들의 각인을 풀고 구휼을 복구해, 더 깊은 사술을 끊는 정화의 원리를 얻는다.",
    "personnel": "치료 인력·정화 담당·수련 지도 무인.",
    "dispatch": "사술에 다친 이들을 정화·치료하고, 무인들이 다시 내공을 쌓도록 수련을 돕는다.",
    "legacy": "정화·조식 전승·기본 수행 복식.",
    "paidCosmetic": "추가 수행복·수련 공간·수호 연출.",
    "regionId": null
  },
  {
    "id": "hwasan-jongnam",
    "name": "화산·종남",
    "identity": "오래된 자존심과 원한으로 섬서의 산문에서 맞서는 두 문파.",
    "corruption": "천마의 명령과 오래된 원한이 뒤섞여 양측 문도가 서로를 반역자로 믿는다.",
    "liberation": "각 문파의 수뇌부를 제압·정화하고 교전 지역의 피해를 함께 수습한다. 공동의 적을 드러내 공동 전선으로 묶는다.",
    "personnel": "두 계통의 검수·장인·산길 정찰 인력.",
    "dispatch": "검수는 표물을 지키고 정찰대는 산길을 연다. 두 문파의 힘을 합쳐 교전의 피해를 수습한다.",
    "legacy": "문파별 검법 전승과 기본 복식, 공동 재건의 이야기.",
    "paidCosmetic": "문파별 예복·검기·산문 장식.",
    "regionId": null
  },
  {
    "id": "wudang-sect",
    "name": "무당파",
    "regionId": null,
    "identity": "호북의 산문에서 기혈과 내공 운용의 도를 잇는 문파.",
    "corruption": "사술에 묶인 장문인과 장로들이 호흡과 수련 질서를 천마의 명령에 맞추어 뒤틀었다.",
    "liberation": "문도들을 구하고 각인을 해제한 뒤, 흐트러진 기혈을 회복하도록 재건을 돕는다.",
    "personnel": "내공 운용에 익숙한 무인·수련 지도·호위 인력.",
    "dispatch": "숙련된 무인들이 호위를 맡고, 수련을 지도하며 흐트러진 기혈을 회복하도록 돕는다.",
    "legacy": "내공 운용 전승·기본 도복·고급 수련 지원 인력.",
    "paidCosmetic": "추가 도복·검기·수련 공간 장식."
  },
  {
    "id": "namgung-family",
    "name": "남궁세가",
    "identity": "가문의 명예와 강호의 질서를 짊어진 무림 세가. 커진 연맹과 더 큰 서약을 맺는다.",
    "corruption": "침식된 가주가 가문과 협력 세력의 질서를 천마에게 바치고 있다.",
    "liberation": "가주를 제압하고 가문이 저지른 일의 수습을 도우며 세가 단위의 재건 동맹을 맺는다.",
    "personnel": "검수·가문 호위·교역 관리 인력.",
    "dispatch": "숙련 호위와 여러 거점 사이의 교역을 맡아, 연맹이 더 먼 곳으로 나아가도록 돕는다.",
    "legacy": "세가 검학·기본 복식·숙련 재건 인력.",
    "paidCosmetic": "가문 예복·추가 검기·거점 장식.",
    "regionId": null
  },
  {
    "id": "jiangxi-region",
    "name": "강서 권역",
    "identity": "지방 가문과 상단이 생산지·나루·길목을 잇는 지역.",
    "corruption": "마교가 생산지와 보급로를 함께 쥐어 협력 거점을 고립시켰다.",
    "liberation": "지역 거점들을 구하고 교역을 다시 연결한다.",
    "personnel": "지역 호위·채집·교역 인력.",
    "dispatch": "지역에서 모은 자재와 약재를 표국으로 보내, 여러 문파의 재건을 뒷받침한다.",
    "legacy": "권역별 견문·재료·기본 지역 복식.",
    "paidCosmetic": "거점·수레·표행 장식.",
    "regionId": null
  },
  {
    "id": "hao-sect",
    "name": "하오문",
    "identity": "눈에 띄지 않는 사람과 길을 따라 은밀한 소식과 의뢰를 잇는 세력.",
    "corruption": "마교가 문주와 연락책을 통해 비밀 의뢰와 거래를 조작한다.",
    "liberation": "문주를 구하고 정보의 진위를 밝혀, 천마의 숨은 거점으로 향하는 실마리를 얻는다.",
    "personnel": "잠입·암행·정보 연락 인력.",
    "dispatch": "암행으로 드러나지 않은 거점을 찾고, 특수 표행과 숨은 상인들의 거래를 연결한다.",
    "legacy": "은밀한 무학 전승·잠행 복식·특수 의뢰망.",
    "paidCosmetic": "추가 잠행복·암행 연출·의뢰 편성 장식.",
    "regionId": null
  },
  {
    "id": "guangzhou-region",
    "name": "광주 권역",
    "identity": "여러 표행의 사람과 물자가 모이는 남방의 교역 거점.",
    "corruption": "마교가 교역 이익과 운송 인력을 독점해 남방의 보급을 막는다.",
    "liberation": "운송 거점을 되찾고 연맹의 여러 표행을 연결한다.",
    "personnel": "운송·호위·교역 관리 인력.",
    "dispatch": "표행을 여러 거점에 나누어 보내고 돌아오는 물자를 모아, 남방의 보급망을 넓힌다.",
    "legacy": "운송 기반·지역 재료·기본 교역 복식.",
    "paidCosmetic": "표국 깃발·수레·교역 거점 장식.",
    "regionId": null
  },
  {
    "id": "guangxi-region",
    "name": "광서 권역",
    "identity": "먼 교역로와 약재 거점을 사이에 두고 여러 세력이 살아가는 남방 지역.",
    "corruption": "길목을 장악한 마교 세력이 사람과 희귀 자원을 강제로 빼앗는다.",
    "liberation": "고립된 거점을 연결하고 지역 협력 세력을 재건한다.",
    "personnel": "장거리 호위·약초 채집·지역 길잡이.",
    "dispatch": "먼 길을 견디는 호위와 채집꾼이 함께 나서, 희귀 약재와 지역 재료를 가져온다.",
    "legacy": "지역 견문·약재·기본 지역 복식.",
    "paidCosmetic": "추가 교역 복식·거점 장식.",
    "regionId": null
  },
  {
    "id": "sichuan-sects",
    "name": "사천 권역 · 아미·당문·청성",
    "identity": "아미·당문·청성이 서로 다른 무학과 생업으로 이어지는 사천의 강호.",
    "corruption": "문파와 가문에 심어진 각인이 서로의 불신을 키워, 약과 무구의 공급마저 끊었다.",
    "liberation": "아미·당문·청성을 구하고, 점창의 연락책이 가져온 약재 장부로 같은 사술의 흔적을 밝힌다. 조사는 운남의 네 번째 세력으로 이어진다.",
    "personnel": "문파별 무인·약사·무구 장인.",
    "dispatch": "회복과 약재 채집, 무구 재료 수급을 각 세력의 전문성에 맞게 나누어 맡는다.",
    "legacy": "각 세력의 기본 전승·복식·영약 기반을 구분한다.",
    "paidCosmetic": "세력별 예복·무구 연출·거점 장식.",
    "regionId": null
  },
  {
    "id": "diancang-yunnan",
    "name": "운남 점창",
    "identity": "사천에서 이어지는 서남 4세력 연합전의 후반부. 점창의 산문은 운남에 있다.",
    "corruption": "마교가 서남부의 연결을 끊어 중원과 새외로 향하는 길을 통제한다.",
    "liberation": "점창을 구한 뒤 아미·당문·청성과 연합해 마교의 서남 지휘관을 제압한다. 네 세력이 함께 약재와 교역로를 되찾는다.",
    "personnel": "검수·서남 길잡이·원정 호위 인력.",
    "dispatch": "서남의 길을 아는 무인들이 원정과 장거리 표행을 맡는다.",
    "legacy": "점창의 무학 전승·기본 복식·서남 교역 인력.",
    "paidCosmetic": "추가 원정복·검기·거점 장식.",
    "regionId": null
  },
  {
    "id": "kunlun",
    "name": "곤륜",
    "identity": "중원과 새외의 전선을 잇는 후반 문파.",
    "corruption": "침식된 수뇌부가 관문을 지키며 천마의 중심부로 향하는 왕래를 끊는다.",
    "liberation": "문파를 구하고 고립된 교역 거점과 저항 세력을 하나의 길로 잇는다.",
    "personnel": "변경 호위·추적·장거리 원정 인력.",
    "dispatch": "새외로 나선 원정대와 희귀 재료를 실은 호송대를 지키고, 멀리 떨어진 아군을 잇는다.",
    "legacy": "새외 무학 교류·방한 복식·원정 기반.",
    "paidCosmetic": "추가 방한복·원정 깃발·설산 거점 장식.",
    "regionId": null
  },
  {
    "id": "demonic-cult",
    "name": "마교",
    "identity": "지금까지 구한 세력의 힘으로 천마에게 맞서는 최종 구간.",
    "corruption": "귀일대법의 중추가 강호의 지도자들을 다시 묶으려 한다.",
    "liberation": "문파의 정화·보급·호위를 합쳐 중추를 무너뜨리고 천마와 결전한다.",
    "personnel": "앞서 합류한 NPC 세력의 합동 지원.",
    "dispatch": "정찰·호위·정화·보급을 맡은 동료들이 마지막 길을 연다. 재건한 강호의 힘이 천마의 전각 앞에 모인다.",
    "legacy": "각 문파의 전승이 하나로 이어지는 결전, 함께 살아남은 이들의 재건 기록.",
    "paidCosmetic": "결전 기념 복식·연맹 깃발·추가 승리 연출.",
    "regionId": null
  }
];

export const REBIRTH_LORE = {
  title: '환생은 돌아가는 시간이 아니라, 이어지는 삶',
  paragraphs: [
    '화경에 이르면 탈태 수련으로 새로운 몸과 경맥에 다시 내공을 쌓을 수 있다. 한 생의 성취와 깨달음은 천옥에 남지만, 강호의 시간은 앞으로 흐른다.',
    '단전이 비워져도 해방한 문파와 함께 걸은 역사는 사라지지 않는다. 표국의 불빛과 돌아오는 표행, 동료의 손에 들린 약재가 다시 수련할 당신을 기다린다.',
    '어제 구한 사람들이 오늘의 당신을 키운다. 그렇게 되찾은 힘은, 다시 다음 사람을 구하는 데 쓰인다.',
  ],
} as const;
