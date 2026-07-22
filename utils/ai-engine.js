const RULES = [
  {
    id: "land",
    label: "土地边界",
    keywords: [
      "土地",
      "边界",
      "确权",
      "宅基地",
      "耕地",
      "田埂",
      "占地",
      "承包",
    ],
    risk: "medium",
    legalRefs: ["《土地管理法》", "《农村土地承包法》"],
    steps: [
      "核对土地确权证与现场界桩",
      "邀请双方到场指界",
      "组织村民代表见证调解",
      "形成书面调解协议",
    ],
  },
  {
    id: "labor",
    label: "劳动纠纷",
    keywords: ["工资", "劳务", "务工", "欠薪", "工伤", "雇佣", "报酬"],
    risk: "medium",
    legalRefs: ["《劳动法》", "《民法典》合同编"],
    steps: [
      "收集劳动合同或务工凭证",
      "核实工时与约定报酬",
      "组织双方协商",
      "必要时建议劳动仲裁途径",
    ],
  },
  {
    id: "neighbor",
    label: "邻里矛盾",
    keywords: ["噪音", "排水", "通行", "遮挡", "采光", "邻居", "吵架", "辱骂"],
    risk: "low",
    legalRefs: ["《民法典》物权编", "村规民约"],
    steps: [
      "现场了解矛盾焦点",
      "分别听取双方诉求",
      "提出折中方案",
      "跟进落实情况",
    ],
  },
  {
    id: "property",
    label: "财产损害",
    keywords: ["损坏", "赔偿", "财物", "借贷", "欠款", "借物", "财产"],
    risk: "medium",
    legalRefs: ["《民法典》侵权责任编"],
    steps: ["固定损害证据", "评估损失金额", "组织调解协商赔偿", "签订和解记录"],
  },
  {
    id: "family",
    label: "家庭纠纷",
    keywords: ["赡养", "抚养", "家庭", "夫妻", "离婚", "继承"],
    risk: "high",
    legalRefs: ["《民法典》婚姻家庭编", "《老年人权益保障法》"],
    steps: [
      "单独访谈了解核心诉求",
      "联系亲属代表参与",
      "必要时引入司法调解",
      "关注情绪疏导",
    ],
  },
];

const CHAT_INTENTS = [
  {
    keys: ["纠纷", "调解", "提交", "申请"],
    reply:
      "您可以在「首页 → 我要说事」填写情况，AI 会帮您整理标题和建议步骤。提交后可随时在「我的调解」查看进度时间线。",
    suggestions: ["调解需要多久？", "需要准备什么材料？"],
  },
  {
    keys: ["积分", "道德银行", "申报"],
    reply:
      "道德银行用于记录参与村务、普法、调解等善行。在「道德银行 → 积分申报」提交后，村委会审核通过即可获得积分，积分可在商城兑换生活用品。",
    suggestions: ["积分怎么兑换？", "哪些行为可以申报？"],
  },
  {
    keys: ["通知", "公告", "村务"],
    reply: "最新村务通知在「首页顶部通知条」或「我的 → 村务通知」查看。",
    suggestions: ["怎么提交反馈？"],
  },
  {
    keys: ["多久", "时间", "几天"],
    reply:
      "一般纠纷调解在 7–15 个工作日内完成初步核查。复杂案件会进入「集体议 → 干部办」流程，您可在详情页时间线实时查看节点进度。",
    suggestions: ["如何加快处理？"],
  },
  {
    keys: ["材料", "证据", "准备"],
    reply:
      "建议准备：1）身份证明；2）相关凭证（合同、照片等）；3）双方联系方式；4）事情经过的时间线。",
    suggestions: ["可以上传照片吗？"],
  },
  {
    keys: ["团购", "惠民", "买东西"],
    reply:
      "「惠民团购」提供本地农产品和生活用品，团购利润部分反哺法治服务基金。",
    suggestions: ["怎么联系村委？"],
  },
];

const URGENCY_WORDS = [
  "紧急",
  "动手",
  "威胁",
  "打架",
  "受伤",
  "重大",
  "砍",
  "刀",
  "血",
];
const REFUSE_JUDGMENT = ["一定能赢", "稳赢", "判决书", "替我起诉", "百分百赢"];

function scoreRule(text, rule) {
  let score = 0;
  rule.keywords.forEach((kw) => {
    if (text.includes(kw)) score += 1;
  });
  return score;
}

function pickCategory(text) {
  let best = {
    id: "other",
    label: "其他纠纷",
    risk: "low",
    legalRefs: ["《民法典》", "村规民约"],
    steps: ["了解双方诉求", "组织现场沟通", "形成调解方案", "跟踪执行结果"],
    keywords: [],
  };
  let max = 0;
  RULES.forEach((rule) => {
    const s = scoreRule(text, rule);
    if (s > max) {
      max = s;
      best = rule;
    }
  });
  return best;
}

function buildTitle(text, category) {
  if (text.length <= 20) return text.replace(/\s+/g, "").slice(0, 30);
  const snippets = [
    { keys: ["土地", "边界"], tpl: "土地边界争议调解" },
    { keys: ["工资", "劳务"], tpl: "劳务报酬纠纷调解" },
    { keys: ["噪音", "邻居"], tpl: "邻里矛盾调解" },
  ];
  for (const s of snippets) {
    if (s.keys.some((k) => text.includes(k))) return s.tpl;
  }
  return `${category.label}调解申请`;
}

