import { parse, parseAttr } from "./my-parser.js";

describe("test", () => {
  it("parseAttr work", () => {
    expect(parseAttr("name LOL", 0)).toEqual([{ name: "name", type: "attr", value: true }, 4]);
    expect(parseAttr("name=value LOL", 0)).toEqual([{ name: "name", type: "attr", value: 'value' }, 10]);
    expect(parseAttr('name="va lue" LOL', 0)).toEqual([{ name: "name", type: "attr", value: 'va lue' }, 13]);
    expect(parseAttr("name='va lue' LOL", 0)).toEqual([{ name: "name", type: "attr", value: 'va lue' }, 13]);
    expect(parseAttr('name="" LOL', 0)).toEqual([{ name: "name", type: "attr", value: '' }, 7]);
    expect(parseAttr('name="" LOL', 0)).toEqual([{ name: "name", type: "attr", value: '' }, 7]);
  });
});
