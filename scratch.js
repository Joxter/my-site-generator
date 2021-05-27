const tree = {
  value: 1,
  children: [
    {
      value: 2,
      children: [],
    },
    {
      value: "NEVER",
      if: false,
      children: [
        {
          value: "NEVER-3",
          children: [],
        },
        {
          value: "NEVERRR-3",
          children: [],
        },
      ],
    },
    {
      value: 3,
      for: [6, [7, 8]],
      children: [
        {
          value: 4,
          children: [],
        },
        {
          value: 5,
          children: [],
        },
      ],
    },
  ],
};

newRender({}, tree);
throw 1;

function newRender(Components, rootNode, data, styles, slots = null) {
  const path = [];
  shallowRender(rootNode, function render(elem) {
    // console.log(elem.value);
    path.push(elem.value);
    if (elem.add) {
      return elem.add.map(val => {
        return {
          value: val,
          children: [],
        };
      });
    }
  });
  console.log("---->", path.join(", "));
}

function fmtStack(arr) {
  return "[" + arr.map(it => it.value).join(", ") + "]";
}

function shallowRender(elem, cb) {
  const store = [elem];

  while (store.length > 0) {
    let str = fmtStack(store);
    const el = store.shift();

    str += ` -${el.value} ` + fmtStack(store);

    const newNodes = cb(el);

    if (newNodes) {
      store.unshift(...newNodes);
      str += ` +new ` + fmtStack(store);
    }

    store.unshift(...el.children);
    str += ` +children ` + fmtStack(store);
    console.log(str);
  }
}
