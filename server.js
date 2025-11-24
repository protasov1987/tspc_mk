const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const MESSAGES_PATH = path.join(DATA_DIR, "messages.json");
const PUBLIC_DIR = path.join(__dirname, "src");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const readMessages = () => {
  try {
    const raw = fs.readFileSync(MESSAGES_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

let messages = readMessages();

const persistMessages = (data, onError) => {
  fs.writeFile(MESSAGES_PATH, JSON.stringify(data, null, 2), (err) => {
    if (err && typeof onError === "function") {
      onError(err);
    }
  });
};

const sendJson = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
};

const sendFile = (res, filePath) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime =
      ext === ".html"
        ? "text/html"
        : ext === ".css"
        ? "text/css"
        : ext === ".js"
        ? "application/javascript"
        : "application/octet-stream";

    res.writeHead(200, { "Content-Type": mime });
    res.end(content);
  });
};

const handleApi = (req, res, url) => {
  if (url.pathname !== "/api/messages") {
    sendJson(res, 404, { error: "Unknown route" });
    return true;
  }

  if (req.method === "GET") {
    sendJson(res, 200, { messages });
    return true;
  }

  if (req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      let parsed;

      try {
        parsed = JSON.parse(body || "{}");
      } catch (err) {
        sendJson(res, 400, { error: "Некорректный JSON" });
        return;
      }

      const content = typeof parsed.content === "string" ? parsed.content.trim() : "";

      if (!content) {
        sendJson(res, 400, { error: "Текст сообщения обязателен" });
        return;
      }

      const id = messages.length > 0 ? messages[messages.length - 1].id + 1 : 1;
      const created_at = new Date().toISOString();
      const record = { id, content, created_at };

      messages = [...messages, record];
      persistMessages(messages, (err) => {
        console.error("Не удалось сохранить сообщения", err);
      });

      sendJson(res, 201, record);
    });

    return true;
  }

  sendJson(res, 405, { error: "Метод не поддерживается" });
  return true;
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith("/api/")) {
    if (handleApi(req, res, url)) return;
  }

  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path.normalize(requestedPath).replace(/^\.\.(\/|\\)/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  sendFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
