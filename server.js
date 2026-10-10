import http from 'node:http';
import { readFile } from 'node:fs/promises';
const port = Number(process.env.PORT || 3000);
http.createServer(async (req, res) => {
  const paths = {'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
  const file = paths[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const data = await readFile(new URL(`./public/${file}`, import.meta.url));
    res.writeHead(200, {'Content-Type': file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'text/html'});
    res.end(data);
  } catch { res.writeHead(500); res.end('Unable to load page'); }
}).listen(port, '0.0.0.0', () => console.log(`Flight Finder listening on port ${port}`));
