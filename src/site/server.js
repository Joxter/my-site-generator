import http from "http";
import { yolka } from "../yolka/index.js";

const requestListener = function(req, res) {
  console.log(req.url, req.method);
  if (req.url === "/yolka" && req.method === "POST") {
    let body = [];
    req
      .on("data", (chunk) => body.push(chunk))
      .on("end", () => {
        try {
          body = Buffer.concat(body).toString();
          console.log(body);

          let { components, pages, data } = JSON.parse(body);

          data = eval(`[${data}]`)[0];
          let result = yolka({})(components, pages).render(data);
          res.statusCode = 200;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "*");
          res.setHeader("Access-Control-Allow-Headers", "*");
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: result }));
        } catch (err) {
          res.statusCode = 200;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "*");
          res.setHeader("Access-Control-Allow-Headers", "*");
          res.setHeader("Content-Type", "application/json");

          console.log("ERROR", err.toString());
          res.end(err.toString());

          console.error(err);
        }
      });
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.writeHead(200);
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(8080);

console.log(`server started, localhost:8080`);
