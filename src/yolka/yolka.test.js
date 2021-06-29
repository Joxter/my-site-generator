import { yolka } from "./yolka.js";

describe("yolka basics", () => {
  it("basic parse and serializer check", () => {
    const result = yolka([], [`<div>text<h1>header text</h1></div>`]);

    expect(result.pages[0]).toEqual("<div>text<h1>header text</h1></div>");
  });

  it("test simple component without data", () => {
    const result = yolka(
      [`<template name="my-button"><button>button text</button></template>`],
      [`<h1>header</h1><div><my-button></my-button></div>`]
    );

    expect(result.pages[0]).toEqual("<h1>header</h1><div><button>button text</button></div>");
  });
});
