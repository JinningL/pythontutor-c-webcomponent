function getRoot(domRoot) {
  if (!domRoot) return null;
  const el = domRoot.jquery ? domRoot[0] : domRoot;
  if (el && !el.__foldedRanges && typeof el.closest === 'function') {
    return el.closest('[id^="vis-"]') || el;
  }
  return el;
}

// fallback root
function findDomRoot() {
  return document.querySelector('[id^="vis-"]') || null;
}

// per-instance store: [{start,end,folded}]
function rangesOf(rootEl) {
  if (!rootEl) return [];
  if (!Array.isArray(rootEl.__foldedRanges)) rootEl.__foldedRanges = [];
  return rootEl.__foldedRanges;
}

function isHiddenIn(rootEl, lineNumber) {
  const n = Number(lineNumber);
  if (!Number.isFinite(n)) return false;
  return rangesOf(rootEl).some(({ start, end, folded }) => folded && n > start && n <= end);
}

// add one folding control to this instance
function addCodeFolding(rootEl, startLine, endLine, initialFolded = true) {
  if (!rootEl) return;
  const rows = rootEl.querySelectorAll('tr');
  if (!rows || startLine < 1 || endLine > rows.length) return;

  const headRow = rows[startLine - 1];
  const lineNoTd = headRow.querySelector('td.lineNo') || headRow.children[0] || null;
  if (!lineNoTd) return;

  lineNoTd.querySelector('.toggle')?.remove(); 

  const arrow = document.createElement('span');
  arrow.className = 'toggle';
  arrow.textContent = initialFolded ? '▶' : '▼';
  Object.assign(arrow.style, { cursor: 'pointer', marginRight: '4px', userSelect: 'none' });
  lineNoTd.prepend(arrow);

  const rec = { start: startLine, end: endLine, folded: initialFolded };
  rangesOf(rootEl).push(rec);

  
  for (let j = startLine + 1; j <= endLine; j++) rows[j - 1].style.display = initialFolded ? 'none' : '';

  arrow.addEventListener('click', (e) => {
    e.stopPropagation();
    rec.folded = !rec.folded;
    for (let j = startLine + 1; j <= endLine; j++) rows[j - 1].style.display = rec.folded ? 'none' : '';
    arrow.textContent = rec.folded ? '▶' : '▼';
  });
}

// apply folds to one instance; keep previous open/closed states
window.applyCodeFolding = function (domRoot, folds) {
  let rootEl = getRoot(domRoot) || findDomRoot();
  if (!rootEl) return;

  const raw = Array.isArray(folds) && folds.length ? folds
            : (Array.isArray(rootEl.__folds) ? rootEl.__folds : []);

  const list = raw.filter(it => it && Number.isFinite(it.start) && Number.isFinite(it.end) && it.end > it.start);

  const prev = rangesOf(rootEl).slice();
  rootEl.__foldedRanges = [];

  list.forEach(({ start, end, folded }) => {
    const old = prev.find(r => r.start === start && r.end === end);
    const initial = (old && typeof old.folded === 'boolean') ? old.folded
                   : (typeof folded === 'boolean' ? folded : false);
    addCodeFolding(rootEl, start, end, initial);
  });
};

// check hidden for this instance
window.isLineHidden = function (domRootOrRootEl, lineNumber) {
  const rootEl = getRoot(domRootOrRootEl) || findDomRoot();
  if (!rootEl) return false;
  return isHiddenIn(rootEl, lineNumber);
};

// // debug helper
// window.dumpFolds = (root) => {
//   const r = getRoot(root) || findDomRoot(); if (!r) return;
//   console.log('[dumpFolds]', r.id, rangesOf(r));
// };