// Minimal process for Docker demos — replace with your real `dist/server.js` in a real app.
import http from "node:http";
http
  .createServer((_req, res) => {
    res.setHeader("content-type", "text/plain");
    res.end("ok\n");
  })
  .listen(3000, () => {
    console.log("listening on 3000");
  });
