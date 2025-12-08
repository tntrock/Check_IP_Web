from flask import Flask, request, render_template_string
import logging
import sys

app = Flask(__name__)

# 設定日誌的格式
log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

# --- 設定日誌輸出到檔案 ---
file_handler = logging.FileHandler("C:\CheckIP\web_access.log", mode='a', encoding='utf-8')
file_handler.setFormatter(log_formatter)
app.logger.addHandler(file_handler) # 將 handler 加到 app.logger

# --- 設定日誌輸出到Console ---
stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(log_formatter)
app.logger.addHandler(stream_handler)

# 設定要記錄的最低等級為 INFO
app.logger.setLevel(logging.INFO)

# --- 移除 Flask 預設的 handler，避免重複輸出到Console ---
app.logger.removeHandler(app.logger.handlers[0])


@app.route('/')
def get_ip():
    if request.headers.getlist("X-Forwarded-For"):
       ip_address = request.headers.getlist("X-Forwarded-For")[0]
    else:
       ip_address = request.remote_addr
       
    user_agent = request.user_agent.string
    
    # --- 使用 app.logger 來記錄 ---
    app.logger.info(f"訪客瀏覽 - IP: {ip_address}, User-Agent: {user_agent}")

    # HTML 模板
    html_template = """
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IP 位址查詢工具</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; color: #333; }
            .ip-container { text-align: center; padding: 40px 60px; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); max-width: 90%; }
            h1 { font-size: 24px; color: #1a73e8; margin-bottom: 20px; }
            .ip-address { font-size: 48px; font-weight: bold; color: #202124; letter-spacing: 2px; word-break: break-all; }
            .notes { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #6c757d; line-height: 1.6; text-align: left; }
        </style>
    </head>
    <body>
        <div class="ip-container">
            <h1>您的 IP 位址是：</h1>
            <div class="ip-address">{{ ip }}</div>
            <div class="notes">
                <strong>備註：</strong>
                <p style="margin: 5px 0 0 0;">這邊可以放一些說明註記</p>
            </div>
        </div>
    </body>
    </html>
    """

    return render_template_string(html_template, ip=ip_address)

if __name__ == '__main__':
    # 使用 app.logger 記錄啟動訊息
    app.logger.info("IP 查詢網站已啟動...")
    # 將 web 開啟在 80 port
    app.run(host='0.0.0.0', port=80, debug=True)
