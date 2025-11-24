const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, created_at TEXT NOT NULL)",
  );
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "src")));

app.get("/api/messages", (req, res) => {
  db.all("SELECT id, content, created_at FROM messages ORDER BY id ASC", (err, rows) => {
    if (err) {
      console.error("Failed to fetch messages", err);
      return res.status(500).json({ error: "Не удалось получить сообщения" });
    }

    res.json({ messages: rows });
  });
});

app.post("/api/messages", (req, res) => {
  const content = typeof req.body.content === "string" ? req.body.content.trim() : "";

  if (!content) {
    return res.status(400).json({ error: "Текст сообщения обязателен" });
  }

  const createdAt = new Date().toISOString();
  const stmt = db.prepare("INSERT INTO messages (content, created_at) VALUES (?, ?)");

  stmt.run(content, createdAt, function runCallback(err) {
    stmt.finalize();

    if (err) {
      console.error("Failed to insert message", err);
      return res.status(500).json({ error: "Не удалось сохранить сообщение" });
    }

    res.status(201).json({ id: this.lastID, content, created_at: createdAt });
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Неизвестный маршрут" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
