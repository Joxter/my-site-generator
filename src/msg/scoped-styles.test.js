import { __unic } from "./scoped-styles";

describe("__unic", () => {
  it("should works is the most simple cases", function() {
    expect(__unic(".foo", "mix")).toEqual(".foo.mix");
    expect(__unic(".f", "mix")).toEqual(".f.mix");
    expect(__unic("div", "mix")).toEqual("div.mix");
    expect(__unic("p", "mix")).toEqual("p.mix");
    expect(__unic("#foo", "mix")).toEqual("#foo");
  });

  it("should works in nested and doubled cases", function() {
    expect(__unic(".foo .bar", "mix")).toEqual(".foo.mix .bar.mix");
    expect(__unic("div .foo", "mix")).toEqual("div.mix .foo.mix");
    expect(__unic("div.foo", "mix")).toEqual("div.foo.mix");
    expect(__unic("p.foo", "mix")).toEqual("p.foo.mix");
    expect(__unic(".foo.bar", "mix")).toEqual(".foo.bar.mix");
  });

  it("should works with some joiners", function() {
    expect(__unic(".foo+.bar", "mix")).toEqual(".foo.mix+.bar.mix");
    expect(__unic("div>.foo", "mix")).toEqual("div.mix>.foo.mix");
    expect(__unic("div~.foo", "mix")).toEqual("div.mix~.foo.mix");
    expect(__unic("p~.foo", "mix")).toEqual("p.mix~.foo.mix");
    expect(__unic(".foo~p", "mix")).toEqual(".foo.mix~p.mix");
    expect(__unic(".foo + .bar", "mix")).toEqual(".foo.mix + .bar.mix");
    expect(__unic("div > .foo", "mix")).toEqual("div.mix > .foo.mix");
    expect(__unic("div ~ .foo", "mix")).toEqual("div.mix ~ .foo.mix");
  });

  it("should works with pseudo selectors", function() {
    expect(__unic(".foo:first-child", "mix")).toEqual(".foo.mix:first-child");
    expect(__unic(".foo::first-child", "mix")).toEqual(".foo.mix::first-child");
    expect(__unic("p:first-child", "mix")).toEqual("p.mix:first-child");

    expect(__unic(".foo:first-child .bar", "mix")).toEqual(".foo.mix:first-child .bar.mix");
  });
});
