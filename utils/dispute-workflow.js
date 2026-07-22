/** 调解闭环：提交 → 受理 → 办理 → 办结 */

export const WORKFLOW_STEPS = ["提交", "受理", "办理", "办结"];

export const PHASE = {
  SUBMITTED: "submitted",
  ACCEPTED: "accepted",
  HANDLING: "handling",
  COMPLETED: "completed",
};

const PHASE_META = {
  [PHASE.SUBMITTED]: {
    step: 0,
    villagerTip: "已提交建档，村委会将尽快受理",
    adminLabel: "待受理",
    nextAdvance: "accept",
  },
  [PHASE.ACCEPTED]: {
    step: 1,
    villagerTip: "村调解员已接案，将联系双方核实情况",
    adminLabel: "已受理",
    nextAdvance: "handle",
  },
  [PHASE.HANDLING]: {
    step: 2,
    villagerTip: "调解办理中，请保持电话畅通配合核实",
    adminLabel: "办理中",
    nextAdvance: "complete",
  },
  [PHASE.COMPLETED]: {
    step: 3,
    villagerTip: "本案已办结，可在时间轴查看结案说明",
    adminLabel: "已办结",
    nextAdvance: null,
  },
};

export function normalizePhase(dispute) {
  if (!dispute) return PHASE.SUBMITTED;
  if (dispute.status === "completed" || dispute.phase === PHASE.COMPLETED)
    return PHASE.COMPLETED;
  if (dispute.phase && PHASE_META[dispute.phase]) return dispute.phase;
  const stages = dispute.stages || [];
  const titles = stages.map((s) => s.title || "").join("|");
  if (/办结|结案|已完成调解/.test(titles) && dispute.status === "completed")
    return PHASE.COMPLETED;
  if (/办理|调解中|现场核查|约谈/.test(titles)) return PHASE.HANDLING;
  if (/受理|接案|已接收/.test(titles)) return PHASE.ACCEPTED;
  return PHASE.SUBMITTED;
}

export function stepOfDispute(dispute) {
  return PHASE_META[normalizePhase(dispute)].step;
}

export function tipOfDispute(dispute) {
  const meta = PHASE_META[normalizePhase(dispute)];
  const days = dispute?.aiMeta?.estimatedDays;
  if (normalizePhase(dispute) === PHASE.SUBMITTED && days) {
    return `已建档 · 预计 ${days} 个工作日内受理联系`;
  }
  if (normalizePhase(dispute) === PHASE.HANDLING && days) {
    return `${meta.villagerTip} · 参考周期 ${days} 个工作日`;
  }
  return meta.villagerTip;
}

export function adminLabelOf(dispute) {
  return PHASE_META[normalizePhase(dispute)].adminLabel;
}

export function nextAdvanceOf(dispute) {
  return PHASE_META[normalizePhase(dispute)].nextAdvance;
}

export function adminAdvanceLabel(action) {
  const map = {
    accept: "受理接案（村民将看到：已接案）",
    handle: "进入办理（村民将看到：办理中）",
    complete: "确认办结（村民将看到：已办结）",
  };
  return map[action] || "推进";
}

/** 超期：待受理超过 N 天（演示默认 3 天） */
export function isOverdueDispute(dispute, days = 3) {
  if (!dispute || normalizePhase(dispute) === PHASE.COMPLETED) return false;
  const phase = normalizePhase(dispute);
  if (phase !== PHASE.SUBMITTED && phase !== PHASE.ACCEPTED) return false;
  const t = dispute.createTime || dispute.createdAt || 0;
  const ms = typeof t === "number" ? t : Date.parse(t) || 0;
  if (!ms) return false;
  return Date.now() - ms > days * 24 * 60 * 60 * 1000;
}

export function isHighRiskDispute(dispute) {
  if (!dispute) return false;
  const ai = dispute.aiMeta || {};
  return !!(ai.escalate || ai.riskLevel === "high");
}

/** 今日必办：待受理 / 超期 / 高风险未办结 */
export function isTodayMustDo(dispute) {
  if (!dispute || normalizePhase(dispute) === PHASE.COMPLETED) return false;
  return (
    normalizePhase(dispute) === PHASE.SUBMITTED ||
    isOverdueDispute(dispute) ||
    isHighRiskDispute(dispute)
  );
}

/** SLA 分：越高越先办（超期 > 高风险 > 待受理天数） */
export function slaScore(dispute) {
  if (!dispute || normalizePhase(dispute) === PHASE.COMPLETED) return -1;
  let s = 0;
  if (isOverdueDispute(dispute)) s += 100;
  if (isHighRiskDispute(dispute)) s += 50;
  if (normalizePhase(dispute) === PHASE.SUBMITTED) s += 20;
  const t = dispute.createTime || dispute.createdAt || 0;
  const ms = typeof t === "number" ? t : Date.parse(t) || 0;
  if (ms)
    s += Math.min(30, Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000)));
  return s;
}

/** Cloud / mock share templates for one-tap advance */
export const ADVANCE_TEMPLATES = {
  accept: {
    phase: PHASE.ACCEPTED,
    status: "processing",
    stageTitle: "已受理",
    stageContent: "村调解员已接案。将尽快联系双方核实情况，请保持电话畅通。",
    stageStatus: "processing",
  },
  handle: {
    phase: PHASE.HANDLING,
    status: "processing",
    stageTitle: "调解办理中",
    stageContent: "正在组织沟通与现场核查，调解员将持续更新进展。",
    stageStatus: "processing",
  },
  complete: {
    phase: PHASE.COMPLETED,
    status: "completed",
    stageTitle: "已办结",
    stageContent: "本案调解流程已办结。如有异议，可通过村务意见箱再次反映。",
    stageStatus: "done",
  },
};
