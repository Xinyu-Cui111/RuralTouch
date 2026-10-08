/**
 * 说事建档草稿（本地）
 * 兼容历史：storage 可能是纯字符串，也可能是对象。
 * evidencePaths：微信临时路径，同会话内可恢复；跨天可能失效。
 */

export const SUBMIT_DRAFT_KEY = "rt_submit_draft";

function asText(v) {
  return String(v == null ? "" : v).trim();
}

function asPaths(v) {
  if (!Array.isArray(v)) return [];
  return v
    .map((p) => String(p || "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

function asMaterials(v) {
  if (!Array.isArray(v)) return [];
  return v
    .map((m) => {
      if (!m) return null;
      if (typeof m === "string") return { text: asText(m), on: true };
      return { text: asText(m.text), on: m.on !== false };
    })
    .filter((m) => m && m.text)
    .slice(0, 12);
}

export function emptySubmitDraft() {
  return {
    content: "",
    title: "",
    step: 0,
    evidencePaths: [],
    materials: [],
    updatedAt: 0,
    source: "",
  };
}

export function readSubmitDraft() {
  try {
    const raw = uni.getStorageSync(SUBMIT_DRAFT_KEY);
    if (!raw) return emptySubmitDraft();
    if (typeof raw === "string") {
      return {
        content: asText(raw),
        title: "",
        step: 0,
        evidencePaths: [],
        materials: [],
        updatedAt: Date.now(),
        source: "legacy",
      };
    }
    if (typeof raw === "object") {
      return {
        content: asText(raw.content),
        title: asText(raw.title),
        step: Number(raw.step) === 1 ? 1 : 0,
        evidencePaths: asPaths(raw.evidencePaths),
        materials: asMaterials(raw.materials),
        updatedAt: Number(raw.updatedAt) || 0,
        source: asText(raw.source) || "local",
      };
    }
  } catch (e) {
    /* ignore */
  }
  return emptySubmitDraft();
}

export function writeSubmitDraft(partial = {}) {
  const prev = readSubmitDraft();
  const next = {
    content: partial.content != null ? asText(partial.content) : prev.content,
    title: partial.title != null ? asText(partial.title) : prev.title,
    step:
      partial.step != null ? (Number(partial.step) === 1 ? 1 : 0) : prev.step,
    evidencePaths:
      partial.evidencePaths != null
        ? asPaths(partial.evidencePaths)
        : prev.evidencePaths,
    materials:
      partial.materials != null
        ? asMaterials(partial.materials)
        : prev.materials || [],
    updatedAt: Date.now(),
    source:
      partial.source != null ? asText(partial.source) : prev.source || "local",
  };
  if (
    !next.content &&
    !next.title &&
    !next.evidencePaths.length &&
    !(next.materials && next.materials.length)
  ) {
    clearSubmitDraft();
    return null;
  }
  try {
    uni.setStorageSync(SUBMIT_DRAFT_KEY, next);
  } catch (e) {
    /* ignore */
  }
  return next;
}

/** 外部入口预填（法治要点 / AI 转建档）——仍写字符串亦可，read 会归一化 */
export function setSubmitDraftText(text, source = "prefill") {
  const content = asText(text);
  if (!content) {
    clearSubmitDraft();
    return;
  }
  writeSubmitDraft({ content, title: "", step: 0, evidencePaths: [], source });
}

export function clearSubmitDraft() {
  try {
    uni.removeStorageSync(SUBMIT_DRAFT_KEY);
  } catch (e) {
    /* ignore */
  }
}

export function draftPreviewText(max = 36) {
  const d = readSubmitDraft();
  const t = (d.content || d.title || "").replace(/\s+/g, " ").trim();
  if (!t) {
    if (d.evidencePaths && d.evidencePaths.length)
      return `草稿含文字说明（已不再保存图片）`;
    return "";
  }
  return t.length > max ? `${t.slice(0, max)}…` : t;
}
