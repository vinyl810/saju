# 사주팔자 분석기 (Saju-App) — Specification

## 1. 프로젝트 개요

한국 전통 사주팔자(四柱八字, Four Pillars of Destiny) 종합 분석 웹 애플리케이션.
생년월일시를 입력하면 사주팔자 계산, 오행 분석, 용신 판단, 대운/세운/월운/일운, 궁합 분석까지 제공한다.

---

## 2. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| **프레임워크** | Next.js (App Router, Turbopack) | 16.1.6 |
| **언어** | TypeScript | ^5 |
| **스타일링** | Tailwind CSS | ^4 |
| **UI 컴포넌트** | shadcn/ui (Radix 기반) | — |
| **차트** | Recharts | ^3.7.0 |
| **애니메이션** | Framer Motion | ^12.34.2 |
| **검증** | Zod | ^4.3.6 |
| **음양력 변환** | korean-lunar-calendar | ^0.3.6 |
| **날짜 유틸** | date-fns | ^4.1.0 |
| **아이콘** | Lucide React | ^0.574.0 |
| **런타임** | React | 19.2.3 |

---

## 3. 디렉토리 구조

```
saju-app/
├── src/
│   ├── app/                           # Next.js App Router 페이지
│   │   ├── layout.tsx                 # 루트 레이아웃 (Header/Footer, lang="ko")
│   │   ├── page.tsx                   # 홈페이지 (생년월일시 입력 폼)
│   │   ├── globals.css                # 전역 스타일
│   │   ├── result/page.tsx            # 사주 분석 결과 페이지
│   │   ├── compatibility/page.tsx     # 궁합 분석 페이지
│   │   └── api/
│   │       ├── saju/route.ts          # POST: 사주 분석 API
│   │       ├── compatibility/route.ts # POST: 궁합 분석 API
│   │       └── fortune/route.ts       # POST: 운세 조회 API
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui 기본 컴포넌트 (8개)
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   └── tabs.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx             # 상단 네비게이션
│   │   │   └── footer.tsx             # 하단 푸터
│   │   ├── saju/                      # 사주 관련 UI (7개)
│   │   │   ├── birth-form.tsx         # 생년월일시 입력 폼
│   │   │   ├── pillar-card.tsx        # 사주 기둥 단일 카드
│   │   │   ├── four-pillars-display.tsx # 4기둥 레이아웃
│   │   │   ├── element-chart.tsx      # 오행 레이더 차트 (Recharts)
│   │   │   ├── ten-gods-table.tsx     # 십신 배치표
│   │   │   ├── yongsin-card.tsx       # 용신 분석 카드
│   │   │   └── personality-section.tsx # 성격/적성 섹션
│   │   ├── fortune/                   # 운세 관련 UI (4개)
│   │   │   ├── major-fortune-timeline.tsx # 대운 타임라인
│   │   │   ├── yearly-fortune-card.tsx    # 세운 카드
│   │   │   ├── monthly-fortune-card.tsx   # 월운 카드
│   │   │   └── daily-fortune-card.tsx     # 일운 카드
│   │   └── compatibility/             # 궁합 관련 UI (3개)
│   │       ├── compatibility-form.tsx     # 두 사람 입력 폼
│   │       ├── compatibility-result.tsx   # 궁합 결과 (점수/등급)
│   │       └── element-comparison.tsx     # 오행 비교 차트
│   │
│   ├── hooks/                         # React 커스텀 훅 (3개)
│   │   ├── use-saju-calculation.ts    # 사주 분석 API 호출
│   │   ├── use-compatibility.ts       # 궁합 분석 API 호출
│   │   └── use-fortune.ts            # 운세 조회 API 호출
│   │
│   └── lib/
│       ├── utils.ts                   # cn() 유틸리티 (tailwind-merge)
│       ├── logger.ts                  # 파일/콘솔 로거
│       ├── data/
│       │   ├── solar-terms-lookup.ts  # 절기 계산 (Shouzheng 공식, 1920~2100)
│       │   └── personality-map.ts     # 일주별 성격/적성 데이터
│       └── saju/                      # *** 핵심 계산 엔진 (15개) ***
│           ├── types.ts               # 전체 타입 정의
│           ├── constants.ts           # 천간/지지/오행/합충 상수
│           ├── calendar.ts            # 음양력 변환, daysSinceEpoch
│           ├── solar-terms.ts         # 절기 월 판정
│           ├── four-pillars.ts        # 사주팔자 4기둥 계산
│           ├── hidden-stems.ts        # 지장간 조회
│           ├── ten-gods.ts            # 십신 판정/배정
│           ├── five-elements.ts       # 오행 분포/일간 강약
│           ├── yongsin.ts             # 용신 판단 (억부/조후)
│           ├── major-fortune.ts       # 대운 계산
│           ├── yearly-fortune.ts      # 세운/월운/일운
│           ├── relationships.ts       # 합/충/형/파/해
│           ├── compatibility.ts       # 궁합 5개 카테고리 분석
│           ├── interpretation.ts      # 운세 해석 텍스트 생성
│           └── index.ts              # 통합 진입점 (performSajuAnalysis)
│
├── logs/
│   └── saju-app.log                  # 런타임 로그 파일
├── __tests__/lib/                    # 단위 테스트 (예정)
├── build-scripts/                    # 빌드 스크립트 (예정)
├── package.json
├── tsconfig.json
├── next.config.ts
├── components.json                   # shadcn/ui 설정
└── postcss.config.mjs
```

