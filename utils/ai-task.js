/**
 * AI 协办任务条：统一结论 + 一个主下一步 + 次要动作
 */
import { COPY, sourceLabelOf } from "@/utils/copy-voice.js";

export function buildTaskFromInsight(insight = {}, ctx = {}) {
  const conclusion =
    insight.summary ||
    insight.mediationAdvice ||
    insight.conclusion ||
    "已整理要点，请确认后提交村委办理";
  const basis = [];
  if (insight.categoryLabel) basis.push(`类型：${insight.categoryLabel}`);
  (insight.legalRefs || []).slice(0, 3).forEach((r) => basis.push(r));
  (insight.steps || []).slice(0, 2).forEach((s) => basis.push(s));
  (insight.materials || []).slice(0, 2).forEach((m) => {
    const t = typeof m === "string" ? m : m && m.text;
    if (t) basis.push(`材料：${t}`);
  });

  const primary = ctx.primary || {
    key: "submit",
    label: COPY.goSubmit || "去说事建档",
    primary: true,
  };
  const secondary = (
    ctx.secondary || [
      { key: "law", label: "看法条" },
      { key: "call", label: COPY.callVillage },
    ]
  ).filter((a) => a && a.key !== primary.key);

  return {
    brand: COPY.brandHelper,
    conclusion,
    basis: basis.slice(0, 5),
    riskLabel: insight.riskLabel || (insight.escalate ? "高" : ""),
    riskLevel: insight.riskLevel || (insight.escalate ? "high" : ""),
    source: insight.source || "",
    sourceLabel: insight.sourceLabel || sourceLabelOf(insight.source),
    progressHint: insight.escalate
      ? "建议尽快联系村委或报警"
      : insight.estimatedDays
      ? `参考周期约 ${insight.estimatedDays} 个工作日`
      : "确认后由村委受理办理",
    primary,
    secondary: secondary.slice(0, 2),
    disclaimer: COPY.aiDisclaimer,
  };
}

export function buildTaskFromChat(data = {}, kind = "village") {
  const conclusion =
    data.conclusion ||
    firstSentence(data.reply) ||
    data.reply ||
    "请继续说明情况";
  const basis = (
    data.basis && data.basis.length ? data.basis : data.citations || []
  )
    .filter(Boolean)
    .slice(0, 5);

  const ctas = data.triadActions || data.ctas || [];
  const primary = ctas.find((c) => c.primary) ||
    ctas[0] || { key: "submit", label: COPY.goSubmit, primary: true };
  const secondary = ctas.filter((c) => c.key !== primary.key).slice(0, 2);

  return {
    brand: COPY.brandHelper,
    conclusion,
    basis,
    riskLabel: data.riskLabel || (data.escalate ? "高" : ""),
    riskLevel: data.riskLevel || (data.escalate ? "high" : ""),
    source: data.source || "",
    sourceLabel: data.sourceLabel || sourceLabelOf(data.source),
    progressHint: data.escalate
      ? "如有人身安全风险请先拨打 110 / 120"
      : "可一键去建档，由村委正式办理",
    primary: { ...primary, primary: true },
    secondary,
    disclaimer: COPY.aiDisclaimer,
    kind,
  };
}

export function buildTaskFromDispute(dispute) {
  const ai = (dispute && dispute.aiMeta) || {};
  const status =
    dispute && dispute.status === "completed" ? "completed" : "processing";
  const primary =
    status === "completed"
      ? { key: "rate", label: "去评价 / 看积分", primary: true }
      : { key: "supplement", label: "补材料", primary: true };
  return buildTaskFromInsight(ai, {
    primary,
    secondary: [
      { key: "ai", label: "问助手" },
      { key: "call", label: COPY.callVillage },
    ],
  });
}

function firstSentence(text) {
  const t = String(text || "").trim();
  if (!t) return "";
  const m = t.match(/^[\s\S]{8,80}?[。！？\n]/);
  return (m ? m[0] : t.slice(0, 72)).trim();
}
