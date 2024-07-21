/**
 * If warn messages should be hidden while trining to diagnose an error
 */
let hideWarnMessages = true;

/**
 * Console.warns a message in a yellow color
 * @param message
 */
function warn(message: any) {
  if (hideWarnMessages) return;
  console.warn("\x1b[33m" + message + "\x1b[0m");
}

/**
 * Console.warns a message in a red color
 * @param message
 */
function error(message: any) {
  console.error("\x1b[31m" + message + "\x1b[0m");
}

export class Debugger {
  static warn = warn;
  static error = error;
}
