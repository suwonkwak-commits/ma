/** Original game content. Numbers are prototype balancing, not historical claims. */
export type Technique = {
  id: string;
  name: string;
  category: string;
  description: string;
  baseCost: number;
};

export type Region = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  requiredRealm: number;
  enemyName: string;
  enemyHp: number;
  enemyAttack: number;
  rewardSilver: number;
  rewardCultivation: number;
};

export const REALMS = [
  { name: '삼류', threshold: 0 },
  { name: '이류', threshold: 120 },
  { name: '일류', threshold: 480 },
  { name: '절정', threshold: 1_600 },
  { name: '초절정', threshold: 5_000 },
  { name: '화경', threshold: 15_000 },
] as const;

export const TECHNIQUES: readonly Technique[] = [
  {
    id: 'fog-sword',
    name: '청무검법',
    category: '검법',
    description: '새벽 안개처럼 흐르는 검로. 한 초식씩 익힐 때마다 공격력이 오른다.',
    baseCost: 80,
  },
  {
    id: 'river-heart',
    name: '유수심법',
    category: '심법',
    description: '고요한 물결에 호흡을 맞춘다. 내공 수련 속도와 최대 생명력이 오른다.',
    baseCost: 100,
  },
  {
    id: 'swallow-step',
    name: '연비보',
    category: '경공',
    description: '제비의 낮은 비행을 본뜬 보법. 수련할수록 방어력이 오른다.',
    baseCost: 90,
  },
  {
    id: 'stone-fist',
    name: '단석권',
    category: '권법',
    description: '단단한 중심에서 뻗는 짧은 권격. 공격력과 최대 생명력이 오른다.',
    baseCost: 130,
  },
];

export const REGIONS: readonly Region[] = [
  {
    id: 'bamboo-path',
    name: '청죽림',
    subtitle: '첫 번째 강호',
    description: '댓잎이 스치는 길목. 행인을 막는 산적을 물리치고 첫 명성을 쌓는다.',
    requiredRealm: 0,
    enemyName: '길목의 산적',
    enemyHp: 56,
    enemyAttack: 11,
    rewardSilver: 24,
    rewardCultivation: 20,
  },
  {
    id: 'river-crossing',
    name: '운하 나루',
    subtitle: '물안개 속의 대결',
    description: '상선이 모이는 나루에 수적이 나타났다. 흐르는 물 위에서 실력을 시험한다.',
    requiredRealm: 1,
    enemyName: '나루의 수적',
    enemyHp: 135,
    enemyAttack: 22,
    rewardSilver: 65,
    rewardCultivation: 54,
  },
  {
    id: 'red-ridge',
    name: '적운 고개',
    subtitle: '붉은 구름을 넘어',
    description: '가파른 산길을 지키는 낭인. 쌓아 온 내공과 무공을 함께 겨룰 때다.',
    requiredRealm: 2,
    enemyName: '적운의 낭인',
    enemyHp: 280,
    enemyAttack: 35,
    rewardSilver: 150,
    rewardCultivation: 135,
  },
  {
    id: 'moon-pavilion',
    name: '월하 누각',
    subtitle: '달빛 아래의 초대',
    description: '이름 없는 고수가 서찰을 보냈다. 달이 뜨면 누각에서 비무가 시작된다.',
    requiredRealm: 3,
    enemyName: '월하의 은거 고수',
    enemyHp: 560,
    enemyAttack: 54,
    rewardSilver: 340,
    rewardCultivation: 310,
  },
];
