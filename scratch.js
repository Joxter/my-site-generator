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
      for: true,
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

function newRender(Components, rootNode, data, styles, slots = null) {
  shallowRender(rootNode, function render(elem) {
  });

  const path = [];
  shallowRender(rootNode, function render(elem) {
    path.push(elem.value);
  });
  console.log("---->", path.join(", "), path.join("") === "12345678");
  console.log(rootNode);
}

function fmtStack(arr) {
  return "[" + arr.map(it => it.value).join(", ") + "]";
}

function shallowRender(elem, cb) {
  const store = [elem];
  // pop + unshift =  обход вширь
  // pop + push =  какой-то вглубь задом на перед
  // shift + push =  обход вширь
  // shift + unshift =   какой-то вглубь задом на перед

  // reverse
  // pop + unshift = обход вширь задом на перед
  // pop + push =  обход вглубь
  // shift + push =  обход вширь задом на перед
  // shift + unshift =   обход вглубь

  while (store.length > 0) {
    // let str = fmtStack(store);
    const el = store.pop();
    cb(el);
    // str += ` -${el.value} ` + fmtStack(store);

    for (let i = el.children.length - 1; i >= 0; i--) {
      const ch = el.children[i];
      if ("if" in ch && ch.if === false) continue; // todo убрать это из цикла, скорее всего в колбек

      if ("for" in ch) {  // todo убрать это из цикла, скорее всего в колбек
        store.push({
          value: 6,
          children: [
            {
              value: 7,
              children: [],
            },
            {
              value: 8,
              children: [],
            },
          ],
        });
        store.push(ch);
        continue;
      }

      store.push(ch);
    }
    // str += ` +children ` + fmtStack(store);
    // console.log(str);
  }
}