function buildSummary(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= 80 ? clean : `${clean.slice(0, 77)}…`;
}

function detectEscalation(text) {
  return URGENCY_WORDS.some((w) => text.includes(w));
}

function detectRefuseJudgment(text) {
  return REFUSE_JUDGMENT.some((w) => text.includes(w));
}

export function analyzeDispute({ content = "", title = "" }) {
  const text = `${title} ${content}`.trim();
  if (!text) return { ok: false, message: "请先描述纠纷情况" };

  const category = pickCategory(text);
  const escalate = detectEscalation(text);
  const refuseLegalJudgment = detectRefuseJudgment(text);
  let riskLevel = category.risk;
  if (escalate) riskLevel = "high";
  else if (text.length > 120 && category.risk === "low") riskLevel = "medium";

  const riskMap = { low: "较低", medium: "中等", high: "较高" };
  const keywordHits = (category.keywords || []).filter((kw) =>
    text.includes(kw)
  ).length;
  const confidence = Math.min(
    0.95,
    0.35 + keywordHits * 0.15 + (escalate ? 0.2 : 0)
  );

  return {
    ok: true,
    data: {
      suggestedTitle: title.trim() || buildTitle(text, category),
      category: category.id,
      categoryLabel: category.label,
      riskLevel,
      riskLabel: riskMap[riskLevel],
      summary: buildSummary(content || title),
      steps: category.steps,
      legalRefs: category.legalRefs,
      mediationAdvice: escalate
        ? "现场可能存在人身安全风险：请立即联系村委会或调解员；若正在冲突或有人受伤，请先拨打 110/120，再补建档。"
        : riskLevel === "high"
        ? "建议尽快联系村委会，必要时同步司法调解资源，避免矛盾升级。"
        : "建议先保持沟通克制，准备好相关凭证后再提交正式调解申请。",
      estimatedDays: riskLevel === "high" ? "3–7" : "7–15",
      escalate,
      escalateHint: escalate ? "已识别高风险情形，建议转人工优先处理" : "",
      refuseLegalJudgment,
      confidence,
      handoff: escalate
        ? {
            type: "urgent",
            label: "转村委 / 报警",
            channels: ["村委会", "110", "120"],
          }
        : {
            type: "routine",
            label: "可继续 AI 建档",
            channels: ["村委会调解"],
          },
      source: "rule",
      sourceLabel: "规则引擎",
    },
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

export function chatReply({ message = "" }) {
  const text = message.trim();
  if (!text) return { ok: false, message: "请输入问题" };

  if (detectRefuseJudgment(text)) {
    return {
      ok: true,
      data: {
        reply:
          "我不能预判诉讼输赢或代写判决文书。建议申请村委调解或咨询律师。以下仅供流程参考，不构成法律意见。",
        suggestions: ["如何提交纠纷？", "调解要多久？"],
        source: "rule",
        sourceLabel: sourceLabel("rule"),
        refuseLegalJudgment: true,
        handoff: {
          type: "legal",
          label: "转村委调解 / 律师",
          channels: ["村委会", "专业律师"],
        },
      },
    };
  }

  if (detectEscalation(text)) {
    return {
      ok: true,
      data: {
        reply:
          "您描述的情况可能涉及人身安全。请先确保安全：必要时拨打 110/120，并尽快联系村委会。线上可同步提交纠纷建档。",
        suggestions: ["如何提交纠纷？", "需要准备什么材料？"],
        source: "rule",
        sourceLabel: sourceLabel("rule"),
        escalate: true,
        handoff: {
          type: "urgent",
          label: "转村委 / 报警",
          channels: ["村委会", "110", "120"],
        },
      },
    };
  }

  for (const intent of CHAT_INTENTS) {
    if (intent.keys.some((k) => text.includes(k))) {
      return {
        ok: true,
        data: {
          reply: intent.reply,
          suggestions: intent.suggestions || [],
          source: "rule",
          sourceLabel: sourceLabel("rule"),
        },
      };
    }
  }

  const greetings = ["你好", "您好", "在吗", "hello", "hi"];
  if (greetings.some((g) => text.toLowerCase().includes(g))) {
    return {
      ok: true,
      data: {
        reply:
          "您好，我是指尖善治 AI 村务助手。可以帮您了解纠纷调解流程、积分申报、村务通知等事项。请问需要什么帮助？",
        suggestions: ["如何提交纠纷？", "积分怎么获得？", "调解要多久？"],
        source: "rule",
        sourceLabel: sourceLabel("rule"),
      },
    };
  }

  return {
    ok: true,
    data: {
      reply:
        "我已记录您的问题。村务类事务建议：纠纷调解走「首页 → 我要说事」；意见建议走「村务意见箱」；政策公告看「村务通知」。如需人工帮助，可前往村委会。",
      suggestions: ["如何提交纠纷？", "查看村务通知", "积分申报规则"],
      source: "rule",
      sourceLabel: sourceLabel("rule"),
    },
  };
}
