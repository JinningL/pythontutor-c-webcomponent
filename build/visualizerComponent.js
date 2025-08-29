class CVisualizer extends HTMLElement {
  async connectedCallback() {
    // 1) Read inline JSON (annotations + folds) from the slot inside <c-visualizer>
    const inlineEl = this.querySelector('script[type="application/json"][data-kind="annotation"]');
    let annotations = {}, folds = [];
    if (inlineEl) {
      try {
        const parsed = JSON.parse((inlineEl.textContent || '').trim());
        annotations = parsed.annotation || {};
        folds = parsed.folds || [];
      } catch (e) {
        console.warn('[c-visualizer] inline annotation parse failed:', e);
      }
    }

    // 2) Create a unique container <div> for this instance
    const pageStem = (location.pathname.split('/').pop() || 'index').replace(/\.[^.]+$/, '') || 'index';
    const exampleStr = (this.getAttribute('example') || '').trim();
    if (!/^\d+$/.test(exampleStr)) {
      this.innerHTML = `<p style="color:red;">❌ &lt;c-visualizer&gt; needs a valid example number.</p>`;
      return;
    }
    const divId = `vis-${pageStem}-ex${exampleStr}-${Math.floor(Math.random() * 100000)}`;
    this.innerHTML = `<div id="${divId}">Loading…</div>`;
    const rootEl = document.getElementById(divId);
    // console.log('[step2] container created:', divId, rootEl);

    // 3) Stash per-instance data on the container (read later by showStepNote/folding)
    rootEl.__stepNotes = annotations;
    rootEl.__folds = folds;

    // 4) Fetch this example’s execution trace
    const traceUrl = `example/${pageStem}/example${exampleStr}/trace.json`;
    let trace;
    try {
      const resp = await fetch(traceUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      trace = await resp.json();
    } catch (err) {
      rootEl.innerHTML = `<p style="color:red;">Cannot load ${traceUrl}</p>`;
      console.error('[c-visualizer] Trace failed', err);
      return;
    }

    // 5) Boot the visualizer
    const lang = this.getAttribute('lang') || 'c';
    const viz = new window.ExecutionVisualizer(divId, trace, {
      embeddedMode: true,
      lang,
      codeDivWidth: 470,
    });

    // Hook syntax highlighting into this instance
    window.attachHighlighter(viz);

    // Expose references: private (on this root) and optional global (for console debugging)
    rootEl.__viz = viz;     // per-instance handle
    window.myViz = viz;     // optional: convenient for console usage

    // 6) Apply code folding to THIS instance on the next frame (DOM is ready)
    requestAnimationFrame(() => {
      window.applyCodeFolding?.(rootEl, folds);
    });
  }
}

if (!customElements.get('c-visualizer')) {
  customElements.define('c-visualizer', CVisualizer);
}