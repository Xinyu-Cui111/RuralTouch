const {
  analyzeDispute,
  chatReply,
  detectEscalation,
  detectRefuseJudgment,
} = require("./ai-engine");
const { chatCompletion, extractJson } = require("./llm");
const {
  retrieveFaq,
  formatFaqContext,
  citationsFromHits,
  buildFaqReply,
} = require("./knowledge");

const DISPUTE_SCHEMA = `请严格返回 JSON，不要 markdown：
{
  "suggestedTitle": "string",
  "category": "land|labor|neighbor|property|family|other",
  "categoryLabel": "string",
  "riskLevel": "low|medium|high",
  "riskLabel": "较低|中等|较高",
  "summary": "string",
  "steps": ["string"],
  "legalRefs": ["string"],
  "mediationAdvice": "string",
  "estimatedDays": "string",
  "escalate": false
}`;

const VILLAGE_SCOPE =
  "你只回答：纠纷调解流程、积分申报与兑换、村务通知、本案进度指引。不回答点餐、娱乐、写判决书、投资理财等无关问题；无关时用一句话拒绝并引导去「提交纠纷」或问调解/积分/通知。";

const LEGAL_SCOPE =
  "你只做农村普法参考（土地、邻里、劳务、家庭、反诈等）。不预判输赢、不代写判决/起诉状、不编造具体法条号。结尾提醒可申请村委调解或咨询律师。";

function enrichSafety(data, text) {
  const escalate = !!(data && data.escalate) || detectEscalation(text);
  const refuseLegalJudgment = detectRefuseJudgment(text);
  let riskLevel = (data && data.riskLevel) || "low";
  if (escalate) riskLevel = "high";
  const riskMap = { low: "较低", medium: "中等", high: "较高" };
  return {
    ...data,
    riskLevel,
    riskLabel: (data && data.riskLabel) || riskMap[riskLevel],
    escalate,
    escalateHint: escalate ? "已识别高风险情形，建议转人工优先处理" : "",
    refuseLegalJudgment,
    handoff: escalate
      ? {
          type: "urgent",
          label: "转村委 / 报警",
          channels: ["村委会", "110", "120"],
        }
      : { type: "routine", label: "可继续 AI 建档", channels: ["村委会调解"] },
    mediationAdvice: escalate
      ? "现场可能存在人身安全风险：请立即联系村委会或调解员；若正在冲突或有人受伤，请先拨打 110/120，再补建档。"
      : (data && data.mediationAdvice) || "",
  };
}

function sourceLabel(source) {
  if (source === "llm") return "大模型";
  if (source === "rule") return "规则引擎";
  if (source === "rule_fallback") return "规则降级";
  if (source === "rag") return "知识检索";
  if (source === "rag_llm") return "检索+大模型";
  if (source === "cache") return "短缓存";
  return source || "未知";
}

function withMeta(data, source) {
  return {
    ...data,
    source,
    sourceLabel: sourceLabel(source),
  };
}

/** 聊天统一挂载办事回流 CTA，避免「只会聊不会办」 */
function withChatActions(data, kind = "village") {
  const villageCtas = [
    {
      key: "submit",
      label: "去说事建档",
      path: "/pages/village/submit",
      primary: true,
    },
    { key: "feedback", label: "意见箱", path: "/pages/village/feedback" },
    { key: "records", label: "看调解进度", path: "/pages/village/records" },
  ];
  const legalCtas = [
    {
      key: "submit",
      label: "去说事建档",
      path: "/pages/village/submit",
      primary: true,
    },
    { key: "feedback", label: "意见箱", path: "/pages/village/feedback" },
  ];
  return {
    ...data,
    ctas:
      Array.isArray(data.ctas) && data.ctas.length
        ? data.ctas
        : kind === "legal"
        ? legalCtas
        : villageCtas,
    productHint:
      data.productHint ||
      (kind === "legal"
        ? "指尖善治 · 普法顾问（非通用聊天）"
        : "指尖善治 · 村务助手（非通用聊天）"),
  };
}

function isOutOfVillageScope(text) {
  const off = [
    "点外卖",
    "写小说",
    "讲笑话",
    "股票",
    "基金",
    "恋爱",
    "游戏攻略",
    "帮我写代码",
  ];
  return off.some((k) => text.includes(k));
}

