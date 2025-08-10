class CVisualizer extends HTMLElement {
  constructor() { super(); }

  async connectedCallback() {
    const chapter = this.getAttribute("chapter") || "chapterX";
    const example = this.getAttribute("example") || "X";
    const traceUrl = `example/${chapter}/example${example}/trace.json`;
    const annotationUrl = this.getAttribute("annotation") || `example/${chapter}/example${example}/annotation.json`; // 保留但不用
    const frontendLang = this.getAttribute("lang") || "c";

    // ✅ 先在覆盖 innerHTML 之前，从内联 <script> 读取 annotation
    let inlineNotes = {};
    let inlineFolds = [];
    (function readInlineAnnotation(hostEl){
      const el = hostEl.querySelector('script[type="application/json"][data-kind="annotation"]');
      if (el) {
        try {
          const parsed = JSON.parse((el.textContent || "").trim());
          inlineNotes = parsed.annotation || {};
          inlineFolds = (parsed.folds || []).filter(
            it => it && Number.isFinite(it.start) && Number.isFinite(it.end) && it.end > it.start
          );
          window.stepNotes = inlineNotes;
          window.foldData  = inlineFolds;

          // console.log("", inlineFolds);

        } catch (e) {
          console.warn("[annotation] 内联 JSON 解析失败：", e);
        }
      }
      // 可选：如果你仍然有旧代码用到这两个全局，就同步一下
      window.stepNotes = inlineNotes;
      window.foldData = inlineFolds;
    })(this);

    // ✅ 你的 trace 逻辑保持不变
    const divId = `vis-${chapter}-ex${example}-${Math.floor(Math.random() * 100000)}`;
    this.innerHTML = `<div id="${divId}">Loading trace...</div>`;

    try {
      const trace = await (await fetch(traceUrl)).json();


      new window.ExecutionVisualizer(divId, trace, {
        embeddedMode: true,
        lang: frontendLang,
        annotations: inlineNotes,   // ✅ 用内联注释
        codeDivWidth: 470,
      });

    } catch (err) {
      this.innerHTML = `<p style="color:red;">Cannot load ${traceUrl}</p>`;
      console.error("Trace failed", err);
    }
  }
}

customElements.define("c-visualizer", CVisualizer);