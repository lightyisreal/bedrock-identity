/**
 * Parses a string input containing space-separated arguments, accounting for quoted and escaped characters.
 *
 * @param {string} input - The input string containing space-separated arguments.
 * @returns {string[]} An array of parsed arguments.
 */
export function parseArguments(input: string): string[] {
  const output: string[] = [];
  let quoted = false;
  let escaped = false;
  let construct = "";
  for (let i = 0, length = input.length; i < length; i++) {
    const character = input[i];
    if (character === " " && !quoted) {
      output.push(construct);
      construct = "";
      continue;
    }
    if (character === '"' && !escaped) {
      quoted = !quoted;
      continue;
    }
    if (character === "\\" && !escaped) {
      escaped = true;
      continue;
    } else {
      escaped = false;
    }
    construct = `${construct}${character}`;
  }
  output.push(construct);
  return output;
}
