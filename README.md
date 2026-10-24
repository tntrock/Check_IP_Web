# Check IP Web

查看「連線過來的 IP 是多少」的小網站，跑在 Cloudflare Workers 上（TypeScript，無框架、無外部相依）。

> v1 是 Python Flask 版本（`app.py`），可在 git 歷史中找到。
> 注意：部署在 Cloudflare 上時看到的是**公網 IP**。若要在 NAT 內網查詢實際的內部 IP，仍需在內網自架服務（例如 v1 的 Flask 版本，或用 `wrangler dev --ip 0.0.0.0` 在內網機器上跑這個 Worker）。

## 功能

| 路徑 | 說明 |
| --- | --- |
| `/` | 瀏覽器開啟顯示網頁；`curl` 等命令列工具會直接拿到純文字 IP |
| `/ip` | 純文字 IP |
| `/json` | JSON 格式，含 IP、版本、國家／城市、ASN、Cloudflare 節點、TLS 等資訊（允許跨域呼叫） |

```sh
curl https://<你的網域>
curl https://<你的網域>/json
```

網頁支援深色模式、手機版面與一鍵複製。每次造訪會以 `console.log` 記錄 IP 與 User-Agent，可在 Cloudflare Dashboard 的 Workers Logs 查看（取代 v1 寫入本機檔案的紀錄）。

## 開發

需要 Node.js 18+。

```sh
npm install
npm run dev        # http://localhost:8787
npm run typecheck
```

## 部署到 Cloudflare Workers

```sh
npx wrangler login   # 第一次需要登入 Cloudflare 帳號
npm run deploy
```

部署後會得到 `https://check-ip-web.<子網域>.workers.dev` 的網址。Worker 名稱可在 `wrangler.jsonc` 的 `name` 修改。

若要綁定自己的網域，在 `wrangler.jsonc` 加上：

```jsonc
"routes": [
  { "pattern": "ip.example.com", "custom_domain": true }
]
```

### 用 GitHub 自動部署（選用）

在 Cloudflare Dashboard → Workers & Pages → 建立 → 匯入 Git 儲存庫，選這個 repo，之後 push 到主分支就會自動部署。
