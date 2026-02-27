export interface TermDefinition {
  term: string;
  hanja?: string;
  short: string;
  detail?: string;
}

export const SAJU_TERMS: Record<string, TermDefinition> = {
  // 기본 구조
  사주: {
    term: '사주',
    hanja: '四柱',
    short: '년·월·일·시 네 기둥',
    detail: '태어난 년, 월, 일, 시를 각각 하나의 기둥(柱)으로 보아 총 네 기둥으로 운명을 분석하는 체계입니다.',
  },
  팔자: {
    term: '팔자',
    hanja: '八字',
    short: '네 기둥의 여덟 글자',
    detail: '사주의 네 기둥에 각각 천간·지지 두 글자씩, 총 여덟 글자로 구성됩니다.',
  },
  천간: {
    term: '천간',
    hanja: '天干',
    short: '하늘의 기운을 나타내는 10글자',
    detail: '갑·을·병·정·무·기·경·신·임·계의 10가지로, 하늘의 기운과 외적 성향을 나타냅니다.',
  },
  지지: {
    term: '지지',
    hanja: '地支',
    short: '땅의 기운을 나타내는 12글자',
    detail: '자·축·인·묘·진·사·오·미·신·유·술·해의 12가지로, 땅의 기운과 내적 성향을 나타냅니다.',
  },
  간지: {
    term: '간지',
    hanja: '干支',
    short: '천간과 지지를 합친 표현',
    detail: '천간(天干)과 지지(地支)를 조합하여 60갑자를 이루는 동양의 기년법입니다.',
  },
  사주팔자: {
    term: '사주팔자',
    hanja: '四柱八字',
    short: '네 기둥 여덟 글자의 운명 체계',
    detail: '태어난 년·월·일·시를 천간과 지지로 표현한 여덟 글자로 운명을 분석하는 동양 명리학의 핵심 체계입니다.',
  },
  년주: {
    term: '년주',
    hanja: '年柱',
    short: '태어난 해의 기둥',
    detail: '태어난 해를 천간·지지로 표현한 것으로, 조상운과 초년운(1~15세)을 나타냅니다.',
  },
  월주: {
    term: '월주',
    hanja: '月柱',
    short: '태어난 달의 기둥',
    detail: '태어난 달을 천간·지지로 표현한 것으로, 부모운과 청년운(16~30세)을 나타냅니다.',
  },
  일주: {
    term: '일주',
    hanja: '日柱',
    short: '태어난 날의 기둥',
    detail: '태어난 날을 천간·지지로 표현한 것으로, 본인과 배우자운, 중년운(31~45세)을 나타냅니다.',
  },
  시주: {
    term: '시주',
    hanja: '時柱',
    short: '태어난 시간의 기둥',
    detail: '태어난 시간을 천간·지지로 표현한 것으로, 자녀운과 말년운(46세 이후)을 나타냅니다.',
  },
  일간: {
    term: '일간',
    hanja: '日干',
    short: '일주의 천간, 나 자신을 상징',
    detail: '일주(日柱)의 천간으로 사주 분석의 중심이 됩니다. 나의 본질적 성격과 정체성을 대표합니다.',
  },

  // 오행
  오행: {
    term: '오행',
    hanja: '五行',
    short: '목·화·토·금·수 다섯 기운',
    detail: '만물을 구성하는 다섯 가지 기운으로, 서로 돕고(상생) 억제하는(상극) 관계를 이룹니다.',
  },
  목: {
    term: '목',
    hanja: '木',
    short: '나무의 기운, 성장과 인자함',
    detail: '봄, 동쪽, 청색을 상징하며, 성장·발전·인자함·유연함의 기운을 가집니다.',
  },
  화: {
    term: '화',
    hanja: '火',
    short: '불의 기운, 열정과 예의',
    detail: '여름, 남쪽, 적색을 상징하며, 열정·예의·밝음·확산의 기운을 가집니다.',
  },
  토: {
    term: '토',
    hanja: '土',
    short: '흙의 기운, 신뢰와 중재',
    detail: '환절기, 중앙, 황색을 상징하며, 신뢰·안정·포용·중재의 기운을 가집니다.',
  },
  금: {
    term: '금',
    hanja: '金',
    short: '쇠의 기운, 결단과 의리',
    detail: '가을, 서쪽, 백색을 상징하며, 결단력·의리·정확함·수렴의 기운을 가집니다.',
  },
  수: {
    term: '수',
    hanja: '水',
    short: '물의 기운, 지혜와 유연함',
    detail: '겨울, 북쪽, 흑색을 상징하며, 지혜·유연함·소통·저장의 기운을 가집니다.',
  },
  상생: {
    term: '상생',
    hanja: '相生',
    short: '오행이 서로 돕는 관계',
    detail: '목→화→토→금→수→목 순서로 서로를 생해주는 관계입니다. 에너지가 순환하며 도움을 줍니다.',
  },
  상극: {
    term: '상극',
    hanja: '相剋',
    short: '오행이 서로 억제하는 관계',
    detail: '목→토→수→화→금→목 순서로 서로를 극하는 관계입니다. 균형을 위해 필요한 견제 작용입니다.',
  },

  // 음양
  음양: {
    term: '음양',
    hanja: '陰陽',
    short: '만물의 두 가지 상반된 기운',
    detail: '양(陽)은 밝고 능동적이며 외향적, 음(陰)은 어둡고 수동적이며 내향적인 기운입니다.',
  },
  음: {
    term: '음',
    hanja: '陰',
    short: '어둡고 수동적인 기운',
  },
  양: {
    term: '양',
    hanja: '陽',
    short: '밝고 능동적인 기운',
  },

  // 십신
  십신: {
    term: '십신',
    hanja: '十神',
    short: '일간 기준 10가지 관계 유형',
    detail: '일간(나)을 기준으로 다른 글자와의 관계를 10가지로 분류한 것으로, 성격·적성·인간관계를 분석합니다.',
  },
  비견: {
    term: '비견',
    hanja: '比肩',
    short: '나와 같은 오행, 같은 음양',
    detail: '동료·형제·경쟁자를 의미합니다. 독립심과 자존심이 강하며 주체적입니다.',
  },
  겁재: {
    term: '겁재',
    hanja: '劫財',
    short: '나와 같은 오행, 다른 음양',
    detail: '경쟁·도전·투쟁을 의미합니다. 승부욕이 강하고 재물 변동이 있을 수 있습니다.',
  },
  식신: {
    term: '식신',
    hanja: '食神',
    short: '내가 생하는 오행, 같은 음양',
    detail: '표현력·창의력·식복을 의미합니다. 온화하고 낙천적이며 예술적 감각이 있습니다.',
  },
  상관: {
    term: '상관',
    hanja: '傷官',
    short: '내가 생하는 오행, 다른 음양',
    detail: '재능·반항·자유를 의미합니다. 비판적이고 창의적이며 기존 질서에 도전합니다.',
  },
  편재: {
    term: '편재',
    hanja: '偏財',
    short: '내가 극하는 오행, 같은 음양',
    detail: '유동재산·투기·사교를 의미합니다. 사업수완이 있고 대인관계가 넓습니다.',
  },
  정재: {
    term: '정재',
    hanja: '正財',
    short: '내가 극하는 오행, 다른 음양',
    detail: '고정재산·근면·절약을 의미합니다. 성실하고 안정적인 재물운을 가집니다.',
  },
  편관: {
    term: '편관',
    hanja: '偏官',
    short: '나를 극하는 오행, 같은 음양',
    detail: '권력·위엄·강제를 의미합니다. 리더십이 강하고 결단력이 있으나 독선적일 수 있습니다.',
  },
  정관: {
    term: '정관',
    hanja: '正官',
    short: '나를 극하는 오행, 다른 음양',
    detail: '명예·규율·질서를 의미합니다. 책임감이 강하고 사회적 신용을 중시합니다.',
  },
  편인: {
    term: '편인',
    hanja: '偏印',
    short: '나를 생하는 오행, 같은 음양',
    detail: '비정통학문·직감·고독을 의미합니다. 독특한 사고방식과 예술적 재능이 있습니다.',
  },
  정인: {
    term: '정인',
    hanja: '正印',
    short: '나를 생하는 오행, 다른 음양',
    detail: '학문·지식·모성을 의미합니다. 학습능력이 뛰어나고 인자하며 보수적입니다.',
  },

  // 용신 체계
  용신: {
    term: '용신',
    hanja: '用神',
    short: '사주에서 가장 필요한 오행',
    detail: '사주의 균형을 맞추기 위해 가장 필요한 오행입니다. 이 오행이 강해지는 시기에 운이 좋아집니다.',
  },
  희신: {
    term: '희신',
    hanja: '喜神',
    short: '용신을 도와주는 오행',
    detail: '용신을 생하거나 도와주는 오행으로, 용신 다음으로 좋은 역할을 합니다.',
  },
  기신: {
    term: '기신',
    hanja: '忌神',
    short: '사주에 해로운 오행',
    detail: '사주의 균형을 해치는 오행으로, 이 오행이 강해지는 시기에 어려움이 올 수 있습니다.',
  },
  구신: {
    term: '구신',
    hanja: '仇神',
    short: '기신을 도와주는 오행',
    detail: '기신을 생하거나 도와주는 오행으로, 간접적으로 사주에 불리하게 작용합니다.',
  },
  한신: {
    term: '한신',
    hanja: '閑神',
    short: '사주에 큰 영향 없는 중립 오행',
    detail: '용신·희신도, 기신·구신도 아닌 중립적인 오행으로, 큰 영향을 미치지 않습니다.',
  },
  신강: {
    term: '신강',
    hanja: '身強',
    short: '일간의 힘이 강한 상태',
    detail: '일간(나)을 돕는 오행이 많아 에너지가 넘치는 상태입니다. 설기(에너지 발산)가 필요합니다.',
  },
  신약: {
    term: '신약',
    hanja: '身弱',
    short: '일간의 힘이 약한 상태',
    detail: '일간(나)을 극하는 오행이 많아 에너지가 부족한 상태입니다. 인성·비겁의 도움이 필요합니다.',
  },
  중화: {
    term: '중화',
    hanja: '中和',
    short: '일간의 힘이 균형 잡힌 상태',
    detail: '일간의 힘과 다른 오행의 힘이 적절히 균형을 이룬 이상적인 상태입니다.',
  },
  억부법: {
    term: '억부법',
    hanja: '抑扶法',
    short: '강하면 억제, 약하면 도움',
    detail: '일간이 강하면 억제(설기·극)하고, 약하면 도와주는(생·비겁) 방식으로 용신을 결정합니다.',
  },
  조후법: {
    term: '조후법',
    hanja: '調候法',
    short: '사주의 온도·습도 조절',
    detail: '사주가 너무 차거나 뜨거울 때 기후를 조절하는 오행을 용신으로 정하는 방법입니다.',
  },

  // 지장간
  지장간: {
    term: '지장간',
    hanja: '支藏干',
    short: '지지 속에 숨은 천간',
    detail: '각 지지 안에 숨어 있는 천간으로, 정기·중기·여기로 나뉘며 내면의 성향을 나타냅니다.',
  },
  정기: {
    term: '정기',
    hanja: '正氣',
    short: '지장간의 주된 기운',
    detail: '지지 안에 가장 강하게 작용하는 천간으로, 해당 지지의 본질적 성격을 대표합니다.',
  },
  중기: {
    term: '중기',
    hanja: '中氣',
    short: '지장간의 중간 기운',
    detail: '지지 안에서 정기 다음으로 영향력 있는 천간입니다.',
  },
  여기: {
    term: '여기',
    hanja: '餘氣',
    short: '지장간의 잔여 기운',
    detail: '지지 안에서 가장 약하게 남아있는 천간으로, 미세한 영향을 줍니다.',
  },

  // 운세
  대운: {
    term: '대운',
    hanja: '大運',
    short: '10년 단위의 큰 운의 흐름',
    detail: '10년마다 바뀌는 큰 운의 흐름으로, 인생의 전체적인 방향과 기회를 보여줍니다.',
  },
  세운: {
    term: '세운',
    hanja: '歲運',
    short: '해당 연도의 운세',
    detail: '매년 바뀌는 운으로, 그 해의 천간·지지가 사주와 어떤 관계인지 분석합니다.',
  },
  월운: {
    term: '월운',
    hanja: '月運',
    short: '해당 월의 운세',
    detail: '매월 바뀌는 운으로, 그 달의 천간·지지가 사주와 어떤 관계인지 분석합니다.',
  },
  일운: {
    term: '일운',
    hanja: '日運',
    short: '해당 일의 운세',
    detail: '매일 바뀌는 운으로, 그날의 천간·지지가 사주와 어떤 관계인지 분석합니다.',
  },

  // 관계
  합: {
    term: '합',
    hanja: '合',
    short: '글자끼리 결합하는 관계',
    detail: '두 글자가 결합하여 새로운 기운을 만들어내는 긍정적 관계입니다.',
  },
  충: {
    term: '충',
    hanja: '沖',
    short: '글자끼리 부딪히는 관계',
    detail: '두 글자가 정면으로 충돌하는 관계로, 변동·이동·갈등을 의미합니다.',
  },

  형: {
    term: '형',
    hanja: '刑',
    short: '글자끼리 해치는 관계',
    detail: '지지끼리 형벌처럼 서로 해치는 관계로, 시비·구설·법적 문제를 의미합니다.',
  },
  자형: {
    term: '자형',
    hanja: '自刑',
    short: '같은 지지끼리의 형',
    detail: '같은 지지가 중복될 때 발생하며, 자기 자신을 해치는 관계입니다. 자충수·자만에 주의해야 합니다.',
  },
  파: {
    term: '파',
    hanja: '破',
    short: '글자끼리 깨뜨리는 관계',
    detail: '지지끼리 서로 깨뜨리는 관계로, 약속 파기·계획 변경·관계 손상을 의미합니다.',
  },
  해: {
    term: '해',
    hanja: '害',
    short: '글자끼리 해를 끼치는 관계',
    detail: '지지끼리 은밀하게 해를 끼치는 관계로, 배신·질투·원한 등을 의미합니다.',
  },
  천간합: {
    term: '천간합',
    hanja: '天干合',
    short: '천간끼리 결합하는 관계',
    detail: '갑기합토·을경합금·병신합수·정임합목·무계합화 다섯 가지가 있으며, 새로운 오행을 만듭니다.',
  },
  천간충: {
    term: '천간충',
    hanja: '天干沖',
    short: '천간끼리 부딪히는 관계',
    detail: '갑경·을신·병임·정계 네 가지가 있으며, 천간의 기운이 충돌합니다.',
  },
  육합: {
    term: '육합',
    hanja: '六合',
    short: '지지 둘이 결합하는 관계',
    detail: '자축·인해·묘술·진유·사신·오미 여섯 쌍이 합하여 새로운 오행을 만듭니다.',
  },
  삼합: {
    term: '삼합',
    hanja: '三合',
    short: '지지 셋이 결합하는 관계',
    detail: '인오술(화국)·사유축(금국)·신자진(수국)·해묘미(목국) 네 가지가 있으며, 강력한 오행을 형성합니다.',
  },
  방합: {
    term: '방합',
    hanja: '方合',
    short: '같은 방위 지지 셋의 결합',
    detail: '인묘진(동방목)·사오미(남방화)·신유술(서방금)·해자축(북방수) 네 가지로, 방위의 힘을 모읍니다.',
  },
  육충: {
    term: '육충',
    hanja: '六沖',
    short: '지지끼리 정면 충돌하는 관계',
    detail: '자오·축미·인신·묘유·진술·사해 여섯 쌍이 충돌하며, 변동·분리·갈등을 의미합니다.',
  },

  // 시간
  야자시: {
    term: '야자시',
    hanja: '夜子時',
    short: '밤 23시~24시의 자시',
    detail: '23:00~23:59를 말하며, 전통 명리학에서 다음날 자시로 볼지 당일로 볼지 학파에 따라 다릅니다.',
  },

  // 기타
  음력: {
    term: '음력',
    hanja: '陰曆',
    short: '달의 움직임 기준 달력',
    detail: '달의 차고 기울음을 기준으로 한 달력입니다. 사주에서는 절기를 기준으로 월을 구분합니다.',
  },
  양력: {
    term: '양력',
    hanja: '陽曆',
    short: '태양의 움직임 기준 달력',
    detail: '태양의 움직임을 기준으로 한 달력으로, 현재 국제적으로 사용되는 그레고리력입니다.',
  },
  윤달: {
    term: '윤달',
    hanja: '閏月',
    short: '음력에서 추가되는 달',
    detail: '음력과 양력의 차이를 보정하기 위해 약 3년마다 한 번씩 추가되는 달입니다.',
  },
  진태양시: {
    term: '진태양시',
    hanja: '眞太陽時',
    short: '실제 태양 위치 기준 시간',
    detail: '출생지의 경도와 균시차를 반영하여 보정한 실제 태양의 위치에 따른 시간입니다.',
  },
  궁합: {
    term: '궁합',
    hanja: '宮合',
    short: '두 사람 사주의 조화도 분석',
    detail: '두 사람의 사주를 비교하여 오행의 조화, 일간 관계 등을 분석하는 것입니다.',
  },
  결여오행: {
    term: '결여 오행',
    hanja: '缺如五行',
    short: '사주에 없는 오행',
    detail: '사주 팔자에 전혀 나타나지 않는 오행으로, 해당 기운이 부족하여 보완이 필요합니다.',
  },
  일간강약: {
    term: '일간 강약',
    hanja: '日干強弱',
    short: '일간(나)의 힘의 세기',
    detail: '사주에서 일간을 돕는 오행과 극하는 오행의 비율로 판단하며, 용신 결정의 기초가 됩니다.',
  },
  천간십신: {
    term: '천간 십신',
    hanja: '天干十神',
    short: '천간의 십신 관계',
    detail: '각 기둥의 천간이 일간과 어떤 십신 관계인지를 나타냅니다.',
  },
  지지십신: {
    term: '지지 십신',
    hanja: '地支十神',
    short: '지지의 십신 관계',
    detail: '각 기둥의 지지 정기(正氣)가 일간과 어떤 십신 관계인지를 나타냅니다.',
  },
  오행비교: {
    term: '오행 비교',
    hanja: '五行比較',
    short: '두 사주의 오행 분포 비교',
    detail: '두 사람의 오행 분포를 비교하여 상호 보완 관계와 충돌 여부를 분석합니다.',
  },
};

