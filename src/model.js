import { createStore, createEvent, sample } from "effector";
import { initComponent, getComponent, render } from "./msg";

export const codeChanged = createEvent();
export const codeLoaded = createEvent();
export const $input = createStore("");
export const $validationOutput = createStore("-");

$input.on(codeChanged, (_, e) => e.target.value).on(codeLoaded, (_, code) => code);

$input.watch(html => {
  if (!html) {
    return;
  }

  renderPage(html);
});

export function renderPage(html) {
  const el = nodeFromHtml(html);

  el.content.querySelectorAll("template").forEach(el => {
    initComponent(el);
    el.remove();
  });

  let styles = new Set();
  render(el.content, {}, styles);
  return `${el.innerHTML} ${renderStyles(styles)}`;
}

function renderStyles(styles) {
  return `<style>
    ${[...styles].map(styleNode => styleNode.innerText).join("")}
    </style>`;
}

/*
<template data-j-component="new-cut" data-j-props="label">
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
</div>
*/

function getTemplate() {
  return `
  <template data-j-component="base-page" data-j-props="userName articleHeader time">
    <h1>user: {userName}</h1>
    <img src="./some-path.jpg" alt="{userName} photo" >
    <user-param key="height" value="123"></user-param>
    <user-param key="weight" value="67"></user-param>
    <div>
      <h2>Atricles</h2>
      <acticle>
        <h3>{articleHeader} <a href='/'>home</a></h3>
        <p>{articleHeader}</p>
        <user-param key="atricle data" value={time}></user-param>
      </acticle>
      <br />
    </div>
    <style>
      .red {
      color: red;
      }
    </style>
  </template>
  `.trim();
}

function nodeFromHtml(html) {
  const el = window.document.createElement("template");

  el.innerHTML = html;

  return el;
}
