import * as fs from "fs";
import * as path from "path";

export class Logger {
  private static readonly COLORS: Record<LogType, string> = {
    info: "\x1b[32m", // Green
    warning: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
    debug: "\x1b[34m", // Blue
    critical: "\x1b[35m", // Magenta
    trace: "\x1b[36m", // Cyan
    fatal: "\x1b[41m", // Red background
  };

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
  }

  static info(message: string): void {
    this.logMessage(message, "info");
  }

  static warn(message: string): void {
    this.logMessage(message, "warning");
  }

  static error(message: string): void {
    this.logMessage(message, "error");
  }

  static debug(message: string): void {
    this.logMessage(message, "debug");
  }

  static critical(message: string): void {
    this.logMessage(message, "critical");
  }

  static trace(message: string): void {
    this.logMessage(message, "trace");
  }

  static fatal(message: string): void {
    this.logMessage(message, "fatal");
  }
}

/**
 * Type alias for log message types.
 */
type LogType =
  | "info"
  | "warning"
  | "error"
  | "debug"
  | "critical"
  | "trace"
  | "fatal";

/**
 * Removes comments from a JSON string, returning a clean result.
 * @param jsonData
 * @returns
 */
export function removeCommentsFromJSON(jsonData: string): string {
  let result = "";
  let inString = false;
  let inSingleLineComment = false;
  let inBlockComment = false;
  let i = 0;

  while (i < jsonData.length) {
    const char = jsonData[i];
    const nextChar = jsonData[i + 1];

    if (inString) {
      // Check if we encounter an unescaped closing quote
      if (char === '"' && jsonData[i - 1] !== '\\') {
        inString = false;
      }
      result += char;
    } else if (inSingleLineComment) {
      // Single-line comments end with a newline character
      if (char === '\n') {
        inSingleLineComment = false;
        result += char;  // Preserve the newline character
      }
    } else if (inBlockComment) {
      // Block comments end with */
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++;  // Skip the closing '/'
      }
    } else {
      if (char === '"') {
        inString = true;
        result += char;
      } else if (char === '/' && nextChar === '/') {
        inSingleLineComment = true;
        i++;  // Skip the next '/'
      } else if (char === '/' && nextChar === '*') {
        inBlockComment = true;
        i++;  // Skip the next '*'
      } else {
        result += char;
      }
    }
    i++;
  }

  return result;
}

/**
 * Removes comments & spaces from a `.lang` file, returning a clean result in CRLF format.
 * Supports comments starting with two or more `#` and in-line comments.
 * @param langData 
 */
export function removeCommentsFromLang(langData: string): string {
  // Split the data into lines
  const lines = langData.split(/\r?\n/);
  
  const cleanedLines = lines
    .map(line => {
      // Remove any in-line comments that have two or more # (e.g., ##, ###, etc.)
      const noInlineComments = line.split(/#{2,}/)[0].trim();
      
      // Return the line only if it's not empty and not a full-line comment (starting with ## or more #)
      return noInlineComments.length > 0 && !noInlineComments.match(/^#{2,}/)
        ? noInlineComments
        : null;
    })
    .filter(Boolean); // Remove null values

  // Join the cleaned lines with CRLF (\r\n) to maintain Windows-style line breaks
  return cleanedLines.join("\r\n");
}

/**
 * Function to count the total files and folders recursively.
 */
export function countFilesRecursively(directory: string): number {
  let count = 0;
  const items = fs.readdirSync(directory);
  for (const item of items) {
    const fullPath = path.join(directory, item);
    if (fs.lstatSync(fullPath).isDirectory()) {
      count += countFilesRecursively(fullPath);
    } else {
      count += 1;
    }
  }
  return count;
}