/**
 * 관계 이름(예: "을경합금", "진진자형")에서 적절한 용어 키를 추출합니다.
 * 긴 키워드부터 매칭해야 "자형"이 "형"보다 먼저 잡힙니다.
 */
const RELATIONSHIP_KEYWORDS = ['삼합', '방합', '자형', '육합', '육충', '천간합', '천간충', '합', '충', '형', '파', '해'] as const;

export function getRelationshipTermKey(name: string): string | null {
  for (const kw of RELATIONSHIP_KEYWORDS) {
    if (name.includes(kw)) return kw;
  }
  return null;
}

// ===== 동적 관계 설명 생성 =====

const CHEONGAN_HANJA_MAP: Record<string, string> = {
  '갑': '甲', '을': '乙', '병': '丙', '정': '丁', '무': '戊',
  '기': '己', '경': '庚', '신': '辛', '임': '壬', '계': '癸',
};

const JIJI_HANJA_MAP: Record<string, string> = {
  '자': '子', '축': '丑', '인': '寅', '묘': '卯', '진': '辰', '사': '巳',
  '오': '午', '미': '未', '신': '申', '유': '酉', '술': '戌', '해': '亥',
};

const ELEMENT_HANJA_MAP: Record<string, string> = {
  '목': '木', '화': '火', '토': '土', '금': '金', '수': '水',
};

