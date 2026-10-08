/**
 * 生成演示样例：txt / xlsx / png（供 OCR）
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const dir = path.join(__dirname, "../../docs/knowledge/samples");
fs.mkdirSync(dir, { recursive: true });

const invoice = `电子发票（普通发票）
发票号码：24312000000123456789
开票日期：2026年03月18日
购方名称：示范村股份经济合作社
销方名称：上海某某办公用品有限公司
项目名称：A4打印纸
价税合计：人民币 128.00 元
`;

const contract = `合同名称：村委便民服务耗材采购合同
甲方：示范村民委员会
乙方：上海某某办公用品有限公司
合同金额：人民币 5600.00
签订日期：2026年02月10日
履行期限：2026年02月10日至2026年12月31日
双方按约定供货与付款，争议先协商，协商不成可申请调解。
`;

fs.writeFileSync(path.join(dir, "invoice-demo.txt"), invoice, "utf8");
fs.writeFileSync(path.join(dir, "contract-demo.txt"), contract, "utf8");

const XLSX = require("xlsx");
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([
  ["字段", "值"],
  ["发票号码", "24312000000123456789"],
  ["开票日期", "2026年03月18日"],
  ["购方名称", "示范村股份经济合作社"],
  ["销方名称", "上海某某办公用品有限公司"],
  ["项目名称", "A4打印纸"],
  ["价税合计", "128.00"],
]);
XLSX.utils.book_append_sheet(wb, ws, "发票台账");
XLSX.writeFile(wb, path.join(dir, "invoice-ledger.xlsx"));

async function makePng() {
  const lines = invoice.trim().split("\n");
  const svgLines = lines
    .map(
      (line, i) =>
        `<text x="40" y="${
          60 + i * 36
        }" font-size="22" font-family="Microsoft YaHei, sans-serif" fill="#111">${line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")}</text>`
    )
    .join("");
  const svg = `<svg width="900" height="360" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#fff"/>
  ${svgLines}
</svg>`;
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(dir, "invoice-demo.png"));
  console.log("samples ready in", dir);
}

makePng().catch((e) => {
  console.error(e);
  process.exit(1);
});
