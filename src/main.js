const ENDPOINT = "/api/messages";

const appendMessage = (container, text) => {
  container.textContent += `${text}\n`;
};

const setBusy = (button, busy) => {
  if (!button) return;
  button.disabled = busy;
  button.textContent = busy ? "Сохраняю..." : "Нажми меня";
};

const loadMessages = async (output) => {
  if (!output) return;

  try {
    const res = await fetch(ENDPOINT);
    if (!res.ok) throw new Error("Сервер вернул ошибку");

    const data = await res.json();
    output.textContent = "";
    data.messages.forEach((msg) => appendMessage(output, msg.content));
  } catch (err) {
    appendMessage(output, `Не удалось загрузить сообщения: ${err.message}`);
  }
};

const saveMessage = async (output) => {
  const content = `[${new Date().toLocaleString()}] Привет из Codex-проекта!`;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Ошибка сети" }));
    throw new Error(error.error || "Не удалось сохранить сообщение");
  }

  const data = await res.json();
  return data.content;
};

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("helloBtn");
  const out = document.getElementById("output");

  loadMessages(out);

  if (!btn || !out) return;

  btn.addEventListener("click", async () => {
    setBusy(btn, true);
    try {
      const savedMessage = await saveMessage(out);
      appendMessage(out, savedMessage);
    } catch (err) {
      appendMessage(out, `Ошибка: ${err.message}`);
    } finally {
      setBusy(btn, false);
    }
  });
});
