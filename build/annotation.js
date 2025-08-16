// ------------- Load inline JSON annotation per instance -------------
window.loadInlineAnnotation = function (domRoot) {
  // domRoot might be a jQuery object; if so, take domRoot[0], otherwise fall back to document
  const rootEl = domRoot && domRoot[0] ? domRoot[0] : document;

  let notes = {};
  let folds = [];

  // Look for an inline <script type="application/json" data-kind="annotation"> inside this root
  const inlineEl = rootEl.querySelector('script[type="application/json"][data-kind="annotation"]');
  if (inlineEl) {
    try {
      // Parse the inline JSON
      const parsed = JSON.parse((inlineEl.textContent || "").trim());
      notes = parsed.annotation || {};
      folds = parsed.folds || [];
    } catch (e) {
      console.error("[annotation] Failed to parse inline JSON:", e);
    }
  }

  rootEl.__stepNotes = notes;
  rootEl.__folds = folds;

};

// ------------- Show tooltip note for a specific step/line -------------
window.showStepNote = function (stepIndex, lineNumber, domRoot) {
  // domRoot is the jQuery wrapper for the current instance
  const allCodeCells = domRoot.find("td.cod");

  // Clear any previous tooltips or observers to avoid memory leaks
  allCodeCells.each(function () {
    if (this._tippy) this._tippy.destroy();
    if (this.__io) { 
      try { this.__io.disconnect(); } catch (_) {}
      this.__io = null;
    }
  });

  // Find the target cell for this line number
  const targetTd = allCodeCells.get(lineNumber - 1);

  // Prefer the annotation map attached to this instance’s root element
  const rootEl = domRoot && domRoot[0] ? domRoot[0] : document;
  const notesMap = (rootEl && rootEl.__stepNotes) || window.stepNotes || {};
  const note = notesMap[String(lineNumber)] || notesMap[lineNumber];

  if (targetTd && note) {
    // Attach a tooltip to the target cell
    const tip = tippy(targetTd, {
      content: note,
      showOnCreate: true,
      placement: "right",
      theme: "light-border",
      trigger: "manual",
      hideOnClick: true,
      interactive: true,
      maxWidth: 250,
    });

    // Use IntersectionObserver: only show tooltip when the line is in the viewport
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) targetTd._tippy?.show();
          else targetTd._tippy?.hide();
        });
      },
      { threshold: 0.5 }
    );

    // Start observing the target cell
    io.observe(targetTd);
    // Save the observer on the element for later cleanup
    targetTd.__io = io;
  }
};