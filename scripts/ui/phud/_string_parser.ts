/**
 * String Parser Helpers for PHUD
 *
 * These helpers generate Bedrock UI expression strings for parsing/manipulating
 * bound string values. Bedrock uses C printf-style format specifiers combined
 * with string arithmetic operators.
 *
 * Format specifier syntax: `%.Ns` where N is the max character count
 * - `%.Ns * string` - Get first N characters (truncate)
 * - `string - (%.Ns * string)` - Get characters after position N (skip N)
 * - String subtraction: `a - b` removes substring b from string a
 *
 * @example Common patterns
 * ```typescript
 * first(5, "#prop")           // "%.5s * #prop" - first 5 chars
 * skip(5, "#prop")            // "(#prop - (%.5s * #prop))" - skip first 5
 * slice(5, 10, "#prop")       // First take chars after 5, then take first 10
 * prefix(4, "#prop", "test")  // Check if first 4 chars equal "test"
 * ```
 */

/**
 * Get the first N characters of a string property.
 *
 * Equivalent to: `string.substring(0, n)` or `string.slice(0, n)`
 *
 * @param length - Number of characters to take from the start
 * @param prop - The property reference (e.g., "#form_button_text")
 * @returns Expression string for first N characters
 *
 * @example
 * ```typescript
 * first(80, "#level_number")  // "%.80s * #level_number"
 * first(1, "#text")           // "%.1s * #text"
 * ```
 */
export function first(length: number, prop: string): string {
  return `%.${length}s * ${prop}`;
}

/**
 * Skip the first N characters and get the rest.
 *
 * Equivalent to: `string.substring(n)` or `string.slice(n)`
 *
 * @param length - Number of characters to skip
 * @param prop - The property reference
 * @returns Expression string for characters after position N
 *
 * @example
 * ```typescript
 * skip(80, "#level_number")   // "(#level_number - (%.80s * #level_number))"
 * skip(4, "#text")            // "(#text - (%.4s * #text))"
 * ```
 */
export function skip(length: number, prop: string): string {
  return `(${prop} - (%.${length}s * ${prop}))`;
}

/**
 * Get a slice of characters: skip first `start` chars, then take `length` chars.
 *
 * Equivalent to: `string.substring(start, start + length)` or `string.slice(start, start + length)`
 *
 * @param start - Position to start from (characters to skip)
 * @param length - Number of characters to take
 * @param prop - The property reference
 * @returns Expression string for the substring
 *
 * @example
 * ```typescript
 * slice(4, 8, "#text")  // Get chars 4-12: "%.8s * (#text - (%.4s * #text))"
 * slice(10, 2, "#data") // Get chars 10-12
 * ```
 */
export function slice(start: number, length: number, prop: string): string {
  return `%.${length}s * ${skip(start, prop)}`;
}

/**
 * Check if the first N characters equal a specific value.
 *
 * @param length - Number of characters to check
 * @param prop - The property reference
 * @param value - The expected prefix value
 * @returns Expression string for prefix check (boolean result)
 *
 * @example
 * ```typescript
 * prefix(4, "#text", "cht:")     // "(('%.4s' * #text) = 'cht:')"
 * prefix(1, "#text", "t")        // "(('%.1s' * #text) = 't')"
 * ```
 */
export function prefix(length: number, prop: string, value: string): string {
  return `((%.${length}s * ${prop}) = '${value}')`;
}

/**
 * Check if the first N characters do NOT equal a specific value.
 *
 * @param length - Number of characters to check
 * @param prop - The property reference
 * @param value - The value to check against
 * @returns Expression string for negative prefix check
 *
 * @example
 * ```typescript
 * notPrefix(1, "#text", " ")  // "(not((%.1s * #text) = ' '))"
 * ```
 */
export function notPrefix(length: number, prop: string, value: string): string {
  return `(not(${prefix(length, prop, value)}))`;
}

/**
 * Strip a character/substring from the result (usually underscore separator).
 *
 * @param expr - The expression to strip from
 * @param char - The character to remove (default: "_")
 * @returns Expression with character removed
 *
 * @example
 * ```typescript
 * strip(first(80, "#level"))       // "((%.80s * #level) - '_')"
 * strip(skip(4, "#text"), ":")     // "((#text - (%.4s * #text)) - ':')"
 * ```
 */
export function strip(expr: string, char: string = "_"): string {
  return `(${expr} - '${char}')`;
}

/**
 * Concatenate strings together.
 *
 * @param parts - String parts to concatenate (literals should be quoted)
 * @returns Expression for concatenated string
 *
 * @example
 * ```typescript
 * concat("'textures/ui/'", skip(4, "#path"))
 * // "('textures/ui/' + (#path - (%.4s * #path)))"
 * ```
 */
export function concat(...parts: string[]): string {
  return `(${parts.join(" + ")})`;
}

/**
 * Wrap a value as a string literal for use in expressions.
 *
 * @param value - The string value
 * @returns Quoted string for use in expressions
 *
 * @example
 * ```typescript
 * literal("textures/ui/")  // "'textures/ui/'"
 * concat(literal("prefix_"), "#value")
 * ```
 */
