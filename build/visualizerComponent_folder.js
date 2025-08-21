// Define a custom HTML element <c-visualizer>
class CVisualizer extends HTMLElement {
    constructor() { super(); }
  
    // This method is automatically called when the element is inserted into the DOM
    async connectedCallback() {
      
      // Get the current page name (without extension) to build the path for trace.json
      const pageStem = (location.pathname.split('/').pop() || 'index')
        .replace(/\.[^/.]+$/, '') || 'index';
      
      // Get the current page name (without extension) to build the path for trace.json
      const exampleStr = (this.getAttribute("example") || "").trim();
  
      // Validate that "example" is a positive integer
      if (!/^\d+$/.test(exampleStr)) {
        this.innerHTML = `<p style="color:red;">❌ Error: &lt;c-visualizer&gt; requires a valid example number (positive integer).</p>`;
        console.error("[c-visualizer] Invalid 'example':", exampleStr);
        return;
      }
    
      // Build the path to the trace.json file
      const traceUrl = `../../trace/${pageStem}/example${exampleStr}/trace.json`;
  
      // Get language from "lang" attribute, default to "c"
      const frontendLang = this.getAttribute("lang") || "c";
  
      // Read inline <script> JSON (annotations and folds) before overwriting innerHTML
      let inlineNotes = {};
      let inlineFolds = [];
      (function readInlineAnnotation(hostEl){
        // Look for <script type="application/json" data-kind="annotation"> inside this element
        const el = hostEl.querySelector('script[type="application/json"][data-kind="annotation"]');
        if (el) {
          try {
            // Parse JSON content and extract "annotation" and "folds"
            const parsed = JSON.parse((el.textContent || "").trim());
            inlineNotes = parsed.annotation || {};
            inlineFolds = (parsed.folds || []).filter(
              it => it && Number.isFinite(it.start) && Number.isFinite(it.end) && it.end > it.start
            );
  
            // Save to global variables for backward compatibility
            window.stepNotes = inlineNotes;
            window.foldData  = inlineFolds;
  
            // console.log("", inlineFolds);
  
          } catch (e) {
            console.warn("[annotation] 内联 JSON 解析失败：", e);
          }
        }
        // Optional: sync notes and folds globally even if no inline script was found
        window.stepNotes = inlineNotes;
        window.foldData = inlineFolds;
      })(this);
  
      // Create a unique div ID and display a "Loading..." placeholder
      const divId = `vis-${pageStem}-ex${exampleStr}-${Math.floor(Math.random() * 100000)}`;
      this.innerHTML = `<div id="${divId}">Loading trace...</div>`;
  
      try {
        // Fetch the execution trace JSON file
        const trace = await (await fetch(traceUrl)).json();
  
        // Initialize the ExecutionVisualizer with options
        new window.ExecutionVisualizer(divId, trace, {
          embeddedMode: true,   // run in embedded (inline) mode
          lang: frontendLang,
          annotations: inlineNotes, 
          codeDivWidth: 470,   
        });
  
      } catch (err) {
        // Handle errors when trace.json cannot be loaded
        this.innerHTML = `<p style="color:red;">Cannot load ${traceUrl}</p>`;
        console.error("Trace failed", err);
      }
    }
  }
  
  // Register the custom element <c-visualizer>
  customElements.define("c-visualizer", CVisualizer);