import sys
import requests
import json

if len(sys.argv) < 3:
    print("用法：python backend.py <code_file> <trace_output>")
    sys.exit(1)

code_path = sys.argv[1]
trace_path = sys.argv[2]

with open(code_path, "r", encoding="utf-8") as f:
    code = f.read()

url = "https://pythontutor.com/web_exec_c.py"

params = {
    "user_script": code,
    "raw_input_json": "",
    "options_json": json.dumps({
        "cumulative_mode": False,
        "heap_primitives": False,
        "show_only_outputs": False,
        "origin": "opt-frontend.js",
        "cpp_version": "c_gcc9.3.0",
        "fe_disableHeapNesting": True,
        "fe_textualMemoryLabels": False
    }),
    "lang": "c",
    "stdin": "",
    "backend_options_json": "{}",
    "frontend_options_json": "{}",
    "starting_instruction": 0,
    "instruction_limit": 10000,
    "origin": "c"
}

response = requests.post(url, data=params)

if response.status_code == 200:
    result = response.json()
    with open(trace_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"✅ Trace saved to {trace_path}")
else:
    print("❌ 请求失败，状态码:", response.status_code)