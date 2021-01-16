import { msgNode } from "./msg";

describe("test msgNode", () => {
  it("basic work", () => {
    const result = msgNode(
      [
        `<template data-j-component="new-cut" data-j-props="label"><button>{label}</button></template>`,
      ],
      `<h1>header</h1><div><new-cut label="button text"></new-cut></div>`
    );

    expect(result.html).toEqual(`<h1>header</h1>
<div><button>button text</button></div>`);
  });

  it("component with several nodes", () => {
    const result = msgNode(
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
    const result = msgNode(
      [
        `<template data-j-component="new-cut" data-j-props="label"><button>{label}</button></template>`,
      ],
      `<h1>header</h1><div><new-cut label="button text"></new-cut><new-cut label="second text"></new-cut></div>`
    );

    expect(result.html).toEqual(`<h1>header</h1>
<div><button>button text</button><button>second text</button></div>`);
  });

  it("several components", () => {
    const result = msgNode(
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
    const result = msgNode(
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
    const result = msgNode(
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

  it("uniq styles", () => {
    const result = msgNode(
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
<div id="some-id">text1</div>
<h2 class="header">header2</h2>
<p class="-c-1">text2</p>
<div id="some-id">text2</div>`);
    expect(result.css).toEqual(`.-c-0.header {
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

  it("uniq styles inside media query", () => {
    expect(
      msgNode(
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
    ).toEqual(`.-c-0.header {
  color: green;
}
@media (min-height: 680px), screen and (orientation: portrait) {
  .-c-0.header {
    color: red;
  }
}`);
  });

  it("test simple slot", () => {
    expect(
      msgNode(
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
      msgNode(
        [
          `<template data-j-component="news-item" data-j-slots="header">
<header><slot name="header">default header</slot></header>
</template>`,
        ],
        `<news-item></news-item>`
      ).html
    ).toEqual(`<header>default header</header>`);
  });

  it("slot with component", () => {
    expect(
      msgNode(
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
      msgNode(
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
});
