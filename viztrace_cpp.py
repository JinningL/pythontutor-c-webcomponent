import sys
import requests
from bs4 import BeautifulSoup, NavigableString, Comment
import html as htmllib
import os
import json
import re
from pathlib import Path

USAGE = "Usage: python generate_trace.py <html_file>"

if len(sys.argv) < 2:
    print(USAGE)
    sys.exit(1)

HTML_FILE = sys.argv[1]
html_path = Path(HTML_FILE)
if not html_path.exists():
    print(f"File not found: {HTML_FILE}")
    sys.exit(1)

BASE_DIR = Path("example") / html_path.stem

def extract_code_exact(tag):
    """Extract only direct text nodes (not recursive), remove comments, unescape HTML entities, normalize indentation."""
    pieces = []
    for child in tag.contents:
        if isinstance(child, NavigableString) and not isinstance(child, Comment):
            pieces.append(str(child))
    raw = "".join(pieces)
    raw = htmllib.unescape(raw)
    raw = re.sub(r"\r\n?|\u2028|\u2029", "\n", raw)

    lines = raw.split("\n")
    while lines and lines[0].strip() == "":
        lines.pop(0)
    while lines and lines[-1].strip() == "":
        lines.pop()

    if lines:
        min_indent = None
        for ln in lines:
            if ln.strip():
                leading = len(ln) - len(ln.lstrip(" "))
                min_indent = leading if min_indent is None else min(min_indent, leading)
        if min_indent and min_indent > 0:
            lines = [ln[min_indent:] if ln.strip() else "" for ln in lines]

    return "\n".join(lines) + "\n"

# Parse HTML
with open(html_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f, "html.parser")

visualizers = soup.find_all("c-visualizer")
if not visualizers:
    print("No <c-visualizer> tag found in the HTML file.")
    sys.exit(1)

print(f"Found {len(visualizers)} <c-visualizer> tag(s)")

# ===== 1) Validation: "example" must exist, be a positive integer, and unique =====
errors = []
seen = set()

def parse_example(el, idx):
    raw = (el.get("example") or "").strip()
    if not re.fullmatch(r"\d+", raw):
        errors.append(f"[Visualizer #{idx}] Missing or invalid 'example' attribute: '{raw}' (must be a positive integer)")
        return None
    val = int(raw)
    if val <= 0:
        errors.append(f"[Visualizer #{idx}] 'example' must be > 0, but got {val}")
        return None
    if val in seen:
        errors.append(f"[Visualizer #{idx}] Duplicate 'example' value: {val}")
        return None
    seen.add(val)
    return val

examples = []
for i, viz in enumerate(visualizers, start=1):
    val = parse_example(viz, i)
    examples.append(val)

if errors:
    print("❌ Validation failed:")
    for e in errors:
        print(" -", e)
    sys.exit(2)

# ===== 2) Generate trace.json for each visualizer =====
BASE_DIR.mkdir(parents=True, exist_ok=True)

for idx, (viz, ex) in enumerate(zip(visualizers, examples), start=1):
    code = extract_code_exact(viz)

    out_dir = BASE_DIR / f"example{ex}"
    out_dir.mkdir(parents=True, exist_ok=True)

    code_path = out_dir / "code.cpp"
    trace_path = out_dir / "trace.json"

    code_path.write_text(code, encoding="utf-8")
    print(f"[{idx}] Generating trace -> {trace_path} …")

    url = "https://pythontutor.com/web_exec_c.py"
    params = {
        "user_script": code,
        "raw_input_json": "",
        "options_json": json.dumps({
            "cumulative_mode": False,
            "heap_primitives": False,
            "show_only_outputs": False,
            "origin": "opt-frontend.js",
            "cpp_version": "cpp_g++9.3.0",
            "fe_disableHeapNesting": True,
            "fe_textualMemoryLabels": False
        }),
        "lang": "cpp",
        "stdin": "",
        "backend_options_json": "{}",
        "frontend_options_json": "{}",
        "starting_instruction": 0,
        "instruction_limit": 10000,
        "origin": "c"
    }

    try:
        resp = requests.post(url, data=params, timeout=30)
        resp.raise_for_status()
        result = resp.json()
        trace_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(f"✅ OK: {trace_path}")
    except Exception as e:
        print(f"❌ Failed to generate trace for example{ex}: {e}")
        sys.exit(3)

print("All traces generated successfully.")