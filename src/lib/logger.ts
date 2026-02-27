import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'saju-app.log');

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch {
    // 디렉토리 생성 실패 시 무시 (클라이언트 사이드 등)
  }
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

function writeLog(level: LogLevel, module: string, message: string, data?: unknown) {
  const timestamp = formatTimestamp();
  const dataStr = data !== undefined ? ` | data: ${JSON.stringify(data, null, 0)}` : '';
  const logLine = `[${timestamp}] [${level}] [${module}] ${message}${dataStr}\n`;

  // 콘솔 출력
  switch (level) {
    case 'ERROR':
      console.error(logLine.trim());
      break;
    case 'WARN':
      console.warn(logLine.trim());
      break;
    default:
      console.log(logLine.trim());
  }

  // 파일 기록 (서버 사이드에서만)
  try {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, logLine);
  } catch {
    // 파일 쓰기 실패 시 무시
  }
}

export const logger = {
  debug(module: string, message: string, data?: unknown) {
    writeLog('DEBUG', module, message, data);
  },
  info(module: string, message: string, data?: unknown) {
    writeLog('INFO', module, message, data);
  },
  warn(module: string, message: string, data?: unknown) {
    writeLog('WARN', module, message, data);
  },
  error(module: string, message: string, data?: unknown) {
    writeLog('ERROR', module, message, data);
  },
};
