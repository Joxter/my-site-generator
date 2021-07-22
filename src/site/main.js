fetch("http://localhost:8080/yolka", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ foo: "bar" }), // body data type must match "Content-Type" header
})
  .then(console.log)
  .catch(console.error);
