export function deepFind(obj, props) {
  if (!obj) {
    return null;
  }

  return props.reduce((result, prop) => {
    return result == null ? null : result[prop];
  }, obj);
}

/**
 * do this: 'foo[2].bar' -> ['foo', '2', 'bar']
 */
export function getKeysFromStr(str) {
  return str.split(/[\[\].]+/);
}

export function removeFirstLastChar(str) {
  return str.slice(1, str.length - 1);
}
