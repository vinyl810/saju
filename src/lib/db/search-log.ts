import { sql } from '@vercel/postgres';

const TYPE_PREFIX = process.env.NODE_ENV === 'production' ? '' : 'test_';

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS search_logs (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL,
      year INT NOT NULL,
      month INT NOT NULL,
      day INT NOT NULL,
      hour INT NOT NULL,
      gender VARCHAR(2) NOT NULL,
      is_lunar BOOLEAN NOT NULL DEFAULT FALSE,
      birth_place VARCHAR(100),
      year2 INT,
      month2 INT,
      day2 INT,
      hour2 INT,
      gender2 VARCHAR(2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // v2: 누락 컬럼 추가 (기존 운영 테이블 호환)
  await sql`ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS minute INT`;
  await sql`ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS is_leap_month BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS use_yajasi BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS longitude DECIMAL(7,4)`;
  await sql`ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS mode VARCHAR(20)`;
  await sql`ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS degree_program VARCHAR(50)`;
  await sql`ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS semester INT`;
  await sql`ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS minute2 INT`;
  await sql`ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS is_lunar2 BOOLEAN`;
  await sql`ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS birth_place2 VARCHAR(100)`;
  tableReady = true;
}

interface SajuInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: string;
  isLunar: boolean;
  isLeapMonth: boolean;
  useYajasi: boolean;
  birthPlace?: string;
  longitude?: number;
}

interface PersonInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: string;
  isLunar: boolean;
  isLeapMonth: boolean;
  useYajasi: boolean;
  birthPlace?: string;
  longitude?: number;
}

export async function logSajuSearch(
  input: SajuInput,
  opts?: { mode?: string; degreeProgram?: string; semester?: number },
) {
  try {
    await ensureTable();
    await sql`
      INSERT INTO search_logs (
        type, year, month, day, hour, minute, gender, is_lunar,
        is_leap_month, use_yajasi, longitude, birth_place,
        mode, degree_program, semester
      )
      VALUES (
        ${TYPE_PREFIX + 'saju'}, ${input.year}, ${input.month}, ${input.day}, ${input.hour}, ${input.minute},
        ${input.gender}, ${input.isLunar},
        ${input.isLeapMonth}, ${input.useYajasi}, ${input.longitude ?? null}, ${input.birthPlace ?? null},
        ${opts?.mode ?? null}, ${opts?.degreeProgram ?? null}, ${opts?.semester ?? null}
      )
    `;
  } catch {
    // 로그 저장 실패해도 앱 동작에 영향 없음
  }
}

export async function logCompatSearch(p1: PersonInput, p2: PersonInput) {
  try {
    await ensureTable();
    await sql`
      INSERT INTO search_logs (
        type, year, month, day, hour, minute, gender, is_lunar,
        is_leap_month, use_yajasi, longitude, birth_place,
        year2, month2, day2, hour2, minute2, gender2, is_lunar2, birth_place2
      )
      VALUES (
        ${TYPE_PREFIX + 'compatibility'}, ${p1.year}, ${p1.month}, ${p1.day}, ${p1.hour}, ${p1.minute},
        ${p1.gender}, ${p1.isLunar},
        ${p1.isLeapMonth}, ${p1.useYajasi}, ${p1.longitude ?? null}, ${p1.birthPlace ?? null},
        ${p2.year}, ${p2.month}, ${p2.day}, ${p2.hour}, ${p2.minute},
        ${p2.gender}, ${p2.isLunar}, ${p2.birthPlace ?? null}
      )
    `;
  } catch {
    // 로그 저장 실패해도 앱 동작에 영향 없음
  }
}

export async function logProfCompatSearch(student: PersonInput, professor: PersonInput) {
  try {
    await ensureTable();
    await sql`
      INSERT INTO search_logs (
        type, year, month, day, hour, minute, gender, is_lunar,
        is_leap_month, use_yajasi, longitude, birth_place,
        year2, month2, day2, hour2, minute2, gender2, is_lunar2, birth_place2,
        mode
      )
      VALUES (
        ${TYPE_PREFIX + 'professor-compat'}, ${student.year}, ${student.month}, ${student.day}, ${student.hour}, ${student.minute},
        ${student.gender}, ${student.isLunar},
        ${student.isLeapMonth}, ${student.useYajasi}, ${student.longitude ?? null}, ${student.birthPlace ?? null},
        ${professor.year}, ${professor.month}, ${professor.day}, ${professor.hour}, ${professor.minute},
        ${professor.gender}, ${professor.isLunar}, ${professor.birthPlace ?? null},
        'graduate'
      )
    `;
  } catch {
    // 로그 저장 실패해도 앱 동작에 영향 없음
  }
}
