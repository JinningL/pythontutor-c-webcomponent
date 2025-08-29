class CVisualizer extends HTMLElement {
    constructor() { super(); }
  
    // Called automatically when the element is inserted into the DOM
    async connectedCallback() {
      // 1) Read and validate the "example" attribute (must be a positive integer)
      const exampleStr = (this.getAttribute("example") || "").trim();
      if (!/^\d+$/.test(exampleStr)) {
        this.innerHTML = `<p style="color:red;">❌ Error: &lt;c-visualizer&gt; requires a valid example number (positive integer).</p>`;
        console.error("[c-visualizer] Invalid 'example':", exampleStr);
        return;
      }
  
      // 2) Build the trace URL based on current page path
      let relPath = location.pathname.replace(/^\//, "").replace(/\.[^/.]+$/, "");
      if (relPath.endsWith("/")) relPath += "index";
      const parts  = relPath.split("/");
      const folder = parts.length > 1 ? parts[parts.length - 2] : "";
      const page   = parts[parts.length - 1];
      const traceUrl = `/trace/${folder}/${page}/example${exampleStr}/trace.json`;
  
      // 3) Read inline JSON (annotations + folds) scoped to this custom element only
      let annotations = {};
      let folds = [];
      const inlineEl = this.querySelector('script[type="application/json"][data-kind="annotation"]');
      if (inlineEl) {
        try {
          const parsed = JSON.parse((inlineEl.textContent || "").trim());
          annotations = parsed.annotation || {};
          // keep only valid ranges: 1-based lines, end > start
          folds = (parsed.folds || []).filter(
            it => it && Number.isFinite(it.start) && Number.isFinite(it.end) && it.end > it.start
          );
        } catch (e) {
          console.warn("[annotation] Inline JSON parsing failed:", e);
        }
      }
  
      // 4) Create a unique container and show a temporary placeholder
      const divId = `vis-${relPath.replace(/\//g, "-")}-ex${exampleStr}-${Math.floor(Math.random() * 100000)}`;
      this.innerHTML = `<div id="${divId}">Loading trace...</div>`;
      const rootEl = document.getElementById(divId);
  
      // 5) Attach instance-private data to this container
      rootEl.__stepNotes = annotations;
      rootEl.__folds = folds;
  
      // 6) Fetch the execution trace JSON
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
  
      // 7) Initialize the ExecutionVisualizer (pass annotations directly)
      const lang = this.getAttribute("lang") || "c";
      const viz = new window.ExecutionVisualizer(divId, trace, {
        embeddedMode: true,
        lang,    
        codeDivWidth: 470,
      });

      if (typeof window.attachHighlighter === 'function') {
        window.attachHighlighter(viz);
      }
  
      // 8) Optionally keep a handle for debugging (still instance-private)
      rootEl.__viz = viz;
  
      // 9) Apply code folding for this instance on the next frame
      requestAnimationFrame(() => {
        // expects your applyCodeFolding(rootEl, folds) to act only within rootEl
        window.applyCodeFolding?.(rootEl, folds);
        if (typeof window.highlightCodeIn === 'function') {
            window.highlightCodeIn(rootEl);
          }
      });
    }
  }
  
  // Define the custom element once 
  if (!customElements.get("c-visualizer")) {
    customElements.define("c-visualizer", CVisualizer);
  }