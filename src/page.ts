import type { IpInfo } from "./index";

function esc(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function countryName(code?: string): string | undefined {
  if (!code) return undefined;
  try {
    const name = new Intl.DisplayNames(["zh-TW"], { type: "region" }).of(code);
    return name && name !== code ? `${name}（${code}）` : code;
  } catch {
    return code;
  }
}

function row(label: string, value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  return `<div class="row"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
}

export function renderPage(info: IpInfo): string {
  const location = [info.city, info.region].filter(Boolean).join("，");
  const network = info.asn
    ? `AS${info.asn}${info.asOrganization ? ` · ${info.asOrganization}` : ""}`
    : info.asOrganization;

  const details = [
    row("國家／地區", countryName(info.country)),
    row("城市", location),
    row("時區", info.timezone),
    row("網路業者", network),
    row("Cloudflare 節點", info.colo),
    row("連線協定", [info.httpProtocol, info.tlsVersion].filter(Boolean).join(" · ")),
    row("User-Agent", info.userAgent),
  ].join("");

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>我的 IP 位址</title>
<style>
  :root {
    --bg: #f4f5f7;
    --card: #ffffff;
    --text: #1d2129;
    --muted: #6b7280;
    --line: #e5e7eb;
    --accent: #2563eb;
    --accent-soft: #e8efff;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f1115;
      --card: #181b21;
      --text: #e8eaed;
      --muted: #9aa0a6;
      --line: #2a2e36;
      --accent: #7aa2ff;
      --accent-soft: #1e2a44;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    background: var(--bg);
    color: var(--text);
    font-family: system-ui, -apple-system, "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
    line-height: 1.5;
  }
  main { width: 100%; max-width: 560px; }
  .card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 32px 28px;
  }
  .label { margin: 0; font-size: 14px; color: var(--muted); }
  .ip-line { display: flex; align-items: center; gap: 12px; margin: 8px 0 4px; flex-wrap: wrap; }
  .ip {
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: clamp(26px, 7vw, 42px);
    font-weight: 600;
    letter-spacing: 0.01em;
    word-break: break-all;
    margin: 0;
  }
  .badge {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    background: var(--accent-soft);
    padding: 2px 8px;
    border-radius: 999px;
  }
  button {
    margin-top: 16px;
    font: inherit;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: var(--card);
    cursor: pointer;
  }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  dl { margin: 28px 0 0; padding-top: 20px; border-top: 1px solid var(--line); }
  .row { display: grid; grid-template-columns: 120px 1fr; gap: 12px; padding: 6px 0; font-size: 14px; }
  dt { color: var(--muted); }
  dd { margin: 0; word-break: break-word; }
  footer { margin-top: 16px; font-size: 13px; color: var(--muted); text-align: center; }
  code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; }
  @media (max-width: 420px) {
    .card { padding: 24px 18px; }
    .row { grid-template-columns: 1fr; gap: 0; padding: 8px 0; }
  }
</style>
</head>
<body>
<main>
  <section class="card">
    <p class="label">您的 IP 位址</p>
    <div class="ip-line">
      <p class="ip" id="ip">${esc(info.ip)}</p>
      <span class="badge">${esc(info.version)}</span>
    </div>
    <button type="button" id="copy">複製 IP</button>
    <dl>${details}</dl>
  </section>
  <footer>命令列：<code>curl <span id="host"></span></code> · <a href="/json" style="color:inherit">JSON</a></footer>
</main>
<script>
  document.getElementById("host").textContent = location.host;
  const btn = document.getElementById("copy");
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById("ip").textContent);
      btn.textContent = "已複製";
    } catch {
      btn.textContent = "複製失敗";
    }
    setTimeout(() => (btn.textContent = "複製 IP"), 1500);
  });
</script>
</body>
</html>`;
}
