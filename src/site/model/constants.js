export const EMPTY_PAGE = `<!DOCTYPE html>
<html>
<head>
  <title>page title</title>
</head>
<body>
  <!-- your code -->
</body>
</html>`;

let i = 0;
export const GET_EMPTY_COMPONENT = () => {
  let name = `my-comp-${i}`;

  return {
    code: `<template name="${name}" props="" slots="">
<style>
</style>
</template>`,
    name,
  };
};
