from bs4 import BeautifulSoup, NavigableString, Comment
import subprocess
import html
import os
import json
import re


HTML_FILE = "test-component.html"
BACKEND_SCRIPT = "backend.py"


def extract_code_exact(tag):
    # 只取直系文本节点（不递归），排除 <script> / 注释
    pieces = []
    for child in tag.contents:
        if isinstance(child, NavigableString) and not isinstance(child, Comment):
            pieces.append(str(child))
    raw = "".join(pieces)

    # 反转实体、统一换行
    raw = html.unescape(raw)
    raw = re.sub(r"\r\n?|\u2028|\u2029", "\n", raw)

    # —— 去掉开头/结尾的空行（只删空白行）——
    lines = raw.split("\n")
    while lines and lines[0].strip() == "":
        lines.pop(0)
    while lines and lines[-1].strip() == "":
        lines.pop()

    # —— 去掉统一的左缩进（保留相对缩进）——
    if lines:
        min_indent = None
        for ln in lines:
            if ln.strip():  # 非空行
                leading = len(ln) - len(ln.lstrip(" "))
                min_indent = leading if min_indent is None else min(min_indent, leading)
        if min_indent and min_indent > 0:
            lines = [ln[min_indent:] if ln.strip() else "" for ln in lines]

    # 重新拼接，并确保结尾只有一个换行
    return "\n".join(lines) + "\n"


with open(HTML_FILE, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f, "html.parser")

visualizers = soup.find_all("c-visualizer")
if not visualizers:
    raise Exception("Didn't find any <c-visualizer>")

print(f"Find {len(visualizers)} <c-visualizer>")

for idx, visualizer in enumerate(visualizers):
    
    chapter = visualizer.get("chapter", "").strip()
    example = visualizer.get("example", "").strip()

    if not chapter or not example:
        print(f"{idx+1} doesnt have chapter or example")
        continue

    # 提取代码（转义 HTML 实体）
    code = extract_code_exact(visualizers[idx])

    # 构造文件夹路径
    base_dir = os.path.join("example", chapter, f"example{example}")
    os.makedirs(base_dir, exist_ok=True)

    code_path = os.path.join(base_dir, "code.c")
    trace_path = os.path.join(base_dir, "trace.json")
    annotation_path = os.path.join(base_dir, "annotation.json")

    # 写入 code.c
    with open(code_path, "w", encoding="utf-8") as f:
        f.write(code)
    print(code)

    # 调用 backend.py
    result = subprocess.run(
        ["python3", BACKEND_SCRIPT, code_path, trace_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    if result.returncode == 0:
        print(f"Succeed generating trace:{trace_path}")

    else:
        print(f"backend.py Error:\n{result.stderr}")