**총 파일 수: 약 50개** (node_modules, .next 제외)

---

## 4. 핵심 타입 정의 (`types.ts`)

### 4.1 기본 타입

| 타입 | 값 |
|------|-----|
| `Cheongan` | `'갑' \| '을' \| '병' \| '정' \| '무' \| '기' \| '경' \| '신' \| '임' \| '계'` |
| `Jiji` | `'자' \| '축' \| '인' \| '묘' \| '진' \| '사' \| '오' \| '미' \| '신' \| '유' \| '술' \| '해'` |
| `FiveElement` | `'목' \| '화' \| '토' \| '금' \| '수'` |
| `YinYang` | `'양' \| '음'` |
| `Gender` | `'남' \| '여'` |
| `TenGod` | `'비견' \| '겁재' \| '식신' \| '상관' \| '편재' \| '정재' \| '편관' \| '정관' \| '편인' \| '정인'` |

### 4.2 핵심 인터페이스

```
BirthInput
├── year, month, day, hour, minute: number
├── gender: Gender
├── isLunar: boolean
├── isLeapMonth: boolean
└── useYajasi: boolean

Pillar
├── ganJi: { cheongan, jiji }
├── cheonganElement / jijiElement: FiveElement
├── cheonganYinYang / jijiYinYang: YinYang
├── cheonganTenGod / jijiTenGod?: TenGod
└── hiddenStems: { main, middle?, residual? }

FourPillars = { year, month, day, hour: Pillar }

SajuAnalysis (API 최종 응답)
├── fourPillars: FourPillars
├── fiveElements: FiveElementAnalysis
├── yongsin: YongsinAnalysis
├── majorFortunes: MajorFortune[]
├── currentYearFortune: YearlyFortune
├── currentMonthFortune: MonthlyFortune
├── todayFortune: DailyFortune
├── personality: PersonalityProfile
├── relationships: Relationship[]
├── birthInput: BirthInput
└── solarBirthDate: { year, month, day }
```

---

## 5. 계산 알고리즘 상세

### 5.1 년주 (Year Pillar) — `four-pillars.ts:calculateYearPillar`

- **입춘 기준 연도 판정**: 생일 < 입춘일 → 전년도 적용
- 60간지 인덱스: `(effectiveYear - 4) % 60`
- 천간 = `인덱스 % 10`, 지지 = `인덱스 % 12`
- 입춘일은 Shouzheng 공식으로 계산

