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
  await sql`ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS metadata JSONB`;
  tableReady = true;
}

export async function saveSurveyResponse(input: {
  type: 'saju' | 'compatibility' | 'professor-compat';
  rating: number;
  feedback?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await ensureTable();
    const metaJson = input.metadata ? JSON.stringify(input.metadata) : null;
    await sql`
      INSERT INTO survey_responses (type, rating, feedback, metadata)
      VALUES (${input.type}, ${input.rating}, ${input.feedback ?? null}, ${metaJson}::jsonb)
    `;
  } catch {
    // 설문 저장 실패해도 앱 동작에 영향 없음
  }
}
