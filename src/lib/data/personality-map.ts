import type { Cheongan, Jiji, PersonalityProfile } from '../saju/types';
import { logger } from '../logger';

const MOD = 'personality-map';

/**
 * 일주(日柱) 기반 성격/적성 맵
 * 일간 + 일지 조합별 성격 프로파일
 */

// 일간별 기본 성격
const DAY_MASTER_PERSONALITY: Record<Cheongan, { base: string; trait: string }> = {
  '갑': { base: '큰 나무', trait: '곧고 정직하며 리더십이 강합니다. 자존심이 강하고 의지가 굳습니다.' },
  '을': { base: '풀과 꽃', trait: '유연하고 적응력이 뛰어납니다. 섬세하고 인내심이 강합니다.' },
  '병': { base: '태양', trait: '밝고 활동적이며 열정적입니다. 화려하고 자기표현이 강합니다.' },
  '정': { base: '촛불', trait: '따뜻하고 섬세합니다. 내면이 깊고 집중력이 뛰어납니다.' },
  '무': { base: '큰 산', trait: '듬직하고 신뢰감이 있습니다. 안정적이고 포용력이 큽니다.' },
  '기': { base: '들판의 흙', trait: '겸손하고 실용적입니다. 착실하고 배려심이 깊습니다.' },
  '경': { base: '바위/칼', trait: '강직하고 결단력이 있습니다. 의리가 있고 원칙을 중시합니다.' },
  '신': { base: '보석', trait: '섬세하고 완벽주의 성향이 있습니다. 예리한 감각을 가지고 있습니다.' },
  '임': { base: '큰 바다', trait: '포용력이 크고 지혜로웠습니다. 자유롭고 모험심이 강합니다.' },
  '계': { base: '빗물/이슬', trait: '총명하고 감수성이 풍부합니다. 적응력이 뛰어나고 기획력이 좋습니다.' },
};

// 일지별 보조 성격 (내면/배우자궁)
const DAY_BRANCH_TRAIT: Record<Jiji, string> = {
  '자': '지적 호기심이 강하고 밤에 활동력이 좋습니다.',
  '축': '끈기와 인내심이 뛰어나며 실속을 중시합니다.',
  '인': '진취적이고 도전정신이 강합니다. 활동적입니다.',
  '묘': '예술적 감각이 뛰어나고 사교적입니다.',
  '진': '야망이 크고 자존심이 강합니다. 리더십이 있습니다.',
  '사': '지혜롭고 직관력이 뛰어납니다. 변화를 좋아합니다.',
  '오': '열정적이고 급한 성격이지만 정이 많습니다.',
  '미': '온순하고 배려심이 깊으며 미식가 기질이 있습니다.',
  '신': '재치가 있고 다재다능합니다. 변화에 능합니다.',
  '유': '꼼꼼하고 완벽주의 성향입니다. 말솜씨가 좋습니다.',
  '술': '의리가 있고 충실합니다. 고집이 있지만 신뢰를 줍니다.',
  '해': '마음이 넓고 아이디어가 풍부합니다. 동정심이 있습니다.',
};

// 일간별 직업 적성
const CAREER_MAP: Record<Cheongan, string[]> = {
  '갑': ['CEO/경영자', '정치인', '교육자', '건축/부동산', '체육/스포츠'],
  '을': ['디자이너', '상담사', '한의사', '플로리스트', '음악가'],
  '병': ['방송인', '연예인', '마케터', '외교관', '강사/교수'],
  '정': ['작가', '요리사', '연구원', '종교인', '공예가'],
  '무': ['토목/건설', '농업', '부동산', '행정가', '중재인'],
  '기': ['사무직', '농업', '요식업', '사회복지사', '약사'],
  '경': ['군인/경찰', '외과의사', '검사/판사', 'IT엔지니어', '기계공학'],
  '신': ['주얼리디자이너', '변호사', '세무사', '금융분석가', '성형외과'],
  '임': ['무역업', '해운/항공', '여행업', '철학자', '탐험가'],
  '계': ['작가/시인', '심리학자', '점술가', '프로그래머', '기획자'],
};

/**
 * 일주 기반 성격 프로파일 생성
 */
export function getPersonalityProfile(dayMaster: Cheongan, dayBranch: Jiji): PersonalityProfile {
  logger.info(MOD, `getPersonalityProfile 호출`, { dayMaster, dayBranch });

  const masterInfo = DAY_MASTER_PERSONALITY[dayMaster];
  const branchTrait = DAY_BRANCH_TRAIT[dayBranch];
  const careers = CAREER_MAP[dayMaster];

  const title = `${dayMaster}일간 (${masterInfo.base}의 기운)`;
  const summary = `${masterInfo.trait} 내면적으로는 ${branchTrait}`;

  // 강점/약점 생성
  const strengthMap: Record<Cheongan, string[]> = {
    '갑': ['리더십', '결단력', '정직함', '책임감'],
    '을': ['적응력', '인내심', '섬세함', '협동심'],
    '병': ['열정', '사교성', '낙관적', '창의력'],
    '정': ['집중력', '섬세함', '배려심', '꼼꼼함'],
    '무': ['포용력', '신뢰감', '안정감', '중재력'],
    '기': ['실용성', '겸손함', '꾸준함', '배려심'],
    '경': ['결단력', '의리', '정의감', '실행력'],
    '신': ['완벽주의', '분석력', '감각', '정밀함'],
    '임': ['포용력', '지혜', '모험심', '자유로움'],
    '계': ['총명함', '감수성', '기획력', '직관력'],
  };

  const weaknessMap: Record<Cheongan, string[]> = {
    '갑': ['고집', '독선적', '융통성 부족', '타협 어려움'],
    '을': ['우유부단', '의존적', '소극적', '걱정 많음'],
    '병': ['충동적', '과시욕', '지속력 부족', '산만함'],
    '정': ['소심함', '의심', '폐쇄적', '비관적'],
    '무': ['느린 결단', '보수적', '변화 거부', '무뚝뚝'],
    '기': ['소극적', '자신감 부족', '걱정', '미련'],
    '경': ['냉정함', '강압적', '완고함', '독선'],
    '신': ['예민함', '불만', '비판적', '질투'],
    '임': ['방황', '무책임', '산만함', '변덕'],
    '계': ['감정적', '우울', '비밀주의', '기복'],
  };

  const result = {
    title,
    summary,
    strengths: strengthMap[dayMaster],
    weaknesses: weaknessMap[dayMaster],
    career: careers,
    relationships: `${dayMaster}일간의 배우자궁(일지)이 ${dayBranch}이므로, ${branchTrait} 이러한 특성을 가진 배우자와 인연이 있습니다.`,
  };

  logger.info(MOD, `getPersonalityProfile 결과`, { title, strengths: result.strengths, careers });
  return result;
}
