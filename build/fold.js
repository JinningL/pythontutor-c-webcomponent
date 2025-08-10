// ===== fold.js（兼容 window.applyCodeFolding() 无参数调用） =====
window.foldedRanges = [];

function isLineHidden(lineNumber) {
  return window.foldedRanges.some(({ start, end, folded }) =>
    folded && lineNumber >= start && lineNumber <= end
  );
}

function addCodeFolding(domRoot, startLine, endLine, initialFolded = false) {
  const rootEl = domRoot && (domRoot.jquery ? domRoot[0] : domRoot);
  if (!rootEl) return;

  const allRows = rootEl.querySelectorAll("tr");
  if (startLine < 1 || endLine > allRows.length) return;

  const toggleRow = allRows[startLine - 1];
  // 如果你的行号列类名不是 lineNo，把下面这行改成你的类名，或保留 children[0] 兜底
  const lineNoTd = toggleRow.querySelector("td.lineNo") || toggleRow.children[0] || null;
  if (!lineNoTd) return;

  lineNoTd.querySelector(".toggle")?.remove();

  const arrow = document.createElement("span");
  arrow.className = "toggle";
  arrow.textContent = initialFolded ? "▶" : "▼";
  arrow.style.cursor = "pointer";
  arrow.style.marginRight = "4px";
  arrow.style.userSelect = "none";
  lineNoTd.prepend(arrow);

  const rec = { start: startLine, end: endLine, folded: initialFolded };
  window.foldedRanges.push(rec);

  for (let i = startLine; i < endLine; i++) {
    allRows[i].style.display = initialFolded ? "none" : "";
  }

  arrow.addEventListener("click", () => {
    rec.folded = !rec.folded;
    for (let i = startLine; i < endLine; i++) {
      allRows[i].style.display = rec.folded ? "none" : "";
    }
    arrow.textContent = rec.folded ? "▶" : "▼";
  });
}

// 自动寻找可视化根：优先常见容器，退而求其次找含 td.lineNo 的表格父节点
function findDomRoot() {
  // 你自己的容器 id，如 vis-...；如果没有，保留这些兜底即可
  const byId = document.querySelector('[id^="vis-"]');
  if (byId) return byId;

  const py = document.getElementById("pyCodeOutput"); // 兼容旧命名
  if (py) return py;

  const anyLineNo = document.querySelector("td.lineNo");
  if (anyLineNo) return anyLineNo.closest("table") || anyLineNo.closest("div");
  return null;
}

// 主入口：保持旧签名（无参也能跑）
window.applyCodeFolding = function (domRoot, folds) {
  const rootEl = domRoot && (domRoot.jquery ? domRoot[0] : domRoot) || findDomRoot();
  if (!rootEl) return;

  // 数据来源优先级：显式传入 > 全局 window.foldData > 空
  const raw = (Array.isArray(folds) && folds.length ? folds : (window.foldData || []));

  const list = raw.filter(
    it => it && Number.isFinite(it.start) && Number.isFinite(it.end) && it.end > it.start
  );

  const prev = window.foldedRanges || [];
  window.foldedRanges = [];

  list.forEach(({ start, end }) => {
    const old = prev.find(r => r.start === start && r.end === end);
    addCodeFolding(rootEl, start, end, old ? old.folded : false);
  });
};

window.isLineHidden = isLineHidden;