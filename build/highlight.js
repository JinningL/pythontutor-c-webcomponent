// Inject global styles once
const style = document.createElement("style");
style.textContent = `
  td.cod {
    font-family: Menlo, monospace;
    font-size: 11pt;
    background-color: #ffffff;
    border-radius: 4px;
    white-space: nowrap;
  }
  .executed-highlight {
    background-color: #fffbd0 !important; 
    transition: background-color 0.2s;
  }
`;
document.head.appendChild(style);

// Syntax-highlight all td.cod inside a given rootEl
function highlightCodeIn(rootEl) {
  const scope = rootEl && rootEl.jquery ? rootEl[0] : rootEl || document;
  const cells = scope.querySelectorAll("td.cod");
  if (!cells.length) return;

  cells.forEach((cell) => {
    // Skip if already highlighted
    if (cell.dataset.highlighted === "1") return;

    const raw = cell.innerText;
    const html = Prism.highlight(raw, Prism.languages.c, "c");
    const withSpaces = html.replace(/^(\s+)/, (m) => "&nbsp;".repeat(m.length));
    cell.innerHTML = withSpaces;
    cell.dataset.highlighted = "1";
  });
}

//Highlight the executed line inside one instance 
function highlightExecutedLine(lineNumber, domRoot) {
  const scope = domRoot && domRoot.jquery ? domRoot[0] : domRoot || document;
  const codeCells = scope.querySelectorAll("td.cod");

  // Clear previous highlight
  codeCells.forEach((cell) => cell.classList.remove("executed-highlight"));

  // lineNumber is 1-based; DOM NodeList is 0-based
  const target = codeCells[lineNumber - 1];
  if (target) target.classList.add("executed-highlight");
}

// Attach highlighting hooks to an ExecutionVisualizer instance 
function attachHighlighter(viz) {
  if (!viz || !viz.domRoot) return;

  // First paint after initial render
  requestAnimationFrame(() => highlightCodeIn(viz.domRoot));

  // Re-highlight on every output update (preserve any existing callback)
  const oldCb = viz.params.updateOutputCallback;
  viz.params.updateOutputCallback = (v) => {
    if (typeof oldCb === "function") oldCb(v);
    highlightCodeIn(v.domRoot);
  };

  const rootEl = viz.domRoot.jquery ? viz.domRoot[0] : viz.domRoot;
  const mo = new MutationObserver(() => highlightCodeIn(rootEl));
  mo.observe(rootEl, { childList: true, subtree: true });
}

// Export helpers
// window.highlightCodeIn = highlightCodeIn;
window.highlightExecutedLine = highlightExecutedLine;
window.attachHighlighter = attachHighlighter;