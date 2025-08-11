(function() {
    const base = "https://cdn.jsdelivr.net/gh/JinningL/pythontutor-c-webcomponent@main/build/";
  
    const cssFiles = [
      `${base}style.css`,
      "https://cdn.jsdelivr.net/npm/prismjs/themes/prism.css",
      "https://unpkg.com/tippy.js@6/dist/tippy.css"
    ];
    cssFiles.forEach(href => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
  
    const jsFiles = [
      "https://cdn.jsdelivr.net/npm/prismjs/prism.js",
      "https://cdn.jsdelivr.net/npm/prismjs/components/prism-c.js",
      "https://unpkg.com/@popperjs/core@2",
      "https://unpkg.com/tippy.js@6",
      `${base}annotation.js`,
      `${base}fold.js`,
      `${base}improved-visualize.js`,
      `${base}highlight.js`
    ];
    jsFiles.forEach(src => {
      const script = document.createElement("script");
      script.src = src;
      document.head.appendChild(script);
    });
  
    const esmScript = document.createElement("script");
    esmScript.type = "module";
    esmScript.src = `${base}visualizerComponent.js`;
    document.head.appendChild(esmScript);
  })();