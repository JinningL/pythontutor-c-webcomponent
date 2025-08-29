// Only show annotation when both conditions are met:
// (1) The line is the one that has just executed
// (2) The line is not folded/hidden
window.showStepNote = function (_stepIndex, lineNumber, domRoot) {
  // Resolve root container ---
  let rootEl = domRoot && domRoot.jquery ? domRoot[0] : domRoot;
  if (!rootEl || !rootEl.__stepNotes) {
    const start = (rootEl && rootEl.nodeType === 1) ? rootEl : document.body;
    rootEl = (start.closest?.('[id^="vis-"]') || start.closest?.('[data-viz-root]')) || rootEl;
  }

  // Load annotation map ---
  const notesMap = (rootEl && rootEl.__stepNotes) || null;
  if (!notesMap) return;

  // Get ExecutionVisualizer instance to find the "just executed" line ---
  const viz = rootEl.__viz || window.__viz || window.myViz || null;
  const executedStep = viz ? Math.max(0, (viz.curInstr | 0) - 1) : null;
  const executedLine = (executedStep != null && viz?.curTrace) ? viz.curTrace[executedStep]?.line : undefined;

  // Find code cells and the target cell for this line ---
  let $scope = domRoot && domRoot.find ? domRoot : null;
  if (!$scope || !$scope.length) {
    try { $scope = window.$ ? $(rootEl) : null; } catch { $scope = null; }
  }
  const allCodeCells = $scope ? $scope.find('td.cod').toArray()
                              : (rootEl?.querySelectorAll ? Array.from(rootEl.querySelectorAll('td.cod')) : []);
  const targetTd = allCodeCells.length ? allCodeCells[lineNumber - 1] : null;

  const clearAll = () => {
    allCodeCells.forEach(td => {
      try { td._tippy && td._tippy.destroy(); } catch {}
      try { td.__io && td.__io.disconnect(); td.__io = null; } catch {}
    });
  };

  // Condition A: must be the just executed line
  if (lineNumber !== executedLine) { clearAll(); return; }

  // Condition B: must not be folded/hidden (check both DOM and folding logic)
  const tr = targetTd?.closest?.('tr');
  const domHidden = !targetTd ||
                    getComputedStyle(targetTd).display === 'none' ||
                    (tr && getComputedStyle(tr).display === 'none');

  const foldedHidden =
    (typeof window.isLineHidden === 'function') ? !!window.isLineHidden(rootEl, lineNumber) : false;

  if (domHidden || foldedHidden) { clearAll(); return; }

  // Get annotation for this line ---
  const note = notesMap[String(lineNumber)] ?? notesMap[lineNumber];
  if (!note) { clearAll(); return; }

  // Clear everything before creating a new tooltip ---
  clearAll();

  // Show tooltip (only while line is visible in viewport) ---
  if (typeof window.tippy === 'function' && targetTd) {
    window.tippy(targetTd, {
      content: note,
      showOnCreate: true,
      placement: 'right',
      theme: 'light-border',
      trigger: 'manual',
      hideOnClick: true,
      interactive: true,
      maxWidth: 260
    });

    // Automatically hide when the line scrolls out of view
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => e.isIntersecting ? targetTd._tippy?.show() : targetTd._tippy?.hide());
      },
      { threshold: 0.5 }
    );
    io.observe(targetTd);
    targetTd.__io = io;
  }
};