async function assistDispute({ content = "", title = "" }) {
  const text = `${title} ${content}`.trim();
  if (!text) return { ok: false, message: "请先描述纠纷情况" };

  const faqHits = retrieveFaq(text, { topK: 2, minScore: 2 });
  const faqCtx = formatFaqContext(faqHits);

  const llm = await chatCompletion(
    [
      {
        role: "system",
        content: `你是基层村务纠纷调解 AI 助手，服务中国农村村民。输出简洁、务实、可执行。若描述含打架/动手/威胁/受伤等，escalate 必须为 true 且 riskLevel 为 high。可参考下列知识，勿编造法条号。${
          faqCtx ? `\n\n知识参考：\n${faqCtx}` : ""
        }\n${DISPUTE_SCHEMA}`,
      },
      {
        role: "user",
        content: `纠纷标题：${
          title || "（未填）"
        }\n纠纷描述：${content}\n请分析并返回 JSON。`,
      },
    ],
    { jsonMode: true, maxTokens: 900 }
  );

  if (llm.ok) {
    const parsed = extractJson(llm.content);
    if (parsed && parsed.suggestedTitle) {
      const safe = enrichSafety(parsed, text);
      if (faqHits.length && (!safe.legalRefs || !safe.legalRefs.length)) {
        safe.legalRefs = faqHits[0].refs || safe.legalRefs;
      }
      return {
        ok: true,
        data: withMeta(
          {
            ...safe,
            citations: citationsFromHits(faqHits),
            faqIds: faqHits.map((h) => h.id),
          },
          faqHits.length ? "rag_llm" : "llm"
        ),
      };
    }
  }

  const fallback = analyzeDispute({ content, title });
  if (!fallback.ok) return fallback;
  const data = {
    ...fallback.data,
    citations: citationsFromHits(faqHits),
    faqIds: faqHits.map((h) => h.id),
  };
  if (faqHits.length && (!data.legalRefs || !data.legalRefs.length)) {
    data.legalRefs = faqHits[0].refs || [];
  }
  return {
    ok: true,
    data: withMeta(
      {
        ...data,
        llmError: llm.message || null,
      },
      llm.reason === "no_key"
        ? faqHits.length
          ? "rag"
          : "rule"
        : "rule_fallback"
    ),
  };
}

async function villageChat({
  message = "",
  history = [],
  disputeContext = null,
}) {
  const text = message.trim();
  if (!text) return { ok: false, message: "请输入问题" };

  if (detectRefuseJudgment(text) || detectEscalation(text)) {
    const r = chatReply({ message, history });
    if (r.ok)
      r.data = withChatActions(
        withMeta(r.data, r.data.source || "rule"),
        "village"
      );
    return r;
  }

  if (isOutOfVillageScope(text)) {
    return {
      ok: true,
      data: withChatActions(
        withMeta(
          {
            reply:
              "我主要帮您处理村务与调解相关问题。您可以问：如何提交纠纷、调解进度、积分申报、村务通知。需要建档请点下方「去说事建档」。",
            suggestions: ["如何提交纠纷？", "积分怎么申报？", "调解要多久？"],
            refuseOutOfScope: true,
          },
          "rule"
        ),
        "village"
      ),
    };
  }

  const faqHits = retrieveFaq(text, { topK: 3, minScore: 2 });
  const faqCtx = formatFaqContext(faqHits);
  let caseCtx = "";
  if (disputeContext && typeof disputeContext === "object") {
    const bits = [
      disputeContext.id ? `编号=${disputeContext.id}` : "",
      disputeContext.title ? `标题=${disputeContext.title}` : "",
      `阶段=${disputeContext.phase || disputeContext.status || ""}`,
      disputeContext.category ? `类型=${disputeContext.category}` : "",
      disputeContext.riskLevel ? `风险=${disputeContext.riskLevel}` : "",
      `摘要=${(disputeContext.summary || "").slice(0, 160)}`,
    ].filter(Boolean);
    caseCtx = `\n当前案件上下文：${bits.join(
      "；"
    )}。请结合本案阶段给出下一步建议，不要编造未提供的事实。`;
  }

  const messages = [
    {
      role: "system",
      content: `${VILLAGE_SCOPE}回答简洁 100-200 字。不要编造电话地址。不要预判诉讼输赢。遇人身安全优先提醒报警/村委。${
        faqCtx ? `\n\n可引用知识：\n${faqCtx}` : ""
      }${caseCtx}`,
    },
    ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: text },
  ];

  const llm = await chatCompletion(messages, { maxTokens: 500 });
  if (llm.ok && llm.content) {
    return {
      ok: true,
      data: withChatActions(
        withMeta(
          {
            reply: llm.content,
            suggestions: ["如何提交纠纷？", "积分怎么申报？", "调解要多久？"],
            citations: citationsFromHits(faqHits),
            provider: llm.provider,
          },
          faqHits.length ? "rag_llm" : "llm"
        ),
        "village"
      ),
    };
  }

  if (faqHits.length) {
    return {
      ok: true,
      data: withChatActions(
        withMeta(
          {
            reply: buildFaqReply(faqHits),
            suggestions: ["如何提交纠纷？", "调解要多久？"],
            citations: citationsFromHits(faqHits),
          },
          "rag"
        ),
        "village"
      ),
    };
  }

  const fallback = chatReply({ message, history });
  if (!fallback.ok) return fallback;
  return {
    ok: true,
    data: withChatActions(
      withMeta(
        { ...fallback.data },
        llm.reason === "no_key" ? "rule" : "rule_fallback"
      ),
      "village"
    ),
  };
}

