import { msgNode } from "./msg";

describe("test renderPage", () => {
  it("smoke", () => {
    expect(
      msgNode(`<template data-j-component="new-cut" data-j-props="label">
  <button class="cut">{label}</button>
  <style>
    .cut {
      border: none;
      font: inherit;
      color: blue;
    }
  </style>
</template>
<template data-j-component="news-item" data-j-props="header text">
  <h2 class="header">{header}</h2>
  <p>{text}</p>
  <new-cut label="see more"></new-cut>
  <style>
    .header {
      color: green;
    }
  </style>
</template>
<h1>my news </h1>
<div>
  <p>my awesome news</p>
  <news-item header="first text" text="bla bla"></news-item>
  <div style="border:1px solid red; padding: 10px">
    <news-item header="second text" text="bla bla bla"></news-item>
  </div>
</div>`)
    ).toEqual([
      `<h1>my news</h1>
<div>
  <p>my awesome news</p>
  <h2 class="header -c-1">first text</h2>
  <p>bla bla</p>
  <button class="cut -c-0">see more</button>
  <div style="border:1px solid red; padding: 10px">
    <h2 class="header -c-1">second text</h2>
    <p>bla bla bla</p>
    <button class="cut -c-0">see more</button>
  </div>
</div>`,
      `.-c-1.header {
  color: green;
}
.-c-0.cut {
  border: none;
  font: inherit;
  color: blue;
}`,
    ]);
  });

  it("uniq styles", () => {
    expect(
      msgNode(`<template data-j-component="news-item">
  <h2 class="header">header1</h2>
  <p>text1</p>
  <div id="some-id">text1</div>
  <style>
    .header {
      color: green;
    }
    p {
      border: 1px solid red;
    }
  </style>
</template><template data-j-component="user-item">
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
</template>
<news-item></news-item>
<user-item></user-item>
`)
    ).toEqual([
      `<h2 class="header -c-0">header1</h2>
<p class="-c-0">text1</p>
<div id="some-id">text1</div>
<h2 class="header">header2</h2>
<p class="-c-1">text2</p>
<div id="some-id">text2</div>`,
      `.-c-0.header {
  color: green;
}
p.-c-0 {
  border: 1px solid red;
}
h2.-c-1 + p.-c-1 {
  display: block;
}
#some-id {
  display: block;
}`,
    ]);
  });
});
