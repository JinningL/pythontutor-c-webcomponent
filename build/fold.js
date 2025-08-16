// Store all folding ranges: each record has { start, end, folded }
window.foldedRanges = [];

// Check if a given line number is currently hidden by a fold
function isLineHidden(lineNumber) {
  return window.foldedRanges.some(({ start, end, folded }) =>
    folded && lineNumber > start && lineNumber <= end
  );
}

// Add a folding toggle for a specific range of lines
function addCodeFolding(domRoot, startLine, endLine, initialFolded = true) {
  const rootEl = domRoot && (domRoot.jquery ? domRoot[0] : domRoot);
  if (!rootEl) return;

  const allRows = rootEl.querySelectorAll("tr");
  if (startLine < 1 || endLine > allRows.length) return;

  // The toggle button will be placed in the start line
  const toggleRow = allRows[startLine - 1];
  const lineNoTd = toggleRow.querySelector("td.lineNo") || toggleRow.children[0] || null;
  if (!lineNoTd) return;

   // Remove any existing toggle to avoid duplicates
  lineNoTd.querySelector(".toggle")?.remove();

  const arrow = document.createElement("span");
  arrow.className = "toggle";
  arrow.textContent = initialFolded ? "▶" : "▼";
  arrow.style.cursor = "pointer";
  arrow.style.marginRight = "4px";
  arrow.style.userSelect = "none";
  lineNoTd.prepend(arrow);

  // Save folding state
  const rec = { start: startLine, end: endLine, folded: initialFolded };
  window.foldedRanges.push(rec);

  // Hide or show the target rows depending on initial state
  for (let i = startLine; i < endLine; i++) {
    allRows[i].style.display = initialFolded ? "none" : "";
  }

  // Toggle behavior when clicking the arrow
  arrow.addEventListener("click", () => {
    rec.folded = !rec.folded;
    for (let i = startLine; i < endLine; i++) {
      allRows[i].style.display = rec.folded ? "none" : "";
    }
    arrow.textContent = rec.folded ? "▶" : "▼";
  });
}

// Try to automatically detect the root element containing the code table
function findDomRoot() {
  const byId = document.querySelector('[id^="vis-"]');
  if (byId) return byId;

  const py = document.getElementById("pyCodeOutput");
  if (py) return py;

  const anyLineNo = document.querySelector("td.lineNo");
  if (anyLineNo) return anyLineNo.closest("table") || anyLineNo.closest("div");
  return null;
}


window.applyCodeFolding = function (domRoot, folds) {
  let rootEl = domRoot && (domRoot.jquery ? domRoot[0] : domRoot);
  rootEl = rootEl || findDomRoot();
  if (!rootEl) return;


  const raw = (Array.isArray(folds) && folds.length ? folds : (window.foldData || []));
  const list = raw.filter(
    it => it && Number.isFinite(it.start) && Number.isFinite(it.end) && it.end > it.start
  );

  const prev = window.foldedRanges || [];
  window.foldedRanges = [];

  list.forEach(({ start, end, folded }) => {
    const old = prev.find(r => r.start === start && r.end === end);
    const initial =
      (old && typeof old.folded === "boolean")
        ? old.folded
        : (typeof folded === "boolean" ? folded : false);

    addCodeFolding(rootEl, start, end, initial);
  });
};

// Export helper so other scripts can check if a line is hidden
window.isLineHidden = isLineHidden;