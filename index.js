const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Nader Store is Running ✅');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log('Running on ' + PORT);
});
