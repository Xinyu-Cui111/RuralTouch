const fs = require("fs");
let c = fs.readFileSync("README.md", "utf8");
if (c.includes("10-ai-lab.png")) {
  console.log("already");
  process.exit(0);
}
const imgs = `
### 能力台截图（可点开复现）

|              AI 能力台（现场检索）              |               单据结构化               |
| :---------------------------------------------: | :------------------------------------: |
| ![lab](docs/media/gallery/10-ai-lab.png) | ![doc](docs/media/gallery/11-doc-extract.png) |

`;
const needle =
  "说明文档：[DOC_AI.md](docs/DOC_AI.md) · [knowledge/](docs/knowledge/) · [DEMO.md](docs/DEMO.md)（含 JD 对齐旁白）";
if (!c.includes(needle)) {
  console.error("needle missing");
  process.exit(1);
}
c = c.replace(needle, needle + "\n" + imgs);
fs.writeFileSync("README.md", c);
console.log("ok");