### 5.2 월주 (Month Pillar) — `four-pillars.ts:calculateMonthPillar`

- **절기 기반 월 판정**: `getSajuMonth()` → 12절기(소한~대설)로 월 경계 결정
- 월지 인덱스: `(sajuMonth + 1) % 12`
- 월간 계산: `MONTH_STEM_START[년간 % 5] + (월지인덱스 - 2 + 12) % 12) % 10`

| 년간 | 인월 시작 천간 |
|------|--------------|
| 갑, 기 | 병인 |
| 을, 경 | 무인 |
| 병, 신 | 경인 |
| 정, 임 | 임인 |
| 무, 계 | 갑인 |

### 5.3 일주 (Day Pillar) — `four-pillars.ts:calculateDayPillar`

- 기준일: **1900-01-01 = 갑자일**
- `daysSinceEpoch()`: 기준일로부터의 일수 계산
- 60간지 인덱스: `일수 % 60`

### 5.4 시주 (Hour Pillar) — `four-pillars.ts:calculateHourPillar`

- 시간 → 12시진 매핑: `floor(((hour + 1) % 24) / 2)`
- 시간 천간: `HOUR_STEM_START[일간 % 5] + 지지인덱스) % 10`
- **야자시 처리**: 23:00 이후 + `useYajasi=true` → 다음날 기준으로 일주 계산

| 일간 | 자시 시작 천간 |
|------|--------------|
| 갑, 기 | 갑자 |
| 을, 경 | 병자 |
| 병, 신 | 무자 |
| 정, 임 | 경자 |
| 무, 계 | 임자 |

### 5.5 절기 계산 — `solar-terms-lookup.ts`

**Shouzheng (寿星) 공식** 사용:

```
day = floor(Y * D + C) - L + offset
  Y = year % 100
  D = 0.2422
  C = century-specific constant (20세기/21세기 별도)
  L = floor(Y / 4)
```

- 범위: 1920~2100년
- 정확도: ±1일 이내
- 12절(소한, 입춘, 경칩, 청명, 입하, 망종, 소서, 입추, 백로, 한로, 입동, 대설) 계산

### 5.6 십신 판정 — `ten-gods.ts`

일간 기준으로 다른 글자의 오행 관계 + 음양 일치 여부로 10종 분류:

| 관계 | 같은 음양 | 다른 음양 |
|------|----------|----------|
| 같은 오행 (비화) | 비견 | 겁재 |
| 내가 생 (식상) | 식신 | 상관 |
| 내가 극 (재성) | 편재 | 정재 |
| 나를 극 (관성) | 편관 | 정관 |
| 나를 생 (인성) | 편인 | 정인 |

### 5.7 오행 분석 — `five-elements.ts`

**오행 분포 계산** (가중치):
- 천간 4개: 각 1점
- 지지 지장간: 정기 0.6, 중기 0.3, 여기 0.1

**일간 강약 판정** (신강/신약/중화):
- 득령 (월지 정기가 도움 오행): +30점
- 득지 (일지 정기가 도움 오행): +20점
- 득세 (나머지 천간 3개 + 년지/시지 정기): 각 +8점
- **도움 오행**: 같은 오행(비겁) + 나를 생하는 오행(인성)
- 판정: ≥55점 = 신강, ≤35점 = 신약, 그 사이 = 중화

### 5.8 용신 판단 — `yongsin.ts`

**억부용신** (suppression):
- 신강: 용신 = 식상(내가 생하는 오행), 희신 = 재성, 기신 = 인성
- 신약: 용신 = 인성(나를 생하는 오행), 희신 = 비겁, 기신 = 재성

**조후용신** (temperature):
- 월지 기준 계절별 필요 오행 테이블
- 봄/겨울: 화 필요, 여름: 수 필요, 가을: 화/목 필요

**최종 결정**:
- 중화 상태 → 조후 우선
- 신강/신약 → 억부 우선
- 억부와 조후 일치 시 확신도 높음

