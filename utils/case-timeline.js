/**
 * 办件时效与口语节点（村民可读）
 */
import {
  normalizePhase,
  PHASE,
  adminLabelOf,
  tipOfDispute,
} from "@/utils/dispute-workflow.js";

const ETA = {
  [PHASE.SUBMITTED]: "预计 1～2 个工作日内受理",
  [PHASE.ACCEPTED]: "预计 2 日内联系双方核实",
  [PHASE.HANDLING]: "办理中，请保持电话畅通",
  [PHASE.COMPLETED]: "已办结",
};

export function etaOfDispute(dispute) {
  const phase = normalizePhase(dispute);
  const days = dispute && dispute.aiMeta && dispute.aiMeta.estimatedDays;
  if (phase === PHASE.SUBMITTED && days)
    return `预计 ${days} 个工作日内受理联系`;
  if (phase === PHASE.HANDLING && days)
    return `参考办理周期约 ${days} 个工作日`;
  return ETA[phase] || tipOfDispute(dispute);
}

export function oralStatusLine(dispute) {
  if (!dispute) return "暂无办件";
  const label = adminLabelOf(dispute);
  const eta = etaOfDispute(dispute);
  return `${label} · ${eta}`;
}

/** 推进后写入村民通知的口语正文 */
export function advanceNoticeMessage(advanceKey, note, nextContact) {
  const map = {
    accept: "调解员已接案。将尽快联系双方核实情况。",
    handle: "已进入办理。请保持电话畅通，配合现场或约谈核实。",
    complete: "本案已办结。可评价本次调解，并查看激励积分。",
  };
  const parts = [map[advanceKey] || "办件状态已更新。"];
  if (nextContact && nextContact.when) {
    parts.push(
      `下次沟通：${nextContact.when}${
        nextContact.how ? `（${nextContact.how}）` : ""
      }`
    );
  } else if (advanceKey === "accept") {
    parts.push(ETA[PHASE.ACCEPTED]);
  } else if (advanceKey === "handle") {
    parts.push(ETA[PHASE.HANDLING]);
  }
  if (note) parts.push(`说明：${note}`);
  return parts.filter(Boolean).join("\n");
}

export function daysSinceCreate(dispute) {
  const t = (dispute && (dispute.createTime || dispute.createdAt)) || 0;
  const ms = typeof t === "number" ? t : Date.parse(t) || 0;
  if (!ms) return 0;
  return Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000));
}
