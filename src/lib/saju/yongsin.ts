import type { FourPillars, FiveElement, YongsinAnalysis } from './types';
import { CHEONGAN_ELEMENT, GENERATES, OVERCOMES, GENERATED_BY, OVERCOME_BY, HIDDEN_STEMS } from './constants';
import { analyzeFiveElements } from './five-elements';
import { logger } from '../logger';

const MOD = 'yongsin';

/**
 * 조후용신 테이블 (월지 + 일간 오행별 필요 오행)
 * 월지를 기준으로 더위/추위에 따라 필요한 오행 판단
 */
const TEMPERATURE_YONGSIN: Record<string, Record<FiveElement, FiveElement>> = {
  // 인월(1), 묘월(2): 초봄 - 아직 추움, 화 필요
  '인': { '목': '화', '화': '목', '토': '화', '금': '화', '수': '화' },
  '묘': { '목': '화', '화': '토', '토': '화', '금': '화', '수': '화' },
  // 진월(3): 늦봄 - 습기, 목/화 필요
  '진': { '목': '화', '화': '토', '토': '화', '금': '화', '수': '화' },
  // 사월(4), 오월(5): 여름 - 더움, 수 필요
  '사': { '목': '수', '화': '수', '토': '수', '금': '수', '수': '금' },
  '오': { '목': '수', '화': '수', '토': '수', '금': '수', '수': '금' },
  // 미월(6): 늦여름 - 무더움, 수 필요
  '미': { '목': '수', '화': '수', '토': '수', '금': '수', '수': '금' },
  // 신월(7), 유월(8): 가을 - 서늘, 화/목 필요
  '신': { '목': '화', '화': '목', '토': '화', '금': '화', '수': '화' },
  '유': { '목': '화', '화': '목', '토': '화', '금': '화', '수': '화' },
  // 술월(9): 늦가을 - 건조, 수/화 필요
  '술': { '목': '수', '화': '토', '토': '수', '금': '수', '수': '화' },
  // 해월(10), 자월(11): 겨울 - 추움, 화 필요
  '해': { '목': '화', '화': '목', '토': '화', '금': '화', '수': '화' },
  '자': { '목': '화', '화': '목', '토': '화', '금': '화', '수': '화' },
  // 축월(12): 늦겨울 - 매우 추움, 화 필요
  '축': { '목': '화', '화': '목', '토': '화', '금': '화', '수': '화' },
};

/**
 * 억부용신 판단
 * - 신강: 일간을 약하게 하는 오행 (설기, 극제, 재성)
 * - 신약: 일간을 강하게 하는 오행 (인성, 비겁)
 */
function getSuppressionYongsin(
  dayMasterElement: FiveElement,
  strength: 'strong' | 'weak' | 'neutral'
): { yongsin: FiveElement; huisin: FiveElement; gisin: FiveElement; gusin: FiveElement; hansin: FiveElement } {
  logger.debug(MOD, `getSuppressionYongsin`, { dayMasterElement, strength });

  if (strength === 'strong' || strength === 'neutral') {
    // 신강: 설기(식상) > 극제(관성) > 누설(재성)
    const yongsin = GENERATES[dayMasterElement];   // 식상 (내가 생하는 오행)
    const huisin = OVERCOMES[dayMasterElement];    // 재성 (내가 극하는 오행)
    const gisin = GENERATED_BY[dayMasterElement];  // 인성 (나를 생하는 오행) - 기신
    const gusin = dayMasterElement;                 // 비겁 (같은 오행) - 구신
    const hansin = OVERCOME_BY[dayMasterElement];  // 관성 (나를 극하는 오행)
    logger.debug(MOD, `신강/중화 억부용신`, { yongsin, huisin, gisin, gusin, hansin });
    return { yongsin, huisin, gisin, gusin, hansin };
  } else {
    // 신약: 인성 > 비겁
    const yongsin = GENERATED_BY[dayMasterElement]; // 인성 (나를 생하는 오행)
    const huisin = dayMasterElement;                 // 비겁 (같은 오행)
    const gisin = OVERCOMES[dayMasterElement];      // 재성 (내가 극하는 오행) - 기신
    const gusin = GENERATES[dayMasterElement];      // 식상 (내가 생하는 오행) - 구신
    const hansin = OVERCOME_BY[dayMasterElement];   // 관성 (나를 극하는 오행)
    logger.debug(MOD, `신약 억부용신`, { yongsin, huisin, gisin, gusin, hansin });
    return { yongsin, huisin, gisin, gusin, hansin };
  }
}

