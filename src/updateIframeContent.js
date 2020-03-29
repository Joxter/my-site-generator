import { createStore, createEvent, guard, sample } from "effector";
import { $input } from "./model";

export const $iframeBody = createStore(null);
export const $iframeContent = createStore("empty");

export const iframeLoaded = createEvent();
export const updateIframeContent = createEvent();

$iframeBody.on(iframeLoaded, (_, bodyEl) => bodyEl);

sample({
  source: [$iframeBody, $input],
  clock: guard(updateIframeContent, {
    filter: $iframeBody.map(el => !!el)
  })
}).watch(([bodyEl, content]) => {
  bodyEl.innerHTML = content;
});
