(function () {
  function loadCSS(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  function loadJS(src, type) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      if (type) script.type = type;
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const self = document.currentScript && document.currentScript.src;
  const m = self && self.match(/@([^/]+)\/loader\.js$/);
  const ver = (m && m[1]) || "main";

  const base = `https://cdn.jsdelivr.net/gh/JinningL/pythontutor-c-webcomponent@${ver}/build/`;

  const css = [
    `${base}style.css`,
    "https://cdn.jsdelivr.net/npm/prismjs/themes/prism.css",
    "https://unpkg.com/tippy.js@6/dist/tippy.css",
  ];

  const js = [
    "https://cdn.jsdelivr.net/npm/prismjs/prism.js",
    "https://cdn.jsdelivr.net/npm/prismjs/components/prism-c.js",
    "https://unpkg.com/@popperjs/core@2",
    "https://unpkg.com/tippy.js@6",
    `${base}annotation.js`,
    `${base}fold.js`,
    `${base}improved-visualize.js`,
    `${base}highlight.js`,
  ];

  Promise.all(css.map(loadCSS))
    .catch(() => {})
    .then(async () => {
      for (const src of js) {
        await loadJS(src);
      }
      await loadJS(`${base}visualizerComponent.js`, "module");
    });
})();
