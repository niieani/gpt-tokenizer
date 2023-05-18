export function escapeRegExp(string: string) {
  return string.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&') // $& means the whole matched string
}
