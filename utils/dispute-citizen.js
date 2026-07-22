/**
 * 办件公民动作：本地缓存 + 云端字段映射
 */

function keyOf(id) {
  return `rt_dispute_citizen_${id || ""}`;
}

export function emptyCitizen() {
  return {
    extraImages: [],
    extraEvidence: [],
    extraNote: "",
    rating: 0,
    ratingComment: "",
    ratedAt: 0,
    supplementedAt: 0,
    synced: false,
  };
}

export function readDisputeCitizen(id) {
  try {
    const raw = uni.getStorageSync(keyOf(id));
    if (raw && typeof raw === "object") {
      return {
        ...emptyCitizen(),
        extraImages: Array.isArray(raw.extraImages)
          ? raw.extraImages.slice(0, 6)
          : [],
        extraEvidence: Array.isArray(raw.extraEvidence)
          ? raw.extraEvidence.slice(0, 6)
          : [],
        extraNote: String(raw.extraNote || "").trim(),
        rating: Number(raw.rating) || 0,
        ratingComment: String(raw.ratingComment || "").trim(),
        ratedAt: Number(raw.ratedAt) || 0,
        supplementedAt: Number(raw.supplementedAt) || 0,
        synced: !!raw.synced,
      };
    }
  } catch (e) {
    /* ignore */
  }
  return emptyCitizen();
}

export function writeDisputeCitizen(id, partial = {}) {
  const prev = readDisputeCitizen(id);
  const next = {
    ...prev,
    ...partial,
    extraImages: Array.isArray(partial.extraImages)
      ? partial.extraImages.slice(0, 6)
      : prev.extraImages,
    extraEvidence: Array.isArray(partial.extraEvidence)
      ? partial.extraEvidence.slice(0, 6)
      : prev.extraEvidence,
    updatedAt: Date.now(),
  };
  try {
    uni.setStorageSync(keyOf(id), next);
  } catch (e) {
    /* ignore */
  }
  return next;
}

/** 从纠纷云文档映射公民态（优先云端） */
export function citizenFromDispute(dispute) {
  const base = emptyCitizen();
  if (!dispute) return base;
  const extra = dispute.citizenExtra || {};
  const rating = dispute.citizenRating || {};
  const evidence = Array.isArray(extra.evidence)
    ? extra.evidence.slice(0, 6)
    : [];
  const images = evidence.map((e) => e.url || e.mockUrl || "").filter(Boolean);
  return {
    ...base,
    extraImages: images,
    extraEvidence: evidence,
    extraNote: String(extra.note || "").trim(),
    rating: Number(rating.rating) || 0,
    ratingComment: String(rating.comment || "").trim(),
    ratedAt: Number(rating.ratedAt) || 0,
    supplementedAt: Number(extra.updatedAt) || 0,
    synced: !!(extra.updatedAt || rating.ratedAt),
  };
}

export function hasCitizenExtra(item) {
  const e = item && item.citizenExtra;
  if (!e) return false;
  return !!(String(e.note || "").trim() || (e.evidence && e.evidence.length));
}

export function citizenRatingStars(item) {
  const r = item && item.citizenRating;
  return r && r.rating ? Number(r.rating) : 0;
}
