const abc = "abcdefjhigklmnopqrstuvwxyz";
const space = " \n\t";

const rules = {
  none: {
    "<": "open-tag",
  },
  "open-tag": {
    [abc]: "tag-name",
  },
  "tag-name": {
    [space]: "attrs",
    ">": "none", // todo
  },
  attrs: {
    [abc]: "attr-name",
  },
  "attr-name": {
    [abc]: "attr-name",
    [space]: "attrs",
    "=": "attr-eq",
  },

  "attr-eq": {
    [abc]: "attr-val",
  },
  "attr-val": {
    [abc]: "attr-val",
    [space]: "attrs",
  },
};

const attrs = {
  name: {
    [abc]: "name",
    [space]: "done",
    "=": "eq",
  },
  eq: {
    [abc]: "attr-val",
  },
  "attr-val": {
    [abc]: "attr-val",
    [space]: "attrs",
  },
};

export function parseAttr(str, pos) {
  let name = "";
  while (abc.includes(str[pos])) {
    name += str[pos];
    pos++;
  }

  let value = "";
  if (str[pos] === "=") {
    pos++;

    if (str[pos] === '"' || str[pos] === "'") {
      pos++;
      while (str[pos] && str[pos] !== '"' && str[pos] !== "'") {
        value += str[pos];
        pos++;
      }
      pos++;
    } else {
      while (abc.includes(str[pos])) {
        value += str[pos];
        pos++;
      }
    }
  } else {
    value = true;
  }

  return [{ type: "attr", name, value }, pos];
}

// parse("<div class='' ><p>par 1</p><p>par 2</p></div>");

// open tag 'div'

export function parse(html) {
  const tokens = tokenizer(html);

  console.log(tokens);
  return [];
}

function tokenizer(input) {
  let current = 0;
  let tokens = [];

  mainLoop: while (current < input.length) {
    let char = input[current];

    if (char === "<") {
      // tag <name>
      let value = "";
      while (true) {
        value += char;
        char = input[++current];

        if (!char) break mainLoop;
        if (char === ">") {
          value += char;
          char = input[++current];
          break;
        }
      }
      tokens.push({ type: "tag", value });
      continue;
    }

    let TEXT = /[a-z\s\d]/i;
    if (TEXT.test(char)) {
      let value = "";
      while (TEXT.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: "text", value });
      continue;
    }

    throw new TypeError("I dont know what this character is: " + char);
  }

  return tokens;
}
