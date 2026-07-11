import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "outputs/019f4c86-6c83-72c2-aa81-59169262af3d";
const cropDir = "tmp/pdfs/盘口问题/crops";

const rows = [
  [1, "合约交易收益率设置过高，客户要求参照 aveiex.com/h5 的标准。", "对照参考平台逐个核对交易周期与收益率配置；将周期、收益率改为后台可配置项，并联调确认前端展示与结算逻辑使用同一套数值。"],
  [2, "合约交易按钮文案存在首字母小写或错误文案（如 Go long、short、longbuy）。", "统一英文文案为“Long / Short”，修正大小写和错误翻译；集中维护多语言词条，并检查按钮、订单方向和接口参数的映射。"],
  [3, "合约交易手续费过高，客户要求按参考平台标准设置。", "按参考平台核对手续费率、计费基数、单位和小数位；排查是否把百分比当整数或重复计费，统一前端预估与后端实际扣费规则。"],
  [4, "首页 Withdrawal、Deposit、Invite、Portfolio、Security 等按钮点击无反应。", "为各入口补齐点击事件和正确路由/页面；检查透明遮罩、禁用状态及登录拦截，完成移动端逐项点击回归。"],
  [5, "永续合约保证金计算不正确。", "核对保证金公式中的价格、数量、合约面值、杠杆倍数、保证金模式及币种精度；以前后端同一公式重算，并补充典型杠杆与边界值测试。"],
  [6, "AI 量化页面出现中文或乱码字符，英文界面语言不统一。", "替换为正确的英文多语言词条，检查字符编码和字体回退；扫描 AI 量化全部卡片、详情页及按钮，避免硬编码中文。"],
  [7, "不同 AI 量化产品显示相同 VIP 等级。", "核对产品与 VIP 门槛的配置映射，确保每款产品读取自身等级要求；修复缓存或默认值覆盖问题，并验证列表和详情一致。"],
  [8, "页面宣称有 7 款策略，但点击后只显示 3 款。", "核对策略接口返回数量、上架状态、地区/等级过滤和前端分页；使入口数量与实际可见策略一致，必要时同步修改宣传数量。"],
  [9, "流动性挖矿列表出现中文或乱码字符，且文字颜色对比度低、看不清。", "修正多语言词条与编码，移除硬编码中文；提高文字与背景对比度，检查暗色主题下的可读性和不同屏幕亮度。"],
  [10, "流动性挖矿产品期限过长。", "按业务确认及参考平台调整可选期限；将期限改为后台配置，并同步校验收益率、到期时间和订单展示，避免只改前端文案。"],
  [11, "主页的投资组合项目点击无反应。", "补齐项目卡片/按钮的点击事件与详情路由，扩大移动端有效点击区域；检查登录态、产品状态和跳转参数，逐条回归。"],
  [12, "选择交易币种时，除 BTC 和 ETH 外，其他币种只有 30 秒和 1 分钟选项。", "检查币种与交易周期的配置映射和接口过滤逻辑；按业务规则补齐其他币种的周期选项，并确保下单、结算和前端展示均支持。"],
  [13, "划转和兑换页面的常用币种没有排在前面。", "建立常用币种优先级配置，将高频币种置顶，其余按统一规则排序；划转与兑换共用同一排序逻辑，并保留搜索能力。"],
  [14, "点击指定位置会弹出警告弹窗。", "按截图路径复现并记录弹窗文案、控制台与接口响应；修复错误的校验条件、参数或接口异常，使正常操作不再误报，同时保留真正异常的提示。"],
  [15, "资产页面的币种/字母排序不正确。", "按币种代码进行不区分大小写的稳定排序，明确数字、主流币和其他资产的优先级；检查分页、搜索及余额筛选后排序仍一致。"],
  [16, "外汇价格不正确，整体偏高。", "核对行情源、买卖方向、币对换算、点差和精度；排查重复汇率换算或基准币错误，并与权威行情在同一时间点抽样比对。"],
  [17, "英文文案首字母大小写不统一，客户要求首字母大写。", "制定并应用统一的英文文案规范（按钮/标题首字母大写）；集中修正多语言词条并全站检索同类小写文案。"],
  [18, "交易周期只有 30 秒和 60 秒，选项不完整。", "核对交易周期配置及接口返回，按业务和参考平台补齐应有周期；验证不同币种、不同页面的周期列表和下单结算一致。"],
  [19, "税号文件中的 EIN 信息有错误。", "以公司正式税务文件或税务顾问确认的信息为唯一依据，更正 EIN 及相关主体信息；重新生成文件，并由合规/财务复核后替换线上版本。"],
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("客户问题整理");
sheet.showGridLines = false;
sheet.freezePanes.freezeRows(1);

sheet.getRange("A1:D1").values = [["编号", "问题", "处理方法", "截图"]];
sheet.getRange("A2:C20").values = rows;

sheet.getRange("A1:D1").format = {
  fill: "#17365D",
  font: { bold: true, color: "#FFFFFF", size: 12 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "outside", style: "medium", color: "#17365D" },
};
sheet.getRange("A2:D20").format = {
  font: { color: "#1F2937", size: 10 },
  verticalAlignment: "top",
  wrapText: true,
  borders: {
    insideHorizontal: { style: "thin", color: "#D9E2F3" },
    bottom: { style: "thin", color: "#D9E2F3" },
  },
};
sheet.getRange("A2:A20").format = {
  fill: "#EAF2F8",
  font: { bold: true, color: "#17365D" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
sheet.getRange("B2:B20").format.fill = "#F8FAFC";
sheet.getRange("C2:C20").format.fill = "#FFFFFF";
sheet.getRange("D2:D20").format.fill = "#F8FAFC";

sheet.getRange("A1:A20").format.columnWidthPx = 58;
sheet.getRange("B1:B20").format.columnWidthPx = 300;
sheet.getRange("C1:C20").format.columnWidthPx = 470;
sheet.getRange("D1:D20").format.columnWidthPx = 320;
sheet.getRange("1:1").format.rowHeightPx = 38;
sheet.getRange("2:20").format.rowHeightPx = 245;

for (let index = 0; index < rows.length; index += 1) {
  const imagePath = `${cropDir}/issue-${String(index + 1).padStart(2, "0")}.png`;
  const bytes = await fs.readFile(imagePath);
  const dataUrl = `data:image/png;base64,${bytes.toString("base64")}`;
  sheet.images.add({
    dataUrl,
    anchor: {
      from: { row: index + 1, col: 3, rowOffsetPx: 8, colOffsetPx: 8 },
      extent: { widthPx: 300, heightPx: 225 },
    },
  });
}

await fs.mkdir(outputDir, { recursive: true });

const inspect = await workbook.inspect({
  kind: "table",
  range: "客户问题整理!A1:D20",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 4,
  maxChars: 9000,
});
console.log(inspect.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: "客户问题整理",
  range: "A1:D20",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/preview.png`, new Uint8Array(await preview.arrayBuffer()));

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(`${outputDir}/盘口问题-客户问题整理.xlsx`);
console.log(`saved=${outputDir}/盘口问题-客户问题整理.xlsx`);
