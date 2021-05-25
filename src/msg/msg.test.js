import { msg } from "./msg";

describe("test msg", () => {
  it("basic work", () => {
    const result = msg(
      [`<template data-j-component="new-cut" data-j-props="label"><button>{label}</button></template>`],
      `<h1>header</h1><div><new-cut label="button text"></new-cut></div>`
    );

    expect(result.html).toEqual(`<h1>header</h1>
<div><button>button text</button></div>`);
  });

  it("component with several nodes", () => {
    const result = msg(
      [
        `<template data-j-component="new-cut" data-j-props="label">
<button>{label}</button>
<p>123</p>
</template>`,
      ],
      `<h1>header</h1><div><new-cut label="button text"></new-cut></div>`
    );

    expect(result.html).toEqual(`<h1>header</h1>
<div>
  <button>button text</button>
  <p>123</p>
</div>`);
  });

  it("several instances of the component", () => {
    const result = msg(
      [`<template data-j-component="new-cut" data-j-props="label"><button>{label}</button></template>`],
      `<h1>header</h1><div><new-cut label="button text"></new-cut><new-cut label="second text"></new-cut></div>`
    );

    expect(result.html).toEqual(`<h1>header</h1>
<div><button>button text</button><button>second text</button></div>`);
  });

  it("several components", () => {
    const result = msg(
      [
        `<template data-j-component="new-cut" data-j-props="label header"><h2>{header}</h2><button>{label}</button></template>`,
        `<template data-j-component="my-par" data-j-props="text"><p>{text}</p></template>`,
      ],
      `<h1>header</h1>
<div>
  <new-cut label="button text" header="some header"></new-cut>
  <my-par text="some text"></my-par>
</div>`
    );

    expect(result.html).toEqual(`<h1>header</h1>
<div>
  <h2>some header</h2>
  <button>button text</button>
  <p>some text</p>
</div>`);
  });

  it("nested components", () => {
    const result = msg(
      [
        `<template data-j-component="my-post"><div><my-par text="some text"></my-par><button>read more</button></div></template>`,
        `<template data-j-component="my-par" data-j-props="text"><p>{text}</p></template>`,
      ],
      `<h1>header</h1><my-post></my-post><my-post></my-post>`
    );

    expect(result.html).toEqual(`<h1>header</h1>
<div>
  <p>some text</p>
  <button>read more</button>
</div>
<div>
  <p>some text</p>
  <button>read more</button>
</div>`);
  });

  it("smoke s", () => {
    const result = msg(
      [
        `<template data-j-component="new-cut" data-j-props="label"><button>{label}</button></template>`,
        `<template data-j-component="news-item" data-j-props="header text">
<h2>{header}</h2><div><p>{text}</p><new-cut label="see more"></new-cut></div>
</template>`,
      ],
      `<h1>my news</h1>
<div>
  <p>my awesome news</p>
  <news-item header="first text" text="bla bla"></news-item>
  <section>
    <news-item header="second text" text="bla bla bla"></news-item>
  </section>
</div>`
    );

    expect(result.html).toEqual(`<h1>my news</h1>
<div>
  <p>my awesome news</p>
  <h2>first text</h2>
  <div>
    <p>bla bla</p>
    <button>see more</button>
  </div>
  <section>
    <h2>second text</h2>
    <div>
      <p>bla bla bla</p>
      <button>see more</button>
    </div>
  </section>
</div>`);
  });

  it("scoped styles", () => {
    const result = msg(
      [
        `<template data-j-component="news-item">
  <h2 class="header">header1</h2>
  <p>text1 <span>span1</span></p>
  <div id="some-id">text1</div>
  <style>
    .header {
      color: green;
    }
    p, span {
      border: 1px solid red;
    }
  </style>
</template>`,
        `<template data-j-component="user-item">
  <h2 class="header">header2</h2>
  <p>text2</p>
  <div id="some-id">text2</div>
  <style>
    h2 + p {
      display: block;
    }
    #some-id {
      display: block;
    }
  </style>
</template>`,
      ],
      `<news-item></news-item>
<user-item></user-item>
`
    );

    expect(result.html).toEqual(`<h2 class="header -c-0">header1</h2>
<p class="-c-0">text1 <span class="-c-0">span1</span></p>
<div id="some-id" class="-c-0">text1</div>
<h2 class="header -c-1">header2</h2>
<p class="-c-1">text2</p>
<div id="some-id" class="-c-1">text2</div>`);
    expect(result.css)
      .toEqual(`.header.-c-0 { color: green; } p.-c-0, span.-c-0 { border: 1px solid red; }h2.-c-1 + p.-c-1 { display: block; } #some-id
{ display: block; }`);
  });

  it("scoped styles inside media query", () => {
    expect(
      msg(
        [
          `<template data-j-component="news-item">
  <h2 class="header">header1</h2>
  <style>
    .header {
      color: green;
    }
    @media (min-height: 680px), screen and (orientation: portrait) {
      .header {
        color: red;
      }
    }
  </style>
</template>`,
        ],
        `<news-item></news-item>`
      ).css
    )
      .toEqual(`.header.-c-0 { color: green; } @media (min-height: 680px), screen and (orientation: portrait) { .header.-c-0 { color:
red; } }`);
  });

  it("test simple slot", () => {
    expect(
      msg(
        [
          `<template data-j-component="news-item" data-j-slots="header">
<header><slot name="header">default header</slot></header>
</template>`,
        ],
        `<news-item><div slot="header"><h2>my header</h2></div></news-item>`
      ).html
    ).toEqual(`<header>
  <div><h2>my header</h2></div>
</header>`);
  });

  it("test simple slot without data", () => {
    expect(
      msg(
        [
          `<template data-j-component="news-item" data-j-slots="header">
<header><slot name="header">default header</slot></header>
</template>`,
        ],
        `<news-item></news-item>`
      ).html
    ).toEqual(`<header>default header</header>`);
  });

  it("several slots with one name", () => {
    expect(
      msg(
        [
          `<template data-j-component="news-item" data-j-slots="header">
<header><slot name="header">default header</slot></header>
</template>`,
        ],
        `<news-item><h1 slot="header">main header</h1><h2 slot="header">second header</h2></news-item>`
      ).html
    ).toEqual(`<header>
  <h1>main header</h1>
  <h2>second header</h2>
</header>`);
  });

  it("slot with component", () => {
    expect(
      msg(
        [
          `<template data-j-component="news-item" data-j-slots="header">
<header><slot name="header">default header</slot></header>
</template>`,
          `<template data-j-component="my-user" data-j-props="name age">
<p>{name}</p>{age}
</template>`,
        ],
        `<news-item><div slot="header"><my-user name="Bob" age="22"></my-user></div></news-item>`
      ).html
    ).toEqual(`<header>
  <div>
    <p>Bob</p>
    22
  </div>
</header>`);
  });

  it("slot with component 2", () => {
    expect(
      msg(
        [
          `<template data-j-component="news-item" data-j-slots="header">
<header><slot name="header">default header</slot></header>
</template>`,
          `<template data-j-component="my-user" data-j-props="name age">
<p>{name}</p>{age}
</template>`,
        ],
        `<news-item><my-user name="Bob" age="22" slot="header"></my-user></news-item>`
      ).html
    ).toEqual(`<header>
  <p>Bob</p>
  22
</header>`);
  });

  describe("should insert data", () => {
    it("simple data", () => {
      expect(msg([], `<div>{text}</div>`, { text: "hi" }).html).toEqual(`<div>hi</div>`);
    });
    it("simple data several times", () => {
      expect(msg([], `<div>{text} {text}</div>`, { text: "hi" }).html).toEqual(`<div>hi hi</div>`);
    });
    it("data in components", () => {
      expect(
        msg(
          [`<template data-j-component="my-par" data-j-props="content"><p>{content}</p></template>`],
          `<my-par content="{text}"></my-par>`,
          { text: "hi" }
        ).html
      ).toEqual(`<p>hi</p>`);
    });
    it("deep data in component 1", () => {
      expect(msg([], `<p>{user.Nick.name}</p>`, { user: { Nick: { name: "Nick" } } }).html).toEqual(`<p>Nick</p>`);
    });
    it("deep data in component 2 with array", () => {
      expect(msg([], `<p>{users[1].name}</p>`, { users: [{}, { name: "Nick" }] }).html).toEqual(`<p>Nick</p>`);
    });
    it("deep data in components", () => {
      expect(
        msg(
          [
            `<template data-j-component="my-par" data-j-props="text"><p>{text}</p></template>`,
            `<template data-j-component="my-article" data-j-props="content">
  <my-par text="{content[0].text}"></my-par>
  <my-par text="{content[1].text}"></my-par>
</template>`,
          ],
          `<my-article content="{data.content}"></my-article>`,
          { data: { content: [{ text: "first text" }, { text: "second text" }] } }
        ).html
      ).toEqual(`<p>first text</p>
<p>second text</p>`);
    });
    it("should works in slots", () => {
      expect(
        msg(
          [
            `<template data-j-component="news-item" data-j-slots="header">
<header><slot name="header">default header</slot></header>
</template>`,
          ],
          `<news-item><div slot="header"><h2>My name is {name}</h2></div></news-item>`,
          { name: "Kolya" }
        ).html
      ).toEqual(`<header>
  <div><h2>My name is Kolya</h2></div>
</header>`);
    });

    it("should works with several slots", () => {
      expect(
        msg(
          [
            `<template data-j-component="my-layout" data-j-slots="header">
<header><slot name="header"></slot></header>
</template>`,
          ],
          `<my-layout>
<section slot="header"><h1>first header {skill}</h1></section>
<section slot="header"><h1>second header {skill}</h1></section>
</my-layout>`,
          {
            skill: "Skill",
          }
        ).html
      ).toEqual(`<header>
  <section><h1>first header Skill</h1></section>
  <section><h1>second header Skill</h1></section>
</header>`);
    });
  });

  it('option "cssInline" should paste css at the end of head', () => {
    expect(
      msg(
        [
          `<template data-j-component="my-par" data-j-props="content">
<p>{content}</p>
<style>.foo {color: red}</style>
</template>`,
        ],
        `<!DOCTYPE html>
<html lang="en">
  <head>
  <title>Some title</title>
  </head>
  <body>
    <my-par content="some text"></my-par>  
  </body>`,
        {},
        { cssInline: true }
      ).html
    ).toEqual(`<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Some title</title>
    <style>
      .foo.-c-0 {
        color: red;
      }
    </style>
  </head>
  <body>
    <p class="-c-0">some text</p>
  </body>
</html>`);
  });

  describe("test several pages", () => {
    it("basic work", () => {
      const components = [
        `<template data-j-component="comp-one"><p>one</p><style>.one {color: red}</style></template>`,
        `<template data-j-component="comp-two"><p>two</p><style>.two {color: red}</style></template>`,
        `<template data-j-component="comp-three"><p>three</p><style>.three {color: red}</style></template>`,
      ];
      const page1 = `<div><comp-one></comp-one></div>`;
      const page2 = `<div><comp-one></comp-one><comp-two></comp-two></div>`;

      const result = msg(components, [page1, page2]);

      expect(result.pages[0].html).toEqual('<div><p class="-c-0">one</p></div>');
      expect(result.pages[1].html).toEqual(`<div>
  <p class="-c-0">one</p>
  <p class="-c-1">two</p>
</div>`);
      expect(result.common.css).toEqual(`.one.-c-0 {
  color: red;
}`);
      expect(result.pages[0].css).toEqual(``);
      expect(result.pages[1].css).toEqual(`.two.-c-1 {
  color: red;
}`);
    });
  });

  describe("test j-for", () => {
    it("should works", () => {
      expect(msg([], `<p j-for="{item in arr}">{item}</p>`, { arr: [123, 456] }).html).toEqual(`<p>123</p>
<p>456</p>`);
      expect(msg([], `<p j-for="{item in arr}">{item.label}</p>`, { arr: [{ label: "123" }, { label: "456" }] }).html)
        .toEqual(`<p>123</p>
<p>456</p>`);
    });

    it("should render nothing if arr is empty", () => {
      expect(msg([], `<p j-for="{item in arr}">{item}</p><p>boo</p>`, { arr: [] }).html).toEqual(`<p>boo</p>`);
    });
  });

  describe("test j-if", () => {
    it("should works", () => {
      expect(msg([], `<p>one</p><p j-if="{cond}">none</p>`, { cond: false }).html).toEqual(`<p>one</p>`);
      expect(msg([], `<p>one</p><p j-if="">none</p>`, { cond: false }).html).toEqual(`<p>one</p>`);
      expect(msg([], `<p>one</p><p j-if="false">none</p>`, { cond: false }).html).toEqual(`<p>one</p>`);
      expect(msg([], `<p>one</p><p j-if="0">none</p>`, { cond: false }).html).toEqual(`<p>one</p>`);
      expect(msg([], `<p>one</p><p j-if="{cond}">two</p>`, { cond: true }).html).toEqual(`<p>one</p>
<p>two</p>`);
    });

    it("should works 'else' branch", () => {
      expect(msg([], `<p j-if="{cond}">then</p><p j-else>else</p>`, { cond: true }).html).toEqual(`<p>then</p>`);
      expect(msg([], `<p j-if="{cond}">then</p><p j-else>else</p>`, { cond: false }).html).toEqual(`<p>else</p>`);
    });

    it("should works with components", () => {
      const components = [
        `<template data-j-component="my-par" data-j-props="content">
<p>{content}</p>
<style>.foo {color: red}</style>
</template>`,
      ];
      const page = `<p>one</p><my-par j-if="{cond}" content="two"></my-par>`;

      const result = msg(components, page, { cond: false });

      expect(result.html).toEqual(`<p>one</p>`);
      expect(result.css).toEqual(``);

      const result2 = msg(components, page, { cond: true });

      expect(result2.html).toEqual(`<p>one</p>
<p class="-c-0">two</p>`);
      expect(result2.css).toEqual(`.foo.-c-0 { color: red; }`);
    });

    it("should works in components", () => {
      const components = [
        `<template data-j-component="my-par" data-j-props="inner-cond">
<p>one</p><p j-if="{inner-cond}">optional</p>
</template>`,
      ];
      const page = `<my-par inner-cond="{cond}"></my-par>`;

      const result = msg(components, page, { cond: false });

      expect(result.html).toEqual(`<p>one</p>`);

      const result2 = msg(components, page, { cond: true });

      expect(result2.html).toEqual(`<p>one</p>
<p>optional</p>`);
    });
  });
});
