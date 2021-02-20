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

export function first(inp) {
  return inp[0];
}

export function last(inp) {
  return inp[inp.length - 1];
}

export function commonInArr(arr1, arr2) {
  const common = {};

  [...arr1, ...arr2].forEach(item => {
    common[item] = common[item] + 1 || 1;
  });

  for (let key in common) {
    if (common[key] === 1) {
      delete common[key];
    }
  }

  return Object.keys(common);
}
