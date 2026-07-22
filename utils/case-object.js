/** 办件物件同构：标题 / 阶段色 / 口语下一句 */

import {
  tipOfDispute,
  adminLabelOf,
  normalizePhase,
  PHASE,
} from "@/utils/dispute-workflow.js";
import { oralStatusLine } from "@/utils/case-timeline.js";

/** @returns {'say'|'handling'|'done'|'push'|'notice'|'urgent'} */
export function caseSemanticTone(dispute) {
  if (!dispute) return "say";
  const p = normalizePhase(dispute);
  if (p === PHASE.COMPLETED) return "done";
  if (dispute.aiMeta && dispute.aiMeta.escalate) return "urgent";
  if (p === PHASE.SUBMITTED || p === PHASE.ACCEPTED || p === PHASE.HANDLING)
    return "handling";
  return "say";
}

/** 阶段色 class：green | gold | blue | primary | muted */
export function casePhaseToneClass(dispute) {
  const t = caseSemanticTone(dispute);
  if (t === "done") return "done";
  if (t === "urgent") return "urgent";
  if (t === "handling") return "pending";
  return "pending";
}

export function caseTitleOf(dispute, fallback = "调解办件") {
  const t = dispute && String(dispute.title || "").trim();
  return t || fallback;
}

export function caseOralLine(dispute) {
  return oralStatusLine(dispute) || tipOfDispute(dispute) || "点此查看办理进度";
}

export function casePhaseLabel(dispute) {
  if (!dispute) return "";
  if (normalizePhase(dispute) === PHASE.COMPLETED) return "已办结";
  return adminLabelOf(dispute) || "办理中";
}

export function caseListMeta(dispute) {
  return (dispute && dispute.createTimeText) || "";
}

/** 首页/列表/详情共用的展示包 */
export function buildCaseObject(dispute) {
  if (!dispute) {
    return {
      title: "调解办件",
      oral: "点此查看",
      phaseLabel: "",
      phaseTone: "pending",
      semantic: "say",
      meta: "",
    };
  }
  return {
    id: dispute._id,
    title: caseTitleOf(dispute),
    oral: caseOralLine(dispute),
    phaseLabel: casePhaseLabel(dispute),
    phaseTone: casePhaseToneClass(dispute),
    semantic: caseSemanticTone(dispute),
    meta: caseListMeta(dispute),
    status: dispute.status,
  };
}
