(function () {
    // ---------- helpers ----------
    function loadCSS(href) {
      return new Promise((resolve, reject) => {
        const l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = href;
        l.onload = resolve;
        l.onerror = reject;
        document.head.appendChild(l);
      });
    }
  
    function loadJS(src) {
      return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
  
    function getQuery(name, url) {
      const u = url || location.href;
      const m = u.match(new RegExp("[?&]" + name + "=([^&]+)"));
      return m ? decodeURIComponent(m[1]) : null;
    }
  
    // ---------- resolve version ----------
    const selfScript = document.currentScript;
    const selfSrc = (selfScript && selfScript.src) || "";


    let ver = getQuery("ver", selfSrc);
  
    if (!ver && selfScript && selfScript.dataset.version) {
      ver = selfScript.dataset.version;
    }
  
    if (!ver) {
      const m = selfSrc.match(/@([^/]+)\//);
      ver = (m && m[1]) || "main";
    }
  
    const DEV = getQuery("dev") === "1";
    const cacheBust = DEV ? `&t=${Date.now()}` : "";
  
    const ROOT = `https://cdn.jsdelivr.net/gh/JinningL/pythontutor-c-webcomponent@${ver}/`;
    const BUILD = ROOT + "build/";
  
    Promise.all([
      loadCSS(`${BUILD}style.css?v=${ver}${cacheBust}`),
      loadCSS(`https://cdn.jsdelivr.net/npm/prismjs/themes/prism.css`),
      loadCSS(`https://unpkg.com/tippy.js@6/dist/tippy.css`)
    ])
    .catch(() => {}) 
    .then(async () => {

      await loadJS(`https://cdn.jsdelivr.net/npm/prismjs/prism.js`);
      await loadJS(`https://cdn.jsdelivr.net/npm/prismjs/components/prism-c.js`);
      await loadJS(`https://unpkg.com/@popperjs/core@2`);
      await loadJS(`https://unpkg.com/tippy.js@6`);
 
      await loadJS(`${BUILD}annotation.js?v=${ver}${cacheBust}`);
      await loadJS(`${BUILD}fold.js?v=${ver}${cacheBust}`);
      await loadJS(`${BUILD}improved-visualize.js?v=${ver}${cacheBust}`);
      await loadJS(`${BUILD}highlight.js?v=${ver}${cacheBust}`);
  
      await loadJS(`${BUILD}visualizerComponent_folder.js?v=${ver}${cacheBust}`);
    });
  })();