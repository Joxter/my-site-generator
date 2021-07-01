import { yolka } from "./yolka.js";

describe("yolka basics", () => {
  it("basic parse and serializer check", () => {
    const result = yolka([], [`<div>text<h1>header text</h1></div>`]);

    expect(result.pages[0]).toEqual("<div>text<h1>header text</h1></div>");
  });

  it("test simple component without props", () => {
    const result = yolka(
      [`<template name="my-button"><button>button text</button></template>`],
      [`<h1>header</h1><div><my-button></my-button></div>`]
    );

    expect(result.pages[0]).toEqual("<h1>header</h1><div><button>button text</button></div>");
  });

  it("test simple page with data", () => {
    const result = yolka([], [`<h1>header</h1><p>hello, {name}!</p>`], {}, { name: "Kolya" });

    expect(result.pages[0]).toEqual("<h1>header</h1><p>hello, Kolya!</p>");
  });

  it("test simple page with deep data", () => {
    const result = yolka([], [`<h1>header</h1><p>hello, {users[0].name}!</p>`], {}, { users: [{ name: "Kolya" }] });

    expect(result.pages[0]).toEqual("<h1>header</h1><p>hello, Kolya!</p>");
  });

  it("test simple component with props", () => {
    const result = yolka(
      [`<template name="my-greeting" props="user"><p>hello, {user.name}!</p></template>`],
      [`<h1>header</h1><div><my-greeting user="{users[0]}"></my-greeting></div>`],
      {},
      { users: [{ name: "Kolya" }] }
    );

    expect(result.pages[0]).toEqual("<h1>header</h1><div><p>hello, Kolya!</p></div>");
  });

  it("test several instances of component", () => {
    const result = yolka(
      [`<template name="my-greeting" props="user"><p>hello, {user.name}!</p></template>`],
      [
        `<h1>header</h1>
<div>
  <my-greeting user="{users[0]}"></my-greeting>
  <my-greeting user="{users[1]}"></my-greeting>
</div>`,
      ],
      {},
      { users: [{ name: "Kolya" }, { name: "Petya" }] }
    );

    expect(result.pages[0]).toEqual(`<h1>header</h1>
<div>
  <p>hello, Kolya!</p>
  <p>hello, Petya!</p>
</div>`);
  });

  it("test several components", () => {
    const result = yolka(
      [
        `<template name="my-header" props="user"><p>my best site for {user.name}!</p></template>`,
        `<template name="my-greeting" props="user"><p>hello, {user.name}!</p></template>`,
      ],
      [
        `<h1>header</h1>
<div>
  <my-header user="{users[0]}"></my-header>
  <my-greeting user="{users[0]}"></my-greeting>
</div>`,
      ],
      {},
      { users: [{ name: "Kolya" }] }
    );

    expect(result.pages[0]).toEqual(`<h1>header</h1>
<div>
  <p>my best site for Kolya!</p>
  <p>hello, Kolya!</p>
</div>`);
  });
});