### 5.9 대운 계산 — `major-fortune.ts`

**순행/역행 판단**:
- 남양(남+양간), 여음(여+음간) = 순행
- 남음(남+음간), 여양(여+양간) = 역행

**시작 나이 계산**:
- 순행: 생일 → 다음 절기까지 일수 ÷ 3
- 역행: 생일 → 이전 절기까지 일수 ÷ 3
- (3일 = 1년, 최소 1세)

**대운 진행**:
- 월주 간지에서 순행/역행 방향으로 10개 (약 100년)
- 10년 단위 (startAge ~ startAge+9)

### 5.10 세운/월운/일운 — `yearly-fortune.ts`

- **세운**: `(연도 - 4) % 60` → 60간지
- **월운**: 년간 기반 월간 + 월지 계산 (간략 버전, 양력 월 사용)
- **일운**: `daysSinceEpoch(날짜) % 60` → 60간지

### 5.11 합/충/형/파/해 — `relationships.ts`

| 관계 | 테이블 | 개수 |
|------|--------|------|
| 천간합 | 갑기합토, 을경합금, 병신합수, 정임합목, 무계합화 | 5쌍 |
| 천간충 | 갑경, 을신, 병임, 정계 | 4쌍 |
| 지지 육합 | 자축합토, 인해합목, 묘술합화, 진유합금, 사신합수, 오미합 | 6쌍 |
| 지지 삼합 | 신자진(수), 해묘미(목), 인오술(화), 사유축(금) | 4조 |
| 지지 방합 | 인묘진(목), 사오미(화), 신유술(금), 해자축(수) | 4조 |
| 지지 육충 | 자오, 축미, 인신, 묘유, 진술, 사해 | 6쌍 |
| 지지 형 | 삼형살(인사신, 축술미), 무례지형(자묘), 자형(진진,오오,유유,해해) | 10쌍 |
| 지지 파 | 자유, 축진, 인해, 묘오, 사신, 미술 | 6쌍 |
| 지지 해 | 자미, 축오, 인사, 묘진, 신해, 유술 | 6쌍 |

### 5.12 궁합 분석 — `compatibility.ts`

5개 카테고리 가중평균:

| 카테고리 | 비중 | 분석 내용 |
|---------|------|----------|
| 일간 관계 | 30% | 천간합(95점)/충(25점)/같은오행(70점)/상생(75점) |
| 천간 조화 | 15% | 전체 천간 합/충 개수 (각 ±15점) |
| 지지 조화 | 20% | 육합(+12점)/육충(-15점) 개수 |
| 오행 보완 | 20% | 부족 오행 상호 보충도 + 분포 유사도 |
| 용신 호환 | 15% | 상대 강한 오행이 내 용신이면 +25, 기신이면 -15 |

등급: S(≥85), A(≥70), B(≥55), C(≥40), D(<40)

---

## 6. 상수 데이터 (`constants.ts`)

| 상수 | 설명 |
|------|------|
| `CHEONGAN[10]` | 천간 배열 (갑~계) |
| `JIJI[12]` | 지지 배열 (자~해) |
| `CHEONGAN_HANJA`, `JIJI_HANJA` | 한자 매핑 |
| `CHEONGAN_ELEMENT`, `JIJI_ELEMENT` | 오행 매핑 |
| `CHEONGAN_YINYANG`, `JIJI_YINYANG` | 음양 매핑 |
| `HIDDEN_STEMS[12]` | 지장간 테이블 (정기/중기/여기) |
| `GENERATES`, `OVERCOMES` | 상생/상극 관계 |
| `GENERATED_BY`, `OVERCOME_BY` | 역방향 관계 |
| `CHEONGAN_COMBINES[5]` | 천간합 5쌍 |
| `CHEONGAN_CLASHES[4]` | 천간충 4쌍 |
| `YUKAP[6]`, `SAMHAP[4]`, `BANGHAP[4]` | 육합/삼합/방합 |
| `YUKCHUNG[6]`, `HYUNG[10]`, `PA[6]`, `HAE[6]` | 육충/형/파/해 |
| `MONTH_STEM_START`, `HOUR_STEM_START` | 월간/시간 시작 테이블 |
| `ELEMENT_COLORS`, `ELEMENT_BG_COLORS` | UI용 오행 색상 |
| `JIJI_ANIMAL[12]` | 12지지 띠 동물 |
| `TEN_GOD_HANJA[10]` | 십신 한자 |

