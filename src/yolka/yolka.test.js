import { yolka } from "./yolka.js";

describe("yolka basics", () => {
  const defaultYolka = yolka({});

  it("basic parse and serializer check", () => {
    const result = defaultYolka([], [`<div>text<h1>header text</h1></div>`]).render();

    expect(result.pages[0]).toEqual("<div>text<h1>header text</h1></div>");
  });

  it("test simple component without props", () => {
    const result = defaultYolka(
      [`<template name="my-button"><button>button text</button></template>`],
      [`<h1>header</h1><div><my-button></my-button></div>`]
    ).render();

    expect(result.pages[0]).toEqual("<h1>header</h1><div><button>button text</button></div>");
  });

  it("test simple page with data", () => {
    const result = defaultYolka([], [`<h1>header</h1><p>hello, {name}!</p>`]).render({ name: "Kolya" });

    expect(result.pages[0]).toEqual("<h1>header</h1><p>hello, Kolya!</p>");
  });

  it("test simple page with deep data", () => {
    const result = defaultYolka([], [`<h1>header</h1><p>hello, {users[0].name}!</p>`]).render({
      users: [{ name: "Kolya" }],
    });

    expect(result.pages[0]).toEqual("<h1>header</h1><p>hello, Kolya!</p>");
  });

  it("test simple component with props", () => {
    const result = defaultYolka(
      [`<template name="my-greeting" props="user"><p>hello, {user.name}!</p></template>`],
      [`<h1>header</h1><div><my-greeting user="{users[0]}"></my-greeting></div>`]
    ).render({ users: [{ name: "Kolya" }] });

    expect(result.pages[0]).toEqual("<h1>header</h1><div><p>hello, Kolya!</p></div>");
  });

  it("test simple component with inline data", () => {
    const result = defaultYolka(
      [`<template name="my-greeting" props="name"><p>hello, {name}!</p></template>`],
      [`<h1>header</h1><div><my-greeting name="Kolya"></my-greeting></div>`]
    ).render();

    expect(result.pages[0]).toEqual("<h1>header</h1><div><p>hello, Kolya!</p></div>");
  });

  it("test several instances of component", () => {
    const result = defaultYolka(
      [`<template name="my-greeting" props="user"><p>hello, {user.name}!</p></template>`],
      [
        `<h1>header</h1>
<div>
  <my-greeting user="{users[0]}"></my-greeting>
  <my-greeting user="{users[1]}"></my-greeting>
</div>`,
      ]
    ).render({ users: [{ name: "Kolya" }, { name: "Petya" }] });

    expect(result.pages[0]).toEqual(`<h1>header</h1>
<div>
  <p>hello, Kolya!</p>
  <p>hello, Petya!</p>
</div>`);
  });

  it("test several components", () => {
    const result = defaultYolka(
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
      ]
    ).render({ users: [{ name: "Kolya" }] });

    expect(result.pages[0]).toEqual(`<h1>header</h1>
<div>
  <p>my best site for Kolya!</p>
  <p>hello, Kolya!</p>
</div>`);
  });

  it("test several renders with different data", () => {
    const pages = defaultYolka(
      [`<template name="my-greeting" props="user"><p>hello, {user.name}!</p></template>`],
      [`<div><my-greeting user="{users[0]}"></my-greeting></div>`]
    );

    expect(pages.render({ users: [{ name: "Kolya" }] }).pages[0]).toEqual(`<div><p>hello, Kolya!</p></div>`);
    expect(pages.render({ users: [{ name: "Petya" }] }).pages[0]).toEqual(`<div><p>hello, Petya!</p></div>`);
  });

  it("test j-if attribute", () => {
    const pages = defaultYolka([], [`<div><p y-if="{show}">hello if</p><p>hello</p></div>`]);

    expect(pages.render({ show: false }).pages[0]).toEqual(`<div><p>hello</p></div>`);
    expect(pages.render({ show: true }).pages[0]).toEqual(`<div><p>hello if</p><p>hello</p></div>`);
  });

  it("test j-for attribute", () => {
    const pages = defaultYolka([], [`<div><p y-for="{item in arr}">{item.label}</p></div>`]);

    expect(pages.render({ arr: [{ label: "123" }, { label: "456" }] }).pages[0]).toEqual(
      `<div><p>123</p><p>456</p></div>`
    );
  });

  it("test simple slot", () => {
    const result = defaultYolka(
      [
        `<template name="news-item" slots="header"><header><slot name="header">default header</slot></header></template>`,
      ],
      [`<news-item><div slot="header"><h2>hello, {name}!</h2></div><div slot="header">welcome</div></news-item>`]
    ).render({ name: "Kolya" });

    expect(result.pages[0]).toEqual(`<header><div><h2>hello, Kolya!</h2></div><div>welcome</div></header>`);
  });

  it("test slot fallback", () => {
    const result = defaultYolka(
      [
        `<template name="news-item" slots="header"><header><slot name="header">default header</slot></header></template>`,
      ],
      [`<news-item></news-item>`]
    ).render();

    expect(result.pages[0]).toEqual(`<header>default header</header>`);
  });

  it("collect styles", () => {
    const result = defaultYolka(
      [
        `<template name="news-item">
<h2 class="header">header1</h2>
<p>text1 <span>span1</span></p>
<div id="some-id">text1</div>
<style>
  .header { color: green; }
  p, span { border: 1px solid red; }
</style>
</template>`,
        `<template name="user-item">
<h2 class="header">header2</h2>
<p>text2</p>
<div id="some-id">text2</div>
<style>
  h2 + p { display: block; }
  #some-id { display: block; }
</style>
</template>`,
      ],
      [`<news-item></news-item><user-item></user-item>`]
    ).render();

    expect(result.pages[0]).toEqual(`<h2 class="header -c-0">header1</h2>
<p class="-c-0">text1 <span class="-c-0">span1</span></p>
<div id="some-id" class="-c-0">text1</div>


<h2 class="header -c-1">header2</h2>
<p class="-c-1">text2</p>
<div id="some-id" class="-c-1">text2</div>`);
    expect(result.common.pages[0]).toEqual(`.header.-c-0 {
  color: green;
}

p.-c-0,
span.-c-0 {
  border: 1px solid red;
}
h2.-c-1 + p.-c-1 {
  display: block;
}

#some-id {
  display: block;
}`);
  });

  it("test body/head render page", () => {
    const result = defaultYolka(
      [`<template name="my-content"><main>page content</main><style>.main {color: red}</style></template>`],
      [
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>{title}</title>
  </head>
  <body>
    <my-content></my-content>
  </body>
</html>`,
      ]
    ).render({ title: "page title" });

    expect(result.pages[0]).toEqual(`<!DOCTYPE html><html><head>
    <title>page title</title>
  <style>.main.-c-0 {
  color: red;
}</style></head><body>
    <main class="-c-0">page content</main>
  </body></html>`);
  });

  it("test body/head render page as component", () => {
    const result = defaultYolka(
      [
        `<template name="my-index"><!DOCTYPE html><html>
<head>
  <title>{title}</title>
</head>
<body>{content}</body>
</html></template>`,
      ],
      [`<my-index title="{title}" content="{content}"></my-index>`]
    ).render({ title: "index title", content: "index content" });

    expect(result.pages[0]).toEqual(`<!DOCTYPE html><html><head>
  <title>index title</title>
</head><body>index content</body></html>`);
  });

  it("test body/head render page as component with slot", () => {
    const result = defaultYolka(
      [
        `<template name="my-index" slots="content" props="title"><!DOCTYPE html><html lang="en">
<head>
  <title>{title}</title>
</head>
<body><slot name="content"></slot></body>
</html></template>`,
      ],
      [`<my-index title="{title}"><div slot="content">slot content</div></my-index>`]
    ).render({ title: "index title", content: "index content" });

    expect(result.pages[0]).toEqual(`<!DOCTYPE html><html><head>
  <title>index title</title>
</head><body><div>slot content</div></body></html>`);
  });

  it.skip("component can be used as self-closing tag", () => {
    // it seems to be, I can't do it with without patching the htmlparser2
    const result = defaultYolka(
      [`<template name="my-button"><button>button text</button></template>`],
      [`<div><p>first</p><my-button /><p>second</p></div>`, `<div><p>first</p><my-button><p>second</p></div>`]
    ).render();

    expect(result.pages[0]).toEqual("<div><p>first</p><button>button text</button><p>second</p></div>");
    expect(result.pages[1]).toEqual("<div><p>first</p><button>button text</button><p>second</p></div>");
  });
});
