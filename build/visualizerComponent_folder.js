// c-visualizer.js  —— 防重复注册版本
(() => {
    // 若已注册，直接返回（最保险的第一层）
    if (customElements.get('c-visualizer')) return;
    // 若 HMR/重复加载过，直接返回（第二层）
    if (window.__CVisualizerDefined__) return;
  
    class CVisualizer extends HTMLElement {
      constructor() { super(); }
      async connectedCallback() {
        // 你的 connectedCallback 内容保持不变
        const exampleStr = (this.getAttribute("example") || "").trim();
        if (!/^\d+$/.test(exampleStr)) {
          this.innerHTML = `<p style="color:red;">❌ Error: &lt;c-visualizer&gt; requires a valid example number (positive integer).</p>`;
          console.error("[c-visualizer] Invalid 'example':", exampleStr);
          return;
        }
  
        // 路径计算（照你原来的来）
        let relPath = location.pathname.replace(/^\//, "").replace(/\.[^/.]+$/, "");
        if (relPath.endsWith("/")) relPath += "index";
        const parts  = relPath.split("/");
        const folder = parts.length > 1 ? parts[parts.length - 2] : "";
        const page   = parts[parts.length - 1];
        const traceUrl = `/trace/${folder}/${page}/example${exampleStr}/trace.json`;
  
        // 读 inline 注释 & 折叠（局部作用域）
        let annotations = {};
        let folds = [];
        const inlineEl = this.querySelector('script[type="application/json"][data-kind="annotation"]');
        if (inlineEl) {
          try {
            const parsed = JSON.parse((inlineEl.textContent || "").trim());
            annotations = parsed.annotation || {};
            folds = (parsed.folds || []).filter(
              it => it && Number.isFinite(it.start) && Number.isFinite(it.end) && it.end > it.start
            );
          } catch (e) {
            console.warn("[annotation] Inline JSON parsing failed:", e);
          }
        }
  
        // 容器
        const divId = `vis-${relPath.replace(/\//g, "-")}-ex${exampleStr}-${Math.floor(Math.random() * 100000)}`;
        this.innerHTML = `<div id="${divId}">Loading trace...</div>`;
        const rootEl = document.getElementById(divId);
        rootEl.__stepNotes = annotations;
        rootEl.__folds = folds;
  
        // 拉 trace
        let trace;
        try {
          const resp = await fetch(traceUrl);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          trace = await resp.json();
        } catch (err) {
          this.innerHTML = `<p style="color:red;">Cannot load ${traceUrl}</p>`;
          console.error("[c-visualizer] Trace failed", err);
          return;
        }
  
        // 初始化 EV
        const lang = this.getAttribute("lang") || "c";
        const viz = new window.ExecutionVisualizer(divId, trace, {
          embeddedMode: true,
          lang,
          codeDivWidth: 470,
        });
  
        rootEl.__viz = viz;
  
        // 应用折叠（仅当前实例）
        requestAnimationFrame(() => {
          window.applyCodeFolding?.(rootEl, folds);
        });
      }
    }
  
    // 真正注册（第三层保护：只在 get 返回空时注册）
    if (!customElements.get('c-visualizer')) {
      customElements.define('c-visualizer', CVisualizer);
    }
  
    // 打上已定义的全局标记（给重复加载/热更新用）
    window.__CVisualizerDefined__ = true;
  })();