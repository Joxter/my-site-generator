import { createEffect } from "effector";

export const validateFx = createEffect({
  handler: text => {
    // debugger;
    console.log(text);

    return fetch("https://validator.w3.org/nu/?out=json", {
      method: "POST",
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      },
      body: text
    }).then(response => {
      return response.json().catch(() => {
        throw response;
      });
    });
  }
});

console.dir(validateFx);

validateFx.finally.watch(data => {
  console.log(data);
});
