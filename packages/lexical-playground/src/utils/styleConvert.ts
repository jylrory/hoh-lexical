export function convertStyleNumberToString(string: string, suffix = 'px') {
  // css 属性保留字段
  const reserved = ['auto', 'inherit', 'initial', 'unset']
  // 如果 string 包含以下这些值，直接返回 string
  const noConvertSign = ['%', 'calc', 'var']
  if (
    reserved.includes(string) ||
    noConvertSign.some((sign) => string.includes(sign))
  ) {
    return string
  }

  return `${Number.parseInt(string || '0', 10)}${suffix}`
}
