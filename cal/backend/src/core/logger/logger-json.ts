import { LoggerService } from '@nestjs/common';

const PII_KEYS = new Set(['email', 'passwordHash', 'password', 'token', 'evaluadorId']);

function stripPii(val: unknown): unknown {
  if (val === null || typeof val !== 'object') return val;
  if (Array.isArray(val)) return val.map(stripPii);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    out[k] = PII_KEYS.has(k) ? '[REDACTED]' : stripPii(v);
  }
  return out;
}

function sanitizar(message: unknown): unknown {
  if (typeof message === 'string') {
    try {
      return stripPii(JSON.parse(message));
    } catch {
      return message;
    }
  }
  return stripPii(message);
}

export class LoggerJson implements LoggerService {
  private escribir(level: string, message: unknown, context?: string): void {
    const linea = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      context: context ?? 'App',
      message: sanitizar(message),
    });
    process.stdout.write(linea + '\n');
  }

  log(message: unknown, context?: string): void {
    this.escribir('info', message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.escribir('error', message, context);
    if (trace) {
      process.stderr.write(
        JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', trace }) + '\n',
      );
    }
  }

  warn(message: unknown, context?: string): void {
    this.escribir('warn', message, context);
  }

  debug(message: unknown, context?: string): void {
    this.escribir('debug', message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.escribir('verbose', message, context);
  }
}
