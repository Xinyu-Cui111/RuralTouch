/**
 * 色语义字典（V8-P1）
 * 红=主行动/催办 · 绿=进展 · 金=积分 · 蓝=法治 · 暖=高风险提示
 */

export const SEMANTIC = {
  primary: "ai", // 朱红系卡片条（催办/主路径）
  progress: "green",
  points: "gold",
  law: "blue",
  risk: "warm",
  neutral: "neutral",
};

/** 干部工单卡 tone */
export function adminTicketTone({ urged, overdue, highRisk } = {}) {
  if (urged || overdue) return SEMANTIC.primary;
  if (highRisk) return SEMANTIC.risk;
  return SEMANTIC.progress;
}

/** 办件列表卡 tone */
export function caseListTone(semantic) {
  if (semantic === "done") return SEMANTIC.neutral;
  if (semantic === "urgent") return SEMANTIC.primary;
  return SEMANTIC.progress;
}

/** empty-state 默认 icon-tone */
export function emptyTone(domain = "progress") {
  if (domain === "points" || domain === "moral") return "gold";
  if (domain === "law") return "blue";
  if (domain === "urge" || domain === "danger") return "primary";
  return "green";
}
