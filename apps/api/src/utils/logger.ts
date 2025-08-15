const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

type LogLevel = keyof typeof logLevels;

class Logger {
  private level: LogLevel = 'info';

  constructor(level?: LogLevel) {
    if (level && level in logLevels) {
      this.level = level;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return logLevels[level] <= logLevels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (args.length > 0) {
      return `${prefix} ${message} ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`;
    }
    
    return `${prefix} ${message}`;
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, ...args));
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, ...args));
    }
  }
}

// Create logger instance
export const logger = new Logger(process.env.LOG_LEVEL as LogLevel || 'info');