export function literal(value: string): string {
  return `'${value}'`;
}

/**
 * Check if a property is not empty.
 *
 * @param prop - The property reference
 * @returns Expression that evaluates to true if not empty
 *
 * @example
 * ```typescript
 * notEmpty("#text")  // "(not (#text = ''))"
 * ```
 */
export function notEmpty(prop: string): string {
  return `(not (${prop} = ''))`;
}

/**
 * Check if a property equals a value.
 *
 * @param prop - The property reference
 * @param value - The value to compare against
 * @returns Expression for equality check
 *
 * @example
 * ```typescript
 * equals("#type", "button")  // "(#type = 'button')"
 * ```
 */
export function equals(prop: string, value: string): string {
  return `(${prop} = '${value}')`;
}

/**
 * Check if a property does not equal a value.
 *
 * @param prop - The property reference
 * @param value - The value to compare against
 * @returns Expression for inequality check
 *
 * @example
 * ```typescript
 * notEquals("#type", "hidden")  // "(not (#type = 'hidden'))"
 * ```
 */
export function notEquals(prop: string, value: string): string {
  return `(not ${equals(prop, value)})`;
}

/**
 * Check if string contains a substring (by checking if removing it changes the string).
 *
 * @param prop - The property reference
 * @param substring - The substring to search for
 * @returns Expression that evaluates to true if substring exists
 *
 * @example
 * ```typescript
 * contains("#text", "search")  // "(not ((#text - 'search') = #text))"
 * ```
 */
export function contains(prop: string, substring: string): string {
  return `(not ((${prop} - '${substring}') = ${prop}))`;
}

/**
 * Negate an expression.
 *
 * @param expr - The expression to negate
 * @returns Negated expression
 *
 * @example
 * ```typescript
 * not(contains("#text", "hidden"))  // "(not (not ((#text - 'hidden') = #text)))"
 * ```
 */
export function not(expr: string): string {
  return `(not ${expr})`;
}

/**
 * Combine expressions with AND.
 *
 * @param exprs - Expressions to AND together
 * @returns Combined expression
 *
 * @example
 * ```typescript
 * and(notEmpty("#a"), notEmpty("#b"))  // "((not (#a = '')) and (not (#b = '')))"
 * ```
 */
export function and(...exprs: string[]): string {
  return `(${exprs.join(" and ")})`;
}

/**
 * Combine expressions with OR.
 *
 * @param exprs - Expressions to OR together
 * @returns Combined expression
 *
 * @example
 * ```typescript
 * or(equals("#type", "a"), equals("#type", "b"))
 * ```
 */
export function or(...exprs: string[]): string {
  return `(${exprs.join(" or ")})`;
}

/**
 * Multiply a numeric string by a number (for numeric parsing).
 *
 * @param prop - The property containing a numeric string
 * @param multiplier - The multiplier
 * @returns Expression for multiplication
 *
 * @example
 * ```typescript
 * multiply(first(3, "#value"), 1)  // "( (%.3s * #value) * 1 )"
 * ```
 */
export function multiply(prop: string, multiplier: number): string {
  return `( ${prop} * ${multiplier} )`;
}

// ============================================================================
// Common Compound Helpers
// ============================================================================

/**
 * Get first N chars with underscore stripped (common PHUD pattern).
 *
 * @param length - Number of characters
 * @param prop - The property reference
 * @returns Expression for first N chars without underscore
 *
 * @example
 * ```typescript
 * firstStripped(80, "#level_number")  // "((%.80s * #level_number) - '_')"
 * ```
 */
export function firstStripped(length: number, prop: string): string {
  return strip(first(length, prop));
}

/**
 * Skip first N chars with underscore stripped (common PHUD pattern).
 *
 * @param length - Number of characters to skip
 * @param prop - The property reference
 * @returns Expression for remainder without underscore
 *
 * @example
 * ```typescript
 * skipStripped(80, "#level_number")  // "((#level_number - (%.80s * #level_number)) - '_')"
 * ```
 */
export function skipStripped(length: number, prop: string): string {
  return strip(skip(length, prop));
}

/**
 * Build a texture path by concatenating a base path with a parsed property.
 *
 * @param basePath - The base texture path
 * @param prop - Property containing the texture name
 * @param skipChars - Optional chars to skip from prop (default: 0)
 * @returns Expression for full texture path
 *
 * @example
 * ```typescript
 * texturePath("textures/ui/sidebar/balls/", "#ball_type")
 * // "('textures/ui/sidebar/balls/' + #ball_type)"
 *
 * texturePath("textures/sprites/", "#icon", 4)
 * // "('textures/sprites/' + (#icon - (%.4s * #icon)))"
 * ```
 */
export function texturePath(
  basePath: string,
  prop: string,
  skipChars: number = 0
): string {
  const propExpr = skipChars > 0 ? skip(skipChars, prop) : prop;
  return concat(literal(basePath), propExpr);
}
