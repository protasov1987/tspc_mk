document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("helloBtn");
  const out = document.getElementById("output");

  if (!btn || !out) return;

  btn.addEventListener("click", () => {
    const now = new Date().toLocaleString();
    out.textContent += `[${now}] Привет из Codex-проекта!\n`;
  });
});
