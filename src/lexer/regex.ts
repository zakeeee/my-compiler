export function alternation(...args: RegExp[]): RegExp {
  return new RegExp(args.map((re) => `(${re.source})`).join('|'))
}

export function concatenation(...args: RegExp[]): RegExp {
  return new RegExp(args.map((re) => `(${re.source})`).join(''))
}

export function kleeneClosure(re: RegExp): RegExp {
  return new RegExp(`(${re.source})*`)
}

export function positiveClosure(re: RegExp): RegExp {
  return new RegExp(`(${re.source})+`)
}

export function optional(re: RegExp): RegExp {
  return new RegExp(`(${re.source})?`)
}
