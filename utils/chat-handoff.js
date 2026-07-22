/**
 * 聊天回流办事：多行动按钮（去建档 / 看法条 / 联系村委），少气泡墙。
 */
export function normalizeChatPayload(data = {}, kind = "village") {
  const defaults = [
    {
      key: "submit",
      label: "去说事建档",
      path: "/pages/village/submit",
      primary: true,
    },
    { key: "law", label: "看法条要点", path: "/pages/law/law", primary: false },
    { key: "call", label: "联系村委", path: "", primary: false },
  ];

  const fromApi = Array.isArray(data.ctas)
    ? data.ctas
        .filter((c) => c && c.key && c.label)
        .map((c) => ({
          key: c.key,
          label: c.label,
          path: c.path || "",
          primary: !!c.primary,
        }))
    : [];

  const merged = [];
  const seen = new Set();
  const push = (c) => {
    if (!c || !c.key || seen.has(c.key)) return;
    seen.add(c.key);
    merged.push(c);
  };

  // 保留接口主 CTA，其余用默认补齐到最多 3 个
  fromApi.filter((c) => c.primary).forEach(push);
  fromApi.filter((c) => !c.primary).forEach(push);
  defaults.forEach(push);

  if (!merged.some((c) => c.primary) && merged.length) merged[0].primary = true;

  const reply = data.reply || "";
  const basis =
    Array.isArray(data.basis) && data.basis.length
      ? data.basis.filter(Boolean).slice(0, 5)
      : (data.citations || []).filter(Boolean).slice(0, 5);
  const conclusion = asText(data.conclusion) || firstSentence(reply);

  return {
    reply,
    suggestions: data.suggestions || [],
    citations: data.citations || [],
    sourceLabel: data.sourceLabel || "",
    source: data.source || "",
    escalate: !!data.escalate,
    handoff: data.handoff || null,
    productHint: "",
    ctas: merged.slice(0, 3),
    // AI 三卡协议
    conclusion,
    basis,
    riskLabel: data.riskLabel || (data.escalate ? "高" : ""),
    riskLevel: data.riskLevel || (data.escalate ? "high" : ""),
    triadActions: merged.slice(0, 3).map((c) => ({
      key: c.key,
      label: c.label,
      path: c.path || "",
      primary: !!c.primary,
    })),
  };
}

function asText(v) {
  return String(v == null ? "" : v).trim();
}

function firstSentence(text) {
  const t = asText(text);
  if (!t) return "";
  const m = t.match(/^[\s\S]{8,80}?[。！？\n]/);
  return (m ? m[0] : t.slice(0, 72)).trim();
}

export function lastUserText(messages = []) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user" && messages[i].content)
      return String(messages[i].content).trim();
  }
  return "";
}

export function userMessageCount(messages = []) {
  return messages.filter((m) => m.role === "user").length;
}
