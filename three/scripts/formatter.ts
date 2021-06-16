export function css(values: TemplateStringsArray, ...vars: string[]) {
  let i = 0;
  let str = '';
  do {
    str += values[i] + vars[i++] ?? '';
  } while (i < values.length);
  return str;
}

export function js(values: TemplateStringsArray, ...vars: string[]) {
  let i = 0;
  let str = '';
  do {
    str += values[i] + vars[i++] ?? '';
  } while (i < values.length);
  return str;
}
