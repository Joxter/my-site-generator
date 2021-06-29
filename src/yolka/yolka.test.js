import { yolka } from "./yolka.js";

describe("yolka basics", () => {
  it("basic parse and serializer check", () => {
    const result = yolka([], [`<div>text<h1>header text</h1></div>`]);

    expect(result.pages[0]).toEqual('<div>text<h1>header text</h1></div>');
  });
});
