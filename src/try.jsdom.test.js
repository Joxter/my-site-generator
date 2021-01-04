import { renderPage } from "./try.jsdom";

describe("test renderPage", () => {
  it("smoke", () => {
    expect(
      renderPage(`<template data-j-component="new-cut" data-j-props="label">
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
    ).toEqual(`

<h1>my news </h1>
<div>
  <p>my awesome news</p>
  
  <h2 class="header">first text</h2>
  <p>bla bla</p>
  
  <button class="cut">see more</button>
  

  

  <div style="border:1px solid red; padding: 10px">
    
  <h2 class="header">second text</h2>
  <p>bla bla bla</p>
  
  <button class="cut">see more</button>
  

  

  </div>
</div> <style>
    
    .header {
      color: green;
    }
  
    .cut {
      border: none;
      font: inherit;
      color: blue;
    }
  
    </style>`);
  });
});