---

## 7. API 명세

### 7.1 `POST /api/saju`

사주팔자 종합 분석.

**Request Body** (Zod 검증):
```json
{
  "year": 1990,        // 1920~2100
  "month": 5,          // 1~12
  "day": 15,           // 1~31
  "hour": 14,          // 0~23
  "minute": 30,        // 0~59
  "gender": "남",      // "남" | "여"
  "isLunar": false,    // 음력 여부
  "isLeapMonth": false, // 윤달 여부
  "useYajasi": false   // 야자시 적용
}
```

**Response**: `SajuAnalysis` (사주팔자 + 오행 + 용신 + 대운 + 운세 + 성격 + 관계)

### 7.2 `POST /api/compatibility`

궁합 분석.

**Request Body**:
```json
{
  "person1": { /* BirthInput */ },
  "person2": { /* BirthInput */ }
}
```

**Response**:
```json
{
  "result": {
    "totalScore": 66,
    "grade": "B",
    "categories": [...],
    "summary": "...",
    "strengths": [...],
    "weaknesses": [...],
    "advice": "..."
  },
  "person1Analysis": { /* SajuAnalysis */ },
  "person2Analysis": { /* SajuAnalysis */ }
}
```

### 7.3 `POST /api/fortune`

특정 날짜 운세 조회.

**Request Body**: `BirthInput` + `targetYear`, `targetMonth`, `targetDay`

**Response**:
```json
{
  "yearlyFortune": { /* YearlyFortune */ },
  "monthlyFortune": { /* MonthlyFortune */ },
  "dailyFortune": { /* DailyFortune */ }
}
```

---

## 8. UI 페이지 구성

### 8.1 홈 (`/`)

- 생년월일시 입력 폼 (`BirthForm`)
  - 년/월/일/시 드롭다운 (12시진 라벨 포함)
  - 양력/음력 선택, 윤달 체크, 성별 선택
  - 야자시 적용 토글
  - "분석하기" 버튼 → `/result?year=...&month=...` 으로 이동
- 기능 소개 카드 3개 (사주팔자, 오행&용신, 대운&운세)

### 8.2 결과 (`/result`)

- URL 쿼리 파라미터에서 입력값 추출 → `/api/saju` 호출
- **사주팔자 4기둥 카드**: 천간/지지(한글+한자), 오행 색상 코딩, 십신 라벨
- **합/충 관계 배지**: 발견된 합충형파해를 Badge로 표시
- **5개 탭**:
  - 오행: 레이더 차트 (Recharts RadarChart) + 분포 요약
  - 용신: 용신/희신/기신 배지 + 판단 근거 텍스트
  - 십신: 8글자 그리드 표
  - 성격: 일주 기반 성격, 강점/약점 리스트, 적성 직업
  - 운세: 대운 타임라인 + 세운/월운/일운 카드

### 8.3 궁합 (`/compatibility`)

- 두 사람 입력 폼 (나란히 배치)
- 종합 점수 + 등급 (S/A/B/C/D)
- 카테고리별 상세 분석 (5개)
- 오행 비교 차트 (`ElementComparison`)
- 각 사람의 사주팔자 4기둥 표시

---

## 9. React 커스텀 훅

| 훅 | API 호출 | 반환 |
|----|---------|------|
| `useSajuCalculation` | `POST /api/saju` | `{ result, loading, error, calculate }` |
| `useCompatibility` | `POST /api/compatibility` | `{ result, loading, error, calculate }` |
| `useFortune` | `POST /api/fortune` | `{ result, loading, error, calculate }` |

