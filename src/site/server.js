import http from "http";
import { yolka } from "../yolka/index.js";

const requestListener = function(req, res) {
  console.log(req.url);
  if (req.url === "/yolka") {
    let body = [];
    req
      .on("data", (chunk) => body.push(chunk))
      .on("end", () => {
        body = Buffer.concat(body).toString();
      });
    console.log(body);
    let result = yolka({})([], []).render();
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  } else {
    res.writeHead(200);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    // res.end("Not found");
  }
};

const server = http.createServer(requestListener);
server.listen(8080);

console.log(`server started, localhost:8080`);
