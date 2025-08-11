(function () {

  const self = document.currentScript && document.currentScript.src;
  const m = self && self.match(/@([^/]+)\/loader\.js$/);
  const ver = (m && m[1]) || "main";

  const base = `https://cdn.jsdelivr.net/gh/JinningL/pythontutor-c-webcomponent@${ver}/build/`;

  const css = [
    `${base}style.css`,
    "https://cdn.jsdelivr.net/npm/prismjs/themes/prism.css",
    "https://unpkg.com/tippy.js@6/dist/tippy.css",
  ];
  css.forEach(href => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  });

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
  js.forEach(src => {
    const s = document.createElement("script");
    s.src = src;
    document.head.appendChild(s);
  });

  const esm = document.createElement("script");
  esm.type = "module";
  esm.src = `${base}visualizerComponent.js`;
  document.head.appendChild(esm);
})();