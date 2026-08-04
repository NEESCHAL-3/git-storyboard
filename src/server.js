const http = require('http');
const { exec } = require('child_process');
const { renderHTMLTemplate } = require('./web/template');

/**
 * Open URL in default browser cross-platform.
 */
function openBrowser(url) {
  const start =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
      ? 'start'
      : 'xdg-open';
  exec(`${start} ${url}`, () => {});
}

/**
 * Start GitStoryboard Web Server with auto port fallback.
 */
function startServer(data, options = {}) {
  let currentPort = options.port || 3456;
  const jsonString = JSON.stringify(data);
  const html = renderHTMLTemplate(jsonString);

  const server = http.createServer((req, res) => {
    if (req.url === '/api/data') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(jsonString);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      currentPort++;
      server.listen(currentPort);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(currentPort, () => {
    const url = `http://localhost:${currentPort}`;
    console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │   GitStoryboard Server Live at:                             │
  │   URL: ${url.padEnd(48)} │
  │                                                             │
  │   Press Ctrl+C to stop.                                     │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
    `);

    if (options.open !== false) {
      openBrowser(url);
    }
  });

  return server;
}

module.exports = { startServer, openBrowser };
