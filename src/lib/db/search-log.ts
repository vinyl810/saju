import { sql } from '@vercel/postgres';

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
  tableReady = true;
}

interface SajuInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: string;
  isLunar: boolean;
  birthPlace?: string;
}

interface PersonInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: string;
  isLunar: boolean;
  birthPlace?: string;
}

export async function logSajuSearch(input: SajuInput) {
  try {
    await ensureTable();
    await sql`
      INSERT INTO search_logs (type, year, month, day, hour, gender, is_lunar, birth_place)
      VALUES ('saju', ${input.year}, ${input.month}, ${input.day}, ${input.hour},
              ${input.gender}, ${input.isLunar}, ${input.birthPlace ?? null})
    `;
  } catch {
    // 로그 저장 실패해도 앱 동작에 영향 없음
  }
}

export async function logCompatSearch(p1: PersonInput, p2: PersonInput) {
  try {
    await ensureTable();
    await sql`
      INSERT INTO search_logs (type, year, month, day, hour, gender, is_lunar, birth_place,
                                year2, month2, day2, hour2, gender2)
      VALUES ('compatibility', ${p1.year}, ${p1.month}, ${p1.day}, ${p1.hour},
              ${p1.gender}, ${p1.isLunar}, ${p1.birthPlace ?? null},
              ${p2.year}, ${p2.month}, ${p2.day}, ${p2.hour}, ${p2.gender})
    `;
  } catch {
    // 로그 저장 실패해도 앱 동작에 영향 없음
  }
}
