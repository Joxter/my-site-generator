export function deepFind(obj, props) {
  if (!obj) return null;

  let currentValue = obj;
  for (let key of props) {
    currentValue = currentValue[key];
    if (currentValue == null) return null;
  }
  return currentValue;
}

/**
 * do this: 'foo[2].bar' -> ['foo', '2', 'bar']
 */
export function getKeysFromStr(str) {
  return str.split(/[\[\].]+/).filter((key) => !!key);
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

  [...arr1, ...arr2].forEach((item) => {
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

function _niceEl(el) {
  let lines = [];
  let attrs = el.attribs ? JSON.stringify(el.attribs) : `-`;
  let data = niceData(el) || "-";

  if (el.type === "tag") {
    lines.push(`<${el.name}> attribs: ${attrs}`);
  } else if (el.type === "text") {
    lines.push(`[${el.type}] >>${data}<<`);
  } else if (el.type === "root") {
    lines.push(`[${el.type}] attribs: ${attrs} >>> data: ${data}`);
  } else {
    lines.push(`REST!!! [${el.type}] attribs: ${attrs} >>> data: ${data}`);
  }

  if (el.children && el.children.length > 0) {
    let ch = el.children.map((c) => _niceEl(c).map((str) => "  " + str));
    if (ch.length === 1) debugger;
    ch.forEach((c) => lines.push(...c));
  }
  return lines;
}

function niceData(el) {
  if (!el.data) return "";
  return el.data.replace(/\n/, "\\n").replace(/\t/, "\\t");
}

export function niceEl(el, msg = "") {
  msg && console.log(msg);
  console.log(_niceEl(el).join("\n"));
}
