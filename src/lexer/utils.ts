const code_0 = '0'.charCodeAt(0);
const code_9 = '9'.charCodeAt(0);

export function isNumber(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= code_0 && code <= code_9;
}

const code_A = 'A'.charCodeAt(0);
const code_Z = 'Z'.charCodeAt(0);
const code_a = 'a'.charCodeAt(0);
const code_z = 'z'.charCodeAt(0);

export function isLetter(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (code >= code_A && code <= code_Z) || (code >= code_a && code <= code_z);
}
