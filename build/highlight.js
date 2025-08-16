const style = document.createElement("style");
style.textContent = `

     td.cod {
    font-family: Menlo, monospace;
    font-size: 11pt;
    background-color: #ffffff;
    border-radius: 4px;
    white-space: nowrap;
  }
  `;

document.head.appendChild(style);

// Wait until DOM and visualize rendering are finished
function highlightCode() {
  const interval = setInterval(() => {
    // console.log("Highlight script running");
    // Select all elements with class "td.cod" rendered by visualize.js
    const codeCells = document.querySelectorAll("td.cod");
    if (codeCells.length > 0) {
      codeCells.forEach((cell) => {
        const raw = cell.innerText;
        //console.log("Raw content:\n-----\n" + raw + "\n-----");
        const highlighted = Prism.highlight(raw, Prism.languages.c, "c");
        const final = highlighted.replace(/^(\s+)/, (m) =>
          "&nbsp;".repeat(m.length)
        );

        cell.innerHTML = final;
      });
      clearInterval(interval);
    }
  }, 100);
}

window.addEventListener("load", highlightCode);

function highlightExecutedLine(lineNumber) {
  const codeCells = document.querySelectorAll("td.cod");

  // Clear all previous highlights
  codeCells.forEach((cell) => {
    cell.classList.remove("executed-highlight");
  });
  // codeCells.forEach((cell) => {
  //   cell.classList.remove("next-highlight");
  // });

  // Highlight the target line (note: lineNumber starts from 1, DOM index starts from 0)
  const target = codeCells[lineNumber - 1];
  if (target) {
    target.classList.add("executed-highlight");
  }

  // for (let i = lineNumber; i < codeCells.length; i++) {
  //   const content = codeCells[i].innerText.trim();
  //   if (content.length > 0) {
  //     codeCells[i].classList.add("next-highlight");
  //     break;
  //   }
  // }
}

style.textContent += `
  .executed-highlight {
    background-color: #fffbd0 !important; 
    transition: background-color 0.2s;
  }
  .next-highlight {
    background-color:rgb(255, 255, 255)  !important;
    transition: background-color 0.2s;
  }
`;