모두 `useState` 기반, `fetch` API 사용, 에러 핸들링 포함.

---

## 10. UI 컴포넌트 목록

### 10.1 사주 관련 (`components/saju/`)

| 컴포넌트 | Props | 설명 |
|---------|-------|------|
| `BirthForm` | — | 생년월일시 입력 폼, router.push로 결과 페이지 이동 |
| `PillarCard` | `pillar: Pillar, label: string` | 단일 기둥 카드 (천간/지지/오행/십신) |
| `FourPillarsDisplay` | `fourPillars: FourPillars` | 4기둥 가로 배치 |
| `ElementChart` | `analysis: FiveElementAnalysis` | 오행 레이더 차트 + 분포 수치 |
| `TenGodsTable` | `fourPillars: FourPillars` | 8글자 십신 배치 그리드 |
| `YongsinCard` | `yongsin: YongsinAnalysis` | 용신/희신/기신 배지 + 근거 |
| `PersonalitySection` | `personality: PersonalityProfile` | 성격/강점/약점/적성 |

### 10.2 운세 관련 (`components/fortune/`)

| 컴포넌트 | Props | 설명 |
|---------|-------|------|
| `MajorFortuneTimeline` | `fortunes: MajorFortune[], birthYear` | 대운 10개 수평 타임라인 |
| `YearlyFortuneCard` | `fortune: YearlyFortune` | 세운 카드 |
| `MonthlyFortuneCard` | `fortune: MonthlyFortune` | 월운 카드 |
| `DailyFortuneCard` | `fortune: DailyFortune` | 일운 카드 |

### 10.3 궁합 관련 (`components/compatibility/`)

| 컴포넌트 | Props | 설명 |
|---------|-------|------|
| `CompatibilityForm` | `onSubmit, loading` | 두 사람 입력 폼 |
| `CompatibilityResultDisplay` | `result: CompatibilityResult` | 점수/등급/카테고리별 상세 |
| `ElementComparison` | `analysis1, analysis2` | 오행 비교 듀얼 차트 |

---

## 11. 로깅 시스템

### 11.1 로거 (`lib/logger.ts`)

- **출력**: 콘솔 + 파일 (`logs/saju-app.log`) 동시 기록
- **포맷**: `[ISO타임스탬프] [LEVEL] [module] message | data: {...}`
- **레벨**: `DEBUG`, `INFO`, `WARN`, `ERROR`

### 11.2 로깅 적용 범위 (전 모듈)

| 모듈명 | 파일 | 주요 로그 포인트 |
|--------|------|----------------|
| `calendar` | calendar.ts | 음양력 변환, daysSinceEpoch |
| `solar-terms` | solar-terms.ts | 절기 월 판정, 입춘 날짜 |
| `four-pillars` | four-pillars.ts | 년/월/일/시주 계산 전 과정 |
| `hidden-stems` | hidden-stems.ts | 지장간 조회 |
| `ten-gods` | ten-gods.ts | 십신 판정/배정 |
| `five-elements` | five-elements.ts | 오행 분포, 득령/득지/득세 점수 |
| `yongsin` | yongsin.ts | 억부/조후 판단 과정 |
| `major-fortune` | major-fortune.ts | 순행/역행, 시작 나이, 대운 10개 |
| `yearly-fortune` | yearly-fortune.ts | 세운/월운/일운 계산 |
| `relationships` | relationships.ts | 합/충/형/파/해 발견 |
| `compatibility` | compatibility.ts | 5개 카테고리 점수 |
| `interpretation` | interpretation.ts | 운세 해석 생성, 점수 계산 |
| `saju-index` | index.ts | 전체 분석 흐름 시작/완료 |
| `personality-map` | personality-map.ts | 성격 프로파일 생성 |
| `api-saju` | api/saju/route.ts | 요청/응답/에러 |
| `api-compatibility` | api/compatibility/route.ts | 요청/응답/에러 |
| `api-fortune` | api/fortune/route.ts | 요청/응답/에러 |