async function legalChat({ message = "", history = [] }) {
  const text = message.trim();
  if (!text) return { ok: false, message: "请输入法律问题" };

  if (detectRefuseJudgment(text)) {
    return {
      ok: true,
      data: withChatActions(
        withMeta(
          {
            reply:
              "普法助手不能预判案件输赢，也不能代写判决文书。您可以：1）申请村委调解建档；2）咨询专业律师；3）查看普法要点。本回答仅供参考，不构成法律意见。",
            suggestions: ["土地边界争议怎么办？", "如何提交纠纷？"],
            refuseLegalJudgment: true,
            handoff: {
              type: "legal",
              label: "转村委调解 / 律师",
              channels: ["村委会", "专业律师"],
            },
          },
          "rule"
        ),
        "legal"
      ),
    };
  }

  if (detectEscalation(text)) {
    return {
      ok: true,
      data: withChatActions(
        withMeta(
          {
            reply:
              "若正在发生暴力冲突或有人受伤，请先拨打 110/120，并联系村委会。线上咨询不能替代紧急处置；安全后可再提交调解建档。",
            suggestions: ["如何提交纠纷？", "邻里纠纷如何处理？"],
            escalate: true,
            escalateHint: "建议转人工优先处理",
            handoff: {
              type: "urgent",
              label: "转村委 / 报警",
              channels: ["村委会", "110", "120"],
            },
          },
          "rule"
        ),
        "legal"
      ),
    };
  }

  const faqHits = retrieveFaq(text, { topK: 3, minScore: 2 });
  const faqCtx = formatFaqContext(faqHits);

  const messages = [
    {
      role: "system",
      content: `${LEGAL_SCOPE}\n若提供了参考知识，请优先依据其表述，并在回答中点明参考了哪条要点。${
        faqCtx ? `\n\n参考知识：\n${faqCtx}` : ""
      }`,
    },
    ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: text },
  ];

  const llm = await chatCompletion(messages, { maxTokens: 600 });
  if (llm.ok && llm.content) {
    return {
      ok: true,
      data: withChatActions(
        withMeta(
          {
            reply: llm.content,
            suggestions: [
              "土地边界争议怎么办？",
              "邻居噪音如何维权？",
              "如何防范电信诈骗？",
            ],
            citations: citationsFromHits(faqHits),
            provider: llm.provider,
          },
          faqHits.length ? "rag_llm" : "llm"
        ),
        "legal"
      ),
    };
  }

  if (faqHits.length) {
    return {
      ok: true,
      data: withChatActions(
        withMeta(
          {
            reply: buildFaqReply(faqHits),
            suggestions: ["如何提交纠纷？", "邻居噪音如何维权？"],
            citations: citationsFromHits(faqHits),
          },
          "rag"
        ),
        "legal"
      ),
    };
  }

  return {
    ok: true,
    data: withChatActions(
      withMeta(
        {
          reply:
            "暂时无法生成答复。您可以：1）到村委会咨询；2）点下方「去说事建档」申请调解；3）换个具体问题再试（如土地边界、欠薪、噪音）。",
          suggestions: ["如何提交纠纷？", "土地边界争议怎么办？"],
        },
        "fallback"
      ),
      "legal"
    ),
  };
}

module.exports = { assistDispute, villageChat, legalChat, sourceLabel };
