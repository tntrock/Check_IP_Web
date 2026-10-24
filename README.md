# Check IP Web

一個簡單的「我的 IP 是多少」網站，部署在 Cloudflare Workers 上。

🔗 **https://ip.info-sec.vip**

打開網頁就能看到目前連線使用的 IP，以及所在地區、網路業者等連線資訊；也可以直接用 `curl` 取得純文字 IP，或用 `/json` 拿到完整資料給程式使用。

## 特色

- **簡單易讀**：大字顯示 IP，一鍵複製
- **連線資訊**：國家／城市、時區、ASN 與網路業者、Cloudflare 節點、HTTP 與 TLS 版本
- **命令列友善**：`curl` 直接回傳 IP，不用處理 HTML
- **深色模式與手機版面**：跟隨系統設定，自動調整
- **不快取**：每次都回傳最新結果
- **輕量**：TypeScript 撰寫，無框架、執行時無外部相依

## 使用方式

| 路徑 | 回傳內容 |
| --- | --- |
| `/` | 瀏覽器開啟為網頁；`curl`、`wget` 等工具則回傳純文字 IP |
| `/ip` | 純文字 IP |
| `/json` | JSON 格式的完整連線資訊（允許跨域呼叫） |

```sh
# 取得 IP
curl https://ip.info-sec.vip

# 取得完整資訊
curl https://ip.info-sec.vip/json
```

```powershell
# Windows PowerShell
(Invoke-WebRequest https://ip.info-sec.vip/ip).Content
```

`/json` 回傳範例：

```json
{
  "ip": "203.0.113.42",
  "version": "IPv4",
  "country": "TW",
  "region": "Taipei City",
  "city": "Taipei",
  "timezone": "Asia/Taipei",
  "asn": 3462,
  "asOrganization": "Chunghwa Telecom",
  "colo": "TPE",
  "httpProtocol": "HTTP/2",
  "tlsVersion": "TLSv1.3",
  "userAgent": "curl/8.5.0"
}
```

地理位置等欄位來自 Cloudflare，若無法判斷則不會出現在結果中。

## 專案結構

```
src/
├── index.ts      # 路由、取得 IP 與連線資訊
└── page.ts       # 網頁 HTML 與樣式
wrangler.jsonc    # Cloudflare Workers 設定
```

## 本機開發

需要 Node.js 18 以上。

```sh
npm install
npm run dev         # 啟動於 http://localhost:8787
npm run typecheck   # TypeScript 型別檢查
```

## 部署

### 方法一：連結 GitHub 自動部署（推薦）

1. 到 Cloudflare Dashboard → **Workers & Pages** → **建立** → **匯入 Git 儲存庫**
2. 選擇這個 repo
3. 之後每次 push 到 `main` 就會自動部署

### 方法二：用 Wrangler 手動部署

```sh
npx wrangler login   # 第一次需要登入
npm run deploy
```

部署完成後可透過 `https://check-ip-web.<子網域>.workers.dev` 存取。Worker 名稱可在 `wrangler.jsonc` 的 `name` 修改。

### 綁定自訂網域

在 Dashboard 的 Worker 頁面 → **Settings → Domains & Routes** 新增，或在 `wrangler.jsonc` 加上：

```jsonc
"routes": [
  { "pattern": "ip.example.com", "custom_domain": true }
]
```

## 訪客紀錄

每次造訪會記錄 IP、路徑與 User-Agent，可在 Cloudflare Dashboard 的 Worker → **Observability / Logs** 查看。

## 注意事項

部署在 Cloudflare 上時，看到的是**對外的公網 IP**。
若是在 NAT 後的內網，想查詢的是電腦實際使用的**內部 IP**，請在內網自行架設，例如在內網機器上執行：

```sh
npx wrangler dev --ip 0.0.0.0 --port 80
```

舊版的 Python Flask 實作（`app.py`）也可在 git 歷史中找到。

## 授權

[MIT](LICENSE)
