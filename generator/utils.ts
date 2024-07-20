import * as fs from 'fs';
import * as path from 'path';

/**
 * Logger class for logging messages with various severity levels.
 */
export class Logger {
  private static logFilePath: string | null = null;
  private static readonly COLORS: Record<LogType, string> = {
    info: '\x1b[32m',    // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    debug: '\x1b[34m',   // Blue
    critical: '\x1b[35m',// Magenta
    trace: '\x1b[36m',   // Cyan
    fatal: '\x1b[41m'    // Red background
  };

  /**
   * Sets the directory where the log file will be stored.
   * The log file is named with a timestamp indicating when the process started.
   * @param directory - The directory path for the log file.
   */
  static setLogDirectory(directory: string): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFilePath = path.join(directory, `log-${timestamp}.log`);
  }

  /**
   * Logs a message to the file if a log directory has been set.
   * @param message - The message to log.
   * @param type - The type of log message.
   */
  private static logToFile(message: string, type: LogType): void {
    if (this.logFilePath) {
      const formattedMessage = `[${type.toUpperCase()}] ${message}\n`;
      fs.appendFileSync(this.logFilePath, formattedMessage);
    }
  }

  /**
   * Formats a message with the given ANSI color code.
   * @param message - The message to format.
   * @param colorCode - The ANSI color code to apply.
   * @returns The formatted message.
   */
  private static formatMessage(message: string, colorCode: string): string {
    return `${colorCode}${message}\x1b[0m`;
  }

  /**
   * Logs a message with a specified type.
   * @param message - The message to log.
   * @param type - The type of log message.
   */
  private static logMessage(message: string, type: LogType): void {
    const colorCode = this.COLORS[type];
    const formattedMessage = this.formatMessage(message, colorCode);
    console.log(formattedMessage);
    this.logToFile(message, type);
  }

  static info(message: string): void {
    this.logMessage(message, 'info');
  }

  static warn(message: string): void {
    this.logMessage(message, 'warning');
  }

  static error(message: string): void {
    this.logMessage(message, 'error');
  }

  static debug(message: string): void {
    this.logMessage(message, 'debug');
  }

  static critical(message: string): void {
    this.logMessage(message, 'critical');
  }

  static trace(message: string): void {
    this.logMessage(message, 'trace');
  }

  static fatal(message: string): void {
    this.logMessage(message, 'fatal');
  }
}

/**
 * Type alias for log message types.
 */
type LogType = 'info' | 'warning' | 'error' | 'debug' | 'critical' | 'trace' | 'fatal';
