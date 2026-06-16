import http.server
import socketserver
import os
import json
import urllib.parse

# 英文版伺服器連接埠為 8001，避免與中文版衝突
PORT = 8001
WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
NOTES_DIR = os.path.join(WORKSPACE_DIR, "analysis_notes_en")

def get_note_filename(shot_num):
    # 根據鏡頭編號取得對應的 Markdown 筆記檔案名稱
    if 2 <= shot_num <= 11:
        return "scene_002_to_011.md"
    elif 13 <= shot_num <= 19:
        return "scene_013_to_019.md"
    elif 20 <= shot_num <= 25:
        return "scene_020_to_025.md"
    elif 26 <= shot_num <= 34:
        return "scene_026_to_034.md"
    elif 35 <= shot_num <= 44:
        return "scene_035_to_044.md"
    elif 45 <= shot_num <= 48:
        return "scene_045_to_048.md"
    elif 49 <= shot_num <= 61:
        return "scene_049_to_061.md"
    elif 62 <= shot_num <= 81:
        return "scene_062_to_081.md"
    elif 84 <= shot_num <= 103:
        return "scene_084_to_103.md"
    elif 106 <= shot_num <= 108:
        return "scene_106_to_108.md"
    elif 109 <= shot_num <= 118:
        return "scene_109_to_118.md"
    elif 119 <= shot_num <= 130:
        return "scene_119_to_130.md"
    elif 131 <= shot_num <= 137:
        return "scene_131_to_137.md"
    elif 138 <= shot_num <= 144:
        return "scene_138_to_144.md"
    elif 145 <= shot_num <= 152:
        return "scene_145_to_152.md"
    elif 153 <= shot_num <= 161:
        return "scene_153_to_161.md"
    elif 162 <= shot_num <= 174:
        return "scene_162_to_174.md"
    elif 175 <= shot_num <= 181:
        return "scene_175_to_181.md"
    elif 182 <= shot_num <= 195:
        return "scene_182_to_195.md"
    elif 196 <= shot_num <= 203:
        return "scene_196_to_203.md"
    elif 204 <= shot_num <= 215:
        return "scene_204_to_215.md"
    elif 216 <= shot_num <= 226:
        return "scene_216_to_226.md"
    elif 227 <= shot_num <= 234:
        return "scene_227_to_234.md"
    elif 235 <= shot_num <= 248:
        return "scene_235_to_248.md"
    elif 249 <= shot_num <= 266:
        return "scene_249_to_266.md"
    elif 267 <= shot_num <= 273:
        return "scene_267_to_273.md"
    elif 274 <= shot_num <= 285:
        return "scene_274_to_285.md"
    elif 286 <= shot_num <= 295:
        return "scene_286_to_295.md"
    elif 296 <= shot_num <= 315:
        return "scene_296_to_315.md"
    elif 316 <= shot_num <= 340:
        return "scene_316_to_340.md"
    elif 341 <= shot_num <= 355:
        return "scene_341_to_355.md"
    elif 356 <= shot_num <= 380:
        return "scene_356_to_380.md"
    elif 381 <= shot_num <= 400:
        return "scene_381_to_400.md"
    elif 401 <= shot_num <= 425:
        return "scene_401_to_425.md"
    elif 426 <= shot_num <= 450:
        return "scene_426_to_450.md"
    elif 451 <= shot_num <= 461:
        return "scene_451_to_461.md"
    elif 462 <= shot_num <= 475:
        return "scene_462_to_475.md"
    elif 476 <= shot_num <= 495:
        return "scene_476_to_495.md"
    elif 496 <= shot_num <= 540:
        return "scene_496_to_540.md"
    elif 541 <= shot_num <= 555:
        return "scene_541_to_555.md"
    elif 556 <= shot_num <= 580:
        return "scene_556_to_580.md"
    elif 581 <= shot_num <= 605:
        return "scene_581_to_605.md"
    elif 606 <= shot_num <= 625:
        return "scene_606_to_625.md"
    elif 626 <= shot_num <= 643:
        return "scene_626_to_643.md"
    else:
        return f"scene_{shot_num:03d}.md"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # 於工作區目錄中初始化，以便 SimpleHTTPRequestHandler 靜態檔案服務
        super().__init__(*args, directory=WORKSPACE_DIR, **kwargs)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        
        # API 端點：獲取筆記內容
        if parsed_url.path == "/api/get_note":
            query_params = urllib.parse.parse_qs(parsed_url.query)
            shot_num_str = query_params.get("shot_num", [None])[0]
            if not shot_num_str:
                self.send_error_json(400, "Missing shot_num parameter")
                return

            try:
                shot_num = int(shot_num_str)
                filename = get_note_filename(shot_num)
                filepath = os.path.join(NOTES_DIR, filename)

                content = ""
                if os.path.exists(filepath):
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()

                response_data = {"status": "success", "content": content}
                self.send_json_response(200, response_data)
            except ValueError:
                self.send_error_json(400, "Invalid shot_num parameter")
            except Exception as e:
                self.send_error_json(500, str(e))
        
        # 如果請求的是根目錄或 index.html，則重寫為 index_en.html
        elif parsed_url.path == "/" or parsed_url.path == "/index.html":
            self.path = "/index_en.html"
            super().do_GET()
            
        else:
            # 預設的靜態檔案服務
            super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        
        # API 端點：儲存筆記內容
        if parsed_url.path == "/api/save_note":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                shot_num = int(data.get("shot_num"))
                content = data.get("content", "")

                # 確保英文筆記目錄存在
                if not os.path.exists(NOTES_DIR):
                    os.makedirs(NOTES_DIR)

                filename = get_note_filename(shot_num)
                filepath = os.path.join(NOTES_DIR, filename)

                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)

                response_data = {
                    "status": "success",
                    "file": os.path.join("analysis_notes_en", filename)
                }
                self.send_json_response(200, response_data)
            except Exception as e:
                self.send_error_json(500, str(e))
        else:
            self.send_error_json(404, "Not Found")

    def send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        # 允許跨域請求 (CORS) 以利開發與偵錯
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def send_error_json(self, status_code, message):
        self.send_json_response(status_code, {"status": "error", "message": message})

    def do_OPTIONS(self):
        # 支援跨域預檢 (CORS preflight)
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

def main():
    # 切換至工作區目錄
    os.chdir(WORKSPACE_DIR)
    
    # 確保筆記儲存目錄存在
    if not os.path.exists(NOTES_DIR):
        os.makedirs(NOTES_DIR)
        print(f"Created English notes directory at: {NOTES_DIR}")

    # 設定 socket 埠號重用並啟動 TCP 伺服器
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"===========================================================")
        print(f" 2001: A Space Odyssey - English Dashboard Server Started!")
        print(f" Please open in browser: http://localhost:{PORT}")
        print(f" Your writing notes will be saved in: {NOTES_DIR}")
        print(f" Press Ctrl + C to stop the server")
        print(f"===========================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == "__main__":
    main()
