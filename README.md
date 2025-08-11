# pythontutor-c-webcomponent

[![Status](https://img.shields.io/badge/status-work%20in%20progress-yellow)](https://github.com/JinningL/pythontutor-c-webcomponent)

A web component for visualizing **C code execution** with an enhanced [Python Tutor](https://pythontutor.com/) engine.  
Supports **inline annotations**, **code folding**, and **HTML to trace.json extraction** for textbook embedding.

---

## 📸 Demo

Code execution visualization with inline annotations and heap/stack view:


 ![Code Step](docs/demo.png)

[![Live Demo](https://img.shields.io/badge/Demo-Live-blue)](https://JinningL.github.io/pythontutor-c-webcomponent/test-component.html)
---

## ✨ Features

- **Easy Embed** — One `<c-visualizer>` tag shows the full execution visualization.
- **C Language Support** — Backend generates execution traces for C programs.
- **Annotation Support** — Show step-by-step tooltips using JSON.
- **Code Folding** — Collapse and expand code sections for cleaner view.
- **Syntax Highlighting** — Highlight code syntax automatically for better readability.

---
## 🛠 Usage

### 1) Quick start — download one script
**macOS / Linux**
```bash
curl -L -O https://cdn.jsdelivr.net/gh/JinningL/pythontutor-c-webcomponent@main/viztrace.py
pip install beautifulsoup4 requests
python viztrace.py your-page.html
```

**Windows (PowerShell)**
```bash
iwr https://cdn.jsdelivr.net/gh/JinningL/pythontutor-c-webcomponent@main/viztrace.py -OutFile viztrace.py
pip install beautifulsoup4 requests
python viztrace.py your-page.html
```

The script will:
- scan your-page.html for `<c-visualizer>` tags
- extract the inline C code
- produce code.c and trace.json under:
 ```bash
 example/<your-page-stem>/example<EXAMPLE_NUMBER>/
 ```
&nbsp;  
> **Note – Keep example numbers unique:**
> 
> The `example="..."` attribute (`EXAMPLE_NUMBER`) determines the folder name  `example/<your-page-stem>/example<EXAMPLE_NUMBER>/` where `trace.json` is stored and loaded. Reusing the same number will overwrite files or break the visualization.
&nbsp;  

### 2) Include the visualizer via CDN

#### **Latest main:**
```html
<script src="https://cdn.jsdelivr.net/gh/JinningL/pythontutor-c-webcomponent@28e1db2/loader.js"></script>
```

#### **Minimal HTML example**
```html
<!doctype html>
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Visualizer Web Component</title>
  <script src="https://cdn.jsdelivr.net/gh/JinningL/pythontutor-c-webcomponent@28e1db2/loader.js"></script>
</head>
<body>
  <!-- Only 'example' is required and must be a positive integer -->
  <c-visualizer example="1" lang="c">
    <script type="application/json" data-kind="annotation">
      {
        "annotation": { "2": "This line prints 'Hello, world!'" },
        "folds": [{ "start": 1, "end": 2 }]
      }
    </script>

    #include &lt;stdio.h&gt;
    int main() {
      printf("Hello, world!");
      return 0;
    }
  </c-visualizer>
</body>
</html>
```

**Note:**  
- The component loads trace.json from:
```bash
example/<current-html-filename-without-extension>/example<example>/trace.json
```
- The example attribute is required, must be a unique positive integer per page.
- In HTML, certain characters like < and > in code or text content must be written as `&lt;`; and `&gt;`; so that they are displayed correctly instead of being interpreted as HTML tags.
- Both annotation and folds are optional. If omitted, the visualization will still run normally without step tooltips or code folding.

---
## 📂 Project Structure

```plaintext
pythontutor-c-webcomponent/
├── build/                     # Compiled JS/CSS assets
├── example/                   # Generated code + trace 
│   └── chapter1/example1/
│       ├── code.c
│       └── trace.json
├── backend.py                  # Python Tutor C backend
├── run_and_visualize.py        # Parse HTML & run backend to generate trace
├── loader.js                   # One-line CDN loader (loads all CSS/JS deps)
├── test-component.html         # Demo HTML with <c-visualizer>
├── LICENSE
└── README.md
```
---
## 🐞 Contact

If you encounter any bugs or issues, please [open an issue](https://github.com/JinningL/pythontutor-c-webcomponent/issues) or contact me directly at **imjinning.liu@mail.utoronto.ca**.