/**
 * 용신 종합 분석
 */
export function analyzeYongsin(
  fourPillars: FourPillars,
  solarYear: number,
  solarMonth: number,
  solarDay: number
): YongsinAnalysis {
  logger.info(MOD, `analyzeYongsin 시작`, { solarYear, solarMonth, solarDay });

  const fiveElementAnalysis = analyzeFiveElements(fourPillars, solarYear, solarMonth, solarDay);
  const dayMasterElement = fiveElementAnalysis.dayMasterElement;
  const strength = fiveElementAnalysis.dayMasterStrength;

  logger.info(MOD, `일간 오행/강약`, { dayMasterElement, strength, score: fiveElementAnalysis.strengthScore });

  // 1. 억부용신
  const suppression = getSuppressionYongsin(dayMasterElement, strength);

  // 2. 조후용신 참조
  const monthJiji = fourPillars.month.ganJi.jiji;
  const tempYongsin = TEMPERATURE_YONGSIN[monthJiji]?.[dayMasterElement];
  logger.info(MOD, `조후용신`, { monthJiji, tempYongsin });

  // 3. 최종 판단 - 억부와 조후가 일치하면 확신도 높음
  const reasoning: string[] = [];

  if (strength === 'strong') {
    reasoning.push(`일간 ${dayMasterElement}이(가) 신강(身強)합니다. (강약점수: ${fiveElementAnalysis.strengthScore}점)`);
    reasoning.push(`신강한 일간을 설기(泄氣)하는 ${suppression.yongsin}을(를) 용신으로 삼습니다.`);
  } else if (strength === 'weak') {
    reasoning.push(`일간 ${dayMasterElement}이(가) 신약(身弱)합니다. (강약점수: ${fiveElementAnalysis.strengthScore}점)`);
    reasoning.push(`신약한 일간을 생해주는 ${suppression.yongsin}을(를) 용신으로 삼습니다.`);
  } else {
    reasoning.push(`일간 ${dayMasterElement}이(가) 중화(中和)에 가깝습니다. (강약점수: ${fiveElementAnalysis.strengthScore}점)`);
    reasoning.push(`조후(調候)를 우선하여 용신을 판단합니다.`);
  }

  if (tempYongsin) {
    if (tempYongsin === suppression.yongsin) {
      reasoning.push(`조후용신(${tempYongsin})과 억부용신이 일치하여 용신의 힘이 강합니다.`);
    } else {
      reasoning.push(`조후 관점에서는 ${tempYongsin}이(가) 필요합니다.`);
    }
  }

  // 결여 오행 체크
  if (fiveElementAnalysis.missing.length > 0) {
    reasoning.push(`사주에 ${fiveElementAnalysis.missing.join(', ')}이(가) 없어 보충이 필요합니다.`);
  }

  // 가장 강한 오행 경고
  reasoning.push(`가장 강한 오행: ${fiveElementAnalysis.strongest} (${fiveElementAnalysis.percentages[fiveElementAnalysis.strongest]}%)`);

  // 중화 상태에서 조후 우선
  const method = strength === 'neutral' ? 'temperature' : 'suppression';
  const finalYongsin = strength === 'neutral' && tempYongsin ? tempYongsin : suppression.yongsin;

  logger.info(MOD, `analyzeYongsin 결과`, { method, yongsin: finalYongsin, huisin: suppression.huisin, gisin: suppression.gisin });

  return {
    yongsin: finalYongsin,
    huisin: suppression.huisin,
    gisin: suppression.gisin,
    gusin: suppression.gusin,
    hansin: suppression.hansin,
    method,
    reasoning,
    dayMasterStrength: strength,
  };
}
