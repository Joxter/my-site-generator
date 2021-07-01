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
  return str.split(/[\[\].]+/).filter(key => !!key);
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

export function forEachNodes(root, cb) {
  const store = [root];

  while (store.length > 0) {
    const el = store.pop();
    cb(el);

    if (el.children) {
      for (let i = el.children.length - 1; i >= 0; i--) {
        store.push(el.children[i]);
      }
    }
  }
}

/**
 * str: 'Hello, {user.name}!'
 * data: {user: {name: Kolya}}
 *
 * result: 'Hello, Kolya!"
 */
export function insertDataToSting(str, data) {
  // todo fix errors when we trying to pass props witch doesn't exist
  return str.replace(/(?:\{(.+?)\})/g, (match, $1) => {
    const keys = getKeysFromStr($1);
    return deepFind(data, keys);
  });
}
