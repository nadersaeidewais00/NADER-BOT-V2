import http from "node:http";
http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is alive");
}).listen(process.env.PORT || 10000, "0.0.0.0", () => {
  console.log("Server listening");
});
