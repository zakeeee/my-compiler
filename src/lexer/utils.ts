export function regExpAlternation(...args: RegExp[]): RegExp {
  return new RegExp(args.map((re) => `(${re.source})`).join('|'));
}

export function regExpConcatenation(...args: RegExp[]): RegExp {
  return new RegExp(args.map((re) => `(${re.source})`).join(''));
}

export function kleeneClosure(re: RegExp): RegExp {
  return new RegExp(`(${re.source})*`);
}
