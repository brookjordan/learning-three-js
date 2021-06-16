export function css(values, ...vars) {
  var _a;
  let i = 0;
  let str = '';
  do {
    str += (_a = values[i] + vars[i++]) !== null && _a !== void 0 ? _a : '';
  } while (i < values.length);
  return str;
}
export function js(values, ...vars) {
  var _a;
  let i = 0;
  let str = '';
  do {
    str += (_a = values[i] + vars[i++]) !== null && _a !== void 0 ? _a : '';
  } while (i < values.length);
  return str;
}
