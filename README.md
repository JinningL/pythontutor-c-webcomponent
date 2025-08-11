# pythontutor-c-webcomponent

A web component for visualizing **C code execution** with an enhanced [Python Tutor](https://pythontutor.com/) engine.  
Supports **inline annotations**, **code folding**, and **HTML to trace.json extraction** for textbook embedding.

---

## ✨ Features

- **Easy Embed** — One `<c-visualizer>` tag shows the full execution visualization.
- **C Language Support** — Backend generates execution traces for C programs.
- **Annotation Support** — Show step-by-step tooltips using JSON.
- **Auto Extraction Script** — Parse HTML, extract code, run backend, and save `trace.json`.

---

## 📂 Project Structure

```plaintext
pythontutor-c-webcomponent/
├── build/                     # Compiled JS/CSS assets
├── example/                   # Generated code + trace + annotations
│   └── chapter1/example1/
│       ├── code.c
│       ├── trace.json
│       └── annotation.json
├── backend.py                  # Python Tutor C backend
├── run_and_visualize.py        # Parse HTML & run backend to generate trace
├── test-component.html         # Demo HTML with <c-visualizer>
├── LICENSE
└── README.md
