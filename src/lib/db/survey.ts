import { sql } from '@vercel/postgres';

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL,
      rating INT NOT NULL,
      feedback TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  tableReady = true;
}

export async function saveSurveyResponse(input: {
  type: 'saju' | 'compatibility';
  rating: number;
  feedback?: string;
}) {
  try {
    await ensureTable();
    await sql`
      INSERT INTO survey_responses (type, rating, feedback)
      VALUES (${input.type}, ${input.rating}, ${input.feedback ?? null})
    `;
  } catch {
    // 설문 저장 실패해도 앱 동작에 영향 없음
  }
}