const CHEONGAN_ELEMENT_MAP: Record<string, string> = {
  '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
  '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
};

function hanjaFor(char: string): string {
  return CHEONGAN_HANJA_MAP[char] || JIJI_HANJA_MAP[char] || '';
}

function elementHanja(element: string): string {
  return ELEMENT_HANJA_MAP[element] || '';
}

/**
 * 관계명(예: "을경합금", "진진자형")을 파싱하여 구체적인 TermDefinition을 동적 생성합니다.
 */
export function generateRelationshipDef(name: string): TermDefinition | null {
  // 천간합: "을경합금" → 을(乙) + 경(庚) + 합 + 금(金)
  if (/^(.)(.)합(.)$/.test(name)) {
    const [, a, b, element] = name.match(/^(.)(.)합(.)$/)!;
    const isCheongan = !!CHEONGAN_HANJA_MAP[a];
    if (isCheongan) {
      return {
        term: name,
        hanja: `${hanjaFor(a)}${hanjaFor(b)}合${elementHanja(element)}`,
        short: `${a}(${hanjaFor(a)})과 ${b}(${hanjaFor(b)})이 합하여 ${element}(${elementHanja(element)})을 이룸`,
        detail: `천간합의 하나입니다. ${a}(${CHEONGAN_ELEMENT_MAP[a]})과 ${b}(${CHEONGAN_ELEMENT_MAP[b]})이 만나면 서로 결합하여 ${element}(${elementHanja(element)}) 오행의 성질로 변화합니다.`,
      };
    }
    // 지지 육합: "자축합토"
    return {
      term: name,
      hanja: `${hanjaFor(a)}${hanjaFor(b)}合${elementHanja(element)}`,
      short: `${a}(${hanjaFor(a)})와 ${b}(${hanjaFor(b)})가 합하여 ${element}(${elementHanja(element)})을 이룸`,
      detail: `육합(六合)의 하나입니다. 지지 ${a}와 ${b}가 결합하여 ${element}(${elementHanja(element)}) 오행의 기운을 만들어냅니다.`,
    };
  }

  // 삼합: "인오술삼합화"
  if (/^(.)(.)(.)삼합(.)$/.test(name)) {
    const [, a, b, c, element] = name.match(/^(.)(.)(.)삼합(.)$/)!;
    return {
      term: name,
      hanja: `${hanjaFor(a)}${hanjaFor(b)}${hanjaFor(c)}三合${elementHanja(element)}`,
      short: `${a}·${b}·${c} 셋이 삼합하여 ${element}(${elementHanja(element)})국을 이룸`,
      detail: `삼합(三合)의 하나입니다. 지지 ${a}(${hanjaFor(a)})·${b}(${hanjaFor(b)})·${c}(${hanjaFor(c)}) 세 글자가 모여 강력한 ${element}(${elementHanja(element)})의 기운을 형성합니다.`,
    };
  }

  // 방합: "인묘진방합목"
  if (/^(.)(.)(.)방합(.)$/.test(name)) {
    const [, a, b, c, element] = name.match(/^(.)(.)(.)방합(.)$/)!;
    const directions: Record<string, string> = { '목': '동방', '화': '남방', '금': '서방', '수': '북방' };
    const dir = directions[element] || '';
    return {
      term: name,
      hanja: `${hanjaFor(a)}${hanjaFor(b)}${hanjaFor(c)}方合${elementHanja(element)}`,
      short: `${a}·${b}·${c} 셋이 ${dir} ${element}(${elementHanja(element)})으로 방합`,
      detail: `방합(方合)의 하나입니다. 같은 방위(${dir})의 지지 ${a}·${b}·${c}가 모여 ${element}(${elementHanja(element)}) 오행의 기운을 강하게 결집합니다.`,
    };
  }

  // 자형: "진진자형"
  if (/^(.)\1자형$/.test(name)) {
    const char = name[0];
    return {
      term: name,
      hanja: `${hanjaFor(char)}${hanjaFor(char)}自刑`,
      short: `${char}(${hanjaFor(char)})가 중복되어 스스로를 해치는 자형`,
      detail: `자형(自刑)입니다. 같은 지지 ${char}(${hanjaFor(char)})가 중복되면 에너지가 과잉되어 자기 자신을 해치는 작용을 합니다. 고집·자충수에 주의가 필요합니다.`,
    };
  }

  // 형: "인사형", "축술형", "자묘형"
  if (/^(.)(.)형$/.test(name)) {
    const [, a, b] = name.match(/^(.)(.)형$/)!;
    return {
      term: name,
      hanja: `${hanjaFor(a)}${hanjaFor(b)}刑`,
      short: `${a}(${hanjaFor(a)})와 ${b}(${hanjaFor(b)})가 서로 형(刑)하는 관계`,
      detail: `형(刑)의 하나입니다. 지지 ${a}(${hanjaFor(a)})와 ${b}(${hanjaFor(b)})가 서로 해치는 관계로, 시비·구설·법적 문제에 주의가 필요합니다.`,
    };
  }

  // 충: "자오충", "갑경충"
  if (/^(.)(.)충$/.test(name)) {
    const [, a, b] = name.match(/^(.)(.)충$/)!;
    const isCheongan = !!CHEONGAN_HANJA_MAP[a];
    return {
      term: name,
      hanja: `${hanjaFor(a)}${hanjaFor(b)}沖`,
      short: `${a}(${hanjaFor(a)})와 ${b}(${hanjaFor(b)})가 정면 충돌`,
      detail: `${isCheongan ? '천간충' : '육충'}의 하나입니다. ${a}(${hanjaFor(a)})와 ${b}(${hanjaFor(b)})가 정면으로 부딪혀 변동·이동·갈등을 암시합니다.`,
    };
  }

  // 파: "자유파"
  if (/^(.)(.)파$/.test(name)) {
    const [, a, b] = name.match(/^(.)(.)파$/)!;
    return {
      term: name,
      hanja: `${hanjaFor(a)}${hanjaFor(b)}破`,
      short: `${a}(${hanjaFor(a)})와 ${b}(${hanjaFor(b)})가 서로 깨뜨리는 관계`,
      detail: `파(破)의 하나입니다. 지지 ${a}(${hanjaFor(a)})와 ${b}(${hanjaFor(b)})가 서로 깨뜨려 약속 파기·계획 변경·관계 손상을 의미합니다.`,
    };
  }

  // 해: "자미해"
  if (/^(.)(.)해$/.test(name)) {
    const [, a, b] = name.match(/^(.)(.)해$/)!;
    // "해"라는 지지도 있으므로 실제 해(害)인지 확인
    if (JIJI_HANJA_MAP[a] && JIJI_HANJA_MAP[b]) {
      return {
        term: name,
        hanja: `${hanjaFor(a)}${hanjaFor(b)}害`,
        short: `${a}(${hanjaFor(a)})와 ${b}(${hanjaFor(b)})가 은밀히 해를 끼치는 관계`,
        detail: `해(害)의 하나입니다. 지지 ${a}(${hanjaFor(a)})와 ${b}(${hanjaFor(b)})가 은밀하게 해를 끼쳐 배신·질투·원한에 주의가 필요합니다.`,
      };
    }
  }

  return null;
}
