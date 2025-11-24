const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "src");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain" });
      res.end(err.code === "ENOENT" ? "Not Found" : "Server Error");
      return;
    }

    res.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const requestedPath = req.url.split("?")[0];
  const relativePath = requestedPath === "/" ? "/index.html" : requestedPath;
  const safePath = path.normalize(relativePath).replace(/^\.\.(\/|\\)/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  sendFile(res, filePath);
});

server.listen(PORT, HOST, () => {
  const hostLabel = HOST === "0.0.0.0" ? "0.0.0.0 (all interfaces)" : HOST;
  console.log(`Server is running on http://${hostLabel}:${PORT}`);
  if (HOST === "0.0.0.0") {
    console.log("Open http://localhost:3000 locally or use the host's public IP/domain for remote access.");
  }
});
