import { modifyRule } from "./scoped-styles";

describe("modifyRule", () => {
  it("should works is the most simple cases", function() {
    expect(modifyRule(".foo", "mix")).toEqual(".foo.mix");
    expect(modifyRule(".f", "mix")).toEqual(".f.mix");
    expect(modifyRule("div", "mix")).toEqual("div.mix");
    expect(modifyRule("p", "mix")).toEqual("p.mix");
    expect(modifyRule("#foo", "mix")).toEqual("#foo");
  });

  it("should works in nested and doubled cases", function() {
    expect(modifyRule(".foo .bar", "mix")).toEqual(".foo.mix .bar.mix");
    expect(modifyRule("div .foo", "mix")).toEqual("div.mix .foo.mix");
    expect(modifyRule("div.foo", "mix")).toEqual("div.foo.mix");
    expect(modifyRule("p.foo", "mix")).toEqual("p.foo.mix");
    expect(modifyRule(".foo.bar", "mix")).toEqual(".foo.bar.mix");
  });

  it("should works with some joiners", function() {
    expect(modifyRule(".foo+.bar", "mix")).toEqual(".foo.mix+.bar.mix");
    expect(modifyRule("div>.foo", "mix")).toEqual("div.mix>.foo.mix");
    expect(modifyRule("div~.foo", "mix")).toEqual("div.mix~.foo.mix");
    expect(modifyRule("p~.foo", "mix")).toEqual("p.mix~.foo.mix");
    expect(modifyRule(".foo~p", "mix")).toEqual(".foo.mix~p.mix");
    expect(modifyRule(".foo + .bar", "mix")).toEqual(".foo.mix + .bar.mix");
    expect(modifyRule("div > .foo", "mix")).toEqual("div.mix > .foo.mix");
    expect(modifyRule("div ~ .foo", "mix")).toEqual("div.mix ~ .foo.mix");
  });

  it("should works with pseudo selectors", function() {
    expect(modifyRule(".foo:first-child", "mix")).toEqual(".foo.mix:first-child");
    expect(modifyRule(".foo::first-child", "mix")).toEqual(".foo.mix::first-child");
    expect(modifyRule(".foo:nth-child(3)", "mix")).toEqual(".foo.mix:nth-child(3)");
    expect(modifyRule(".foo::nth-child(3)", "mix")).toEqual(".foo.mix::nth-child(3)");
    expect(modifyRule("p:first-child", "mix")).toEqual("p.mix:first-child");
    expect(modifyRule(".foo:first-child .bar", "mix")).toEqual(".foo.mix:first-child .bar.mix");
  });

  it("should works with attibute selectors", function() {
    expect(modifyRule("[target] .foo", "mix")).toEqual("[target].mix .foo.mix");
    expect(modifyRule("a[target] .foo", "mix")).toEqual("a[target].mix .foo.mix");
    expect(modifyRule("div[target=foo] .foo", "mix")).toEqual("div[target=foo].mix .foo.mix");
  });

  it("should works with *", function() {
    // really don't know how it should be
    expect(modifyRule("* .foo", "mix")).toEqual("* .foo.mix");
  });

  it("selector ':root' should be ignored", function() {
    expect(modifyRule(":root", "mix")).toEqual(":root");
    expect(modifyRule(":root .foo", "mix")).toEqual(":root .foo.mix");
  });
});
