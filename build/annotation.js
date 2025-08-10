// ------------- 只用内联 JSON，按实例加载 -------------
window.loadInlineAnnotation = function (domRoot) {
  // domRoot 是 jQuery 对象（你的代码里就是这样传的）
  const rootEl = domRoot && domRoot[0] ? domRoot[0] : document;

  let notes = {};
  let folds = [];

  const inlineEl = rootEl.querySelector('script[type="application/json"][data-kind="annotation"]');
  if (inlineEl) {
    try {
      const parsed = JSON.parse((inlineEl.textContent || "").trim());
      notes = parsed.annotation || {};
      folds = parsed.folds || [];
    } catch (e) {
      console.error("[annotation] 解析内联 JSON 失败：", e);
    }
  }

  // 把注释数据缓存到当前实例的根元素上，避免全局冲突
  rootEl.__stepNotes = notes;
  rootEl.__folds = folds;

};

// ------------- 显示某一步对应行的气泡说明 -------------
window.showStepNote = function (stepIndex, lineNumber, domRoot) {
  // domRoot: jQuery 根（实例作用域）
  const allCodeCells = domRoot.find("td.cod");

  // 清理旧的 tippy
  allCodeCells.each(function () {
    if (this._tippy) this._tippy.destroy();
    if (this.__io) { // 清理旧的 IntersectionObserver（防泄漏）
      try { this.__io.disconnect(); } catch (_) {}
      this.__io = null;
    }
  });

  const targetTd = allCodeCells.get(lineNumber - 1);

  // 优先用当前实例的注释表
  const rootEl = domRoot && domRoot[0] ? domRoot[0] : document;
  const notesMap = (rootEl && rootEl.__stepNotes) || window.stepNotes || {};
  const note = notesMap[String(lineNumber)] || notesMap[lineNumber];

  if (targetTd && note) {
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

    // 进入可视区域才显示，离开则隐藏
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) targetTd._tippy?.show();
          else targetTd._tippy?.hide();
        });
      },
      { threshold: 0.5 }
    );

    io.observe(targetTd);
    // 存起来，下一次切换步骤时清理
    targetTd.__io = io;
  }
};