---

## 12. 데이터 흐름

```
[브라우저] BirthForm
    ↓ router.push(/result?...)
[브라우저] ResultPage → useSearchParams → useSajuCalculation.calculate()
    ↓ POST /api/saju (JSON)
[서버] route.ts
    ↓ Zod 검증
    ↓ performSajuAnalysis(input)
        ├── normalizeBirthDate()     ← 음력→양력 변환
        ├── calculateFourPillars()   ← 4기둥 계산
        │   ├── getIpchunDate()      ← 절기 (Shouzheng)
        │   ├── getSajuMonth()       ← 월 판정
        │   ├── daysSinceEpoch()     ← 일주
        │   ├── hourToJiji()         ← 시주
        │   └── assignTenGods()      ← 십신 배정
        ├── analyzeFiveElements()    ← 오행 분포 + 강약
        ├── analyzeYongsin()         ← 용신 판단
        ├── analyzeRelationships()   ← 합충형파해
        ├── calculateMajorFortunes() ← 대운
        ├── calculateYearlyFortune() ← 세운
        ├── calculateMonthlyFortune()← 월운
        ├── calculateDailyFortune()  ← 일운
        ├── interpret*Fortune()      ← 해석 텍스트
        └── getPersonalityProfile()  ← 성격
    ↓ JSON 응답
[브라우저] 탭별 컴포넌트 렌더링
```

---

## 13. 설계 결정 사항

| 결정 | 근거 |
|------|------|
| 서버사이드 계산 (API Routes) | 번들 크기 최소화, 추후 DB/AI 해석 확장 용이 |
| Shouzheng 공식 절기 계산 | astronomy-engine 대비 가벼움, 빌드 타임 불필요, ±1일 정확도 |
| `korean-lunar-calendar` | KARI 표준 준거, 1000~2050년 범위, 윤달 지원 |
| 야자시 토글 | 23시 이후 출생자를 위한 전통/현대 방식 선택 옵션 |
| 용신 이중 판단 (억부+조후) | 중화 상태에서 조후 우선, 일치 시 확신도 표시 |
| 오행 지장간 가중치 (0.6/0.3/0.1) | 정기 중심 분석, 중기/여기 보조 반영 |
| 궁합 5카테고리 가중평균 | 일간(30%) 중심, 다차원 분석으로 균형 |
| 파일 로깅 | 디버깅/검증용, 서버사이드에서만 파일 기록 |

---

## 14. 검증 결과

### API 테스트 (curl)

**테스트 입력**: 1990년 5월 15일 14시, 남성, 양력

| 항목 | 결과 |
|------|------|
| 년주 | 경오(庚午) — 금/화 |
| 월주 | 신사(辛巳) — 금/화 |
| 일주 | 경오(庚午) — 금/화 |
| 시주 | 계미(癸未) — 수/토 |
| 오행 분포 | 금 3.3 > 화 2.1 > 토 1.3 > 수 1.0 > 목 0.1 |
| 일간 강약 | 신약 (24점) |
| 용신 | 토 (억부법) |
| 합충 | 오미합토 x2, 사오미방합화, 오오자형 |

**궁합 테스트**: 남(1990-05-15) + 여(1992-08-20) → 66점 B등급

**운세 테스트**: 2026-02-19 → 세운 병오(55점), 월운 경인(50점), 일운 갑인(50점)

---

## 15. 향후 과제

- [ ] 단위 테스트 작성 (`__tests__/lib/`)
- [ ] 만세력 사이트와 교차 검증 (sajuplus.com 등)
- [ ] 엣지 케이스 보강 (입춘 경계일, 윤달, 1월 1일 등)
- [ ] 성능 최적화 (lazy loading, code splitting)
- [ ] SEO 메타데이터 보강
- [ ] Vercel 배포
- [ ] 반응형 디자인 미세 조정
- [ ] AI 기반 해석 텍스트 고도화
