const cloud = require("wx-server-sdk");
const { assistDispute, villageChat, legalChat } = require("./ai-service");
const { getAssistCache, setAssistCache } = require("./assist-cache");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

const COL = {
  users: "rt_users",
  notices: "rt_notices",
  disputes: "rt_disputes",
  feedbacks: "rt_feedbacks",
  moralRecords: "rt_moral_records",
  mallItems: "rt_mall_items",
  products: "rt_products",
  orders: "rt_orders",
  aiEvents: "rt_ai_events",
  aiBadcases: "rt_ai_badcases",
  chatSessions: "rt_chat_sessions",
};

function ok(data) {
  return { code: 0, data };
}

function fail(code, message) {
  return { code, message };
}

function formatDate(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 异步写入 AI 调用指标；集合不存在时自动创建 */
async function ensureCollection(name) {
  try {
    await db.createCollection(name);
    return true;
  } catch (e) {
    const msg = String((e && (e.message || e.errMsg)) || e);
    // 已存在也算成功
    if (
      msg.includes("exist") ||
      msg.includes("已存在") ||
      msg.includes("-501001")
    )
      return true;
    return false;
  }
}

async function trackAiEvent(action, payload = {}) {
  const doc = {
    action,
    source: payload.source || "",
    provider: payload.provider || "",
    category: payload.category || "",
    riskLevel: payload.riskLevel || "",
    escalate: !!payload.escalate,
    refuseLegalJudgment: !!payload.refuseLegalJudgment,
    titleEdited: payload.titleEdited === true,
    latencyMs: Number(payload.latencyMs) || 0,
    ok: payload.ok !== false,
    createTime: Date.now(),
  };
  try {
    await db.collection(COL.aiEvents).add({ data: doc });
  } catch (e) {
    const msg = String((e && (e.message || e.errMsg)) || e);
    if (
      msg.includes("not exist") ||
      msg.includes("不存在") ||
      msg.includes("-502005")
    ) {
      await ensureCollection(COL.aiEvents);
      try {
        await db.collection(COL.aiEvents).add({ data: doc });
      } catch (e2) {
        /* ignore */
      }
    }
  }
}

function collectionHint(error) {
  const msg = String(error && (error.message || error.errMsg || error));
  if (
    msg.includes("collection not exists") ||
    msg.includes("Db or Table not exist") ||
    msg.includes("-502005")
  ) {
    return "请先在云开发控制台创建数据库集合 rt_users（及其他 rt_ 开头集合）";
  }
  if (
    msg.includes("system error") ||
    msg.includes('ret":-3') ||
    msg.includes("index")
  ) {
    return "数据库集合未创建或环境异常，请先在云开发控制台创建全部 rt_ 集合后重试";
  }
  return msg || "服务器错误";
}

async function ensureSeedData() {
  try {
    const meta = await db
      .collection("rt_meta")
      .doc("seed")
      .get()
      .catch(() => ({ data: null }));
    if (meta.data && meta.data.done) return;

    const now = Date.now();
    const batch = [
      db.collection(COL.notices).add({
        data: {
          title: "关于冬季防火安全的通知",
          content:
            "请各户检查柴火存放位置，严禁在村内违规用火，共同维护村庄安全。",
          publishTime: now - 86400000 * 2,
          village: "示范村",
        },
      }),
      db.collection(COL.notices).add({
        data: {
          title: "集体土地确权资料补充公告",
          content: "请涉及土地边界争议的村民于本周五前到村委会补充相关材料。",
          publishTime: now - 86400000 * 5,
          village: "示范村",
        },
      }),
      db.collection(COL.mallItems).add({
        data: { name: "洗衣液", points: 100, stock: 20 },
      }),
      db.collection(COL.mallItems).add({
        data: { name: "大米", points: 200, stock: 15 },
      }),
      db.collection(COL.mallItems).add({
        data: { name: "茶叶", points: 500, stock: 8 },
      }),
      db.collection(COL.mallItems).add({
        data: { name: "农具套装", points: 800, stock: 5 },
      }),
      db.collection(COL.products).add({
        data: {
          name: "黑豆粉 500g",
          desc: "低温烘焙细磨，豆香浓郁",
          price: "32.8",
          img: "/static/lite/products/heidoufen.jpg",
          category: "农产品",
        },
      }),
      db.collection(COL.products).add({
        data: {
          name: "花糕粉 1kg",
          desc: "传统配方复配粉，做蒸糕松软细腻",
          price: "26.9",
          img: "/static/lite/products/huagaofen.jpg",
          category: "农产品",
        },
      }),
      db.collection(COL.products).add({
        data: {
          name: "桑葚鲜果 2斤装",
          desc: "当季鲜摘，酸甜适口",
          price: "39.9",
          img: "/static/lite/products/sangshen.jpg",
          category: "农产品",
        },
      }),
      db.collection(COL.products).add({
        data: {
          name: "三文鱼切片 300g",
          desc: "冷冻锁鲜，适合家常烹饪",
          price: "59.0",
          img: "/static/lite/products/sanwenyu.jpg",
          category: "农产品",
        },
      }),
      db.collection(COL.products).add({
        data: {
          name: "园艺手套",
          desc: "耐磨防滑，田间劳作防护",
          price: "18.8",
          img: "/static/lite/group/nongzinongju.jpg",
          category: "农资农具",
        },
      }),
      db.collection(COL.products).add({
        data: {
          name: "洗衣液 2kg",
          desc: "温和去污，家用常备",
          price: "29.9",
          img: "/static/lite/group/shenghuoyongpin.jpg",
          category: "生活用品",
        },
      }),
      db.collection(COL.products).add({
        data: {
          name: "棉质短袖",
          desc: "透气亲肤，日常穿着",
          price: "45.0",
          img: "/static/lite/group/fuzhuangxiemao.jpg",
          category: "服装鞋帽",
        },
      }),
      db.collection(COL.disputes).add({
        data: {
          title: "张某与李某土地争议",
          content:
            "双方土地边界存在纠纷，多次协商未达成一致，申请村委介入调解。",
          status: "processing",
          views: 328,
          village: "示范村",
          createTime: now - 86400000 * 3,
          updateTime: now - 86400000,
          stages: [
            {
              type: "submit",
              title: "反映诉求",
              content:
                "双方土地边界存在纠纷，多次协商未达成一致，申请村委介入调解。",
              time: now - 86400000 * 3,
              status: "done",
            },
            {
              type: "secretary",
              title: "书记回复",
              content:
                "收到反馈，我们会立即安排人员实地核查土地边界，组织双方开展调解工作。",
              time: now - 86400000 * 2,
              status: "done",
            },
            {
              type: "council",
              title: "集体议",
              content:
                "该纠纷已召开村民代表议事会，商议调解方案，确定调解流程。",
              time: now - 86400000 * 1.5,
              status: "done",
            },
            {
              type: "cadre",
              title: "干部办",
              content:
                "已组织双方当事人到场调解，核对土地确权资料，进一步协商解决方案。",
              time: now - 86400000,
              status: "processing",
            },
          ],
        },
      }),
    ];

    await Promise.all(batch);
    await db
      .collection("rt_meta")
      .doc("seed")
      .set({
        data: { done: true, time: now },
      });
  } catch (error) {
    console.warn("ensureSeedData skipped:", error);
  }
}

const PRODUCT_SEED = [
  {
    name: "黑豆粉 500g",
    desc: "低温烘焙细磨，豆香浓郁",
    price: "32.8",
    img: "/static/lite/products/heidoufen.jpg",
    category: "农产品",
  },
  {
    name: "花糕粉 1kg",
    desc: "传统配方复配粉，做蒸糕松软细腻",
    price: "26.9",
    img: "/static/lite/products/huagaofen.jpg",
    category: "农产品",
  },
  {
    name: "桑葚鲜果 2斤装",
    desc: "当季鲜摘，酸甜适口",
    price: "39.9",
    img: "/static/lite/products/sangshen.jpg",
    category: "农产品",
  },
  {
    name: "三文鱼切片 300g",
    desc: "冷冻锁鲜，适合家常烹饪",
    price: "59.0",
    img: "/static/lite/products/sanwenyu.jpg",
    category: "农产品",
  },
  {
    name: "园艺手套",
    desc: "耐磨防滑，田间劳作防护",
    price: "18.8",
    img: "/static/lite/group/nongzinongju.jpg",
    category: "农资农具",
  },
  {
    name: "洗衣液 2kg",
    desc: "温和去污，家用常备",
    price: "29.9",
    img: "/static/lite/group/shenghuoyongpin.jpg",
    category: "生活用品",
  },
  {
    name: "棉质短袖",
    desc: "透气亲肤，日常穿着",
    price: "45.0",
    img: "/static/lite/group/fuzhuangxiemao.jpg",
    category: "服装鞋帽",
  },
];

/** 已跑过旧种子时，按名称补齐缺失商品 */
async function ensureProductCatalog() {
  try {
    await ensureCollection(COL.products);
    const res = await db.collection(COL.products).limit(50).get();
    const names = new Set((res.data || []).map((p) => p.name));
    for (const item of PRODUCT_SEED) {
      if (names.has(item.name)) continue;
      await db.collection(COL.products).add({ data: { ...item } });
      names.add(item.name);
    }
  } catch (error) {
    console.warn("ensureProductCatalog skipped:", error);
  }
}

async function getUserByOpenId(openid) {
  const res = await db.collection(COL.users).where({ openid }).limit(1).get();
  return res.data[0] || null;
}

async function handleLogin(wxContext, data) {
  const openid = wxContext.OPENID;
  if (!openid) {
    return fail(
      401,
      "未获取到用户身份，请确认开发者工具已登录微信且云环境已绑定"
    );
  }

  try {
    let user = await getUserByOpenId(openid);
    if (!user) {
      const createRes = await db.collection(COL.users).add({
        data: {
          openid,
          nickname: data.nickname || "村民用户",
          phone: data.phone || "",
          village: data.village || "示范村",
          points: 1250,
          createTime: Date.now(),
        },
      });
      user = {
        _id: createRes._id,
        openid,
        nickname: data.nickname || "村民用户",
        phone: data.phone || "",
        village: data.village || "示范村",
        points: 1250,
      };
      await ensureSeedData();
    } else if (data.phone) {
      await db
        .collection(COL.users)
        .doc(user._id)
        .update({
          data: { phone: data.phone, updateTime: Date.now() },
        });
      user.phone = data.phone;
    }

    if (isAdminUser(user, wxContext) && !user.isAdmin) {
      await db
        .collection(COL.users)
        .doc(user._id)
        .update({ data: { isAdmin: true } });
      user.isAdmin = true;
    }

    return ok({ user, token: openid });
  } catch (error) {
    console.error("handleLogin error", error);
    return fail(500, collectionHint(error));
  }
}

async function safeList(collectionName, sortField, limit = 50) {
  try {
    const res = await db
      .collection(collectionName)
      .orderBy(sortField, "desc")
      .limit(limit)
      .get();
    return res.data;
  } catch (error) {
    console.warn(
      "orderBy failed, fallback to simple query",
      collectionName,
      error.message
    );
    const res = await db.collection(collectionName).limit(limit).get();
    return res.data.sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0));
  }
}

async function requireUser(wxContext) {
  const user = await getUserByOpenId(wxContext.OPENID);
  if (!user) return null;
  return user;
}

function isAdminUser(user, wxContext) {
  if (!user) return false;
  if (user.isAdmin) return true;
  const adminOpenids = (process.env.ADMIN_OPENIDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return adminOpenids.includes(wxContext.OPENID);
}

async function requireAdmin(wxContext) {
  const user = await requireUser(wxContext);
  if (!user) return { error: fail(401, "请先登录") };
  if (!isAdminUser(user, wxContext)) return { error: fail(403, "无管理权限") };
  return { user };
}

async function resolveEvidenceUrls(evidence = []) {
  if (!evidence.length) return [];
  const fileList = evidence
    .map((e) => e.fileID)
    .filter((id) => id && !String(id).startsWith("mock://"));
  if (!fileList.length) return evidence;
  try {
    const res = await cloud.getTempFileURL({ fileList });
    const map = {};
    (res.fileList || []).forEach((item) => {
      map[item.fileID] = item.tempFileURL;
    });
    return evidence.map((e) => ({ ...e, url: map[e.fileID] || e.url || "" }));
  } catch (error) {
    return evidence;
  }
}

exports.main = async (event) => {
  const { action, data = {} } = event;
  const wxContext = cloud.getWXContext();

  try {
    switch (action) {
      case "ping":
        return ok({ ok: true, env: cloud.DYNAMIC_CURRENT_ENV || "cloud" });

      case "ensureCollections": {
        const names = Object.values(COL);
        const created = [];
        for (const name of names) {
          const okCreate = await ensureCollection(name);
          if (okCreate) created.push(name);
        }
        return ok({ collections: created });
      }

      case "aiStatus": {
        const { getConfig } = require("./llm");
        const cfg = getConfig();
        return ok({
          llmEnabled: cfg.enabled,
          provider: cfg.provider,
          model: cfg.model,
        });
      }

      case "login":
        return await handleLogin(wxContext, data);

      case "getUser": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        return ok({ user });
      }

      case "updateProfile": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        const patch = { updateTime: Date.now() };
        if (data.nickname != null) {
          const nickname = String(data.nickname || "")
            .trim()
            .slice(0, 20);
          if (!nickname) return fail(400, "昵称不能为空");
          patch.nickname = nickname;
        }
        if (data.phone != null) {
          const phone = String(data.phone || "").trim();
          if (phone && !/^1\d{10}$/.test(phone))
            return fail(400, "请输入正确手机号");
          patch.phone = phone;
        }
        if (data.avatarUrl != null) {
          const avatarUrl = String(data.avatarUrl || "")
            .trim()
            .slice(0, 500);
          patch.avatarUrl = avatarUrl;
        }
        if (Object.keys(patch).length <= 1)
          return fail(400, "没有可更新的资料");
        await db.collection(COL.users).doc(user._id).update({ data: patch });
        const next = { ...user, ...patch };
        return ok({ user: next });
      }

      case "listNotices": {
        const list = await safeList(COL.notices, "publishTime");
        return ok({
          list: list.map((item) => ({
            ...item,
            publishTimeText: formatDate(item.publishTime),
          })),
        });
      }

      case "listDisputes": {
        const list = await safeList(COL.disputes, "createTime");
        return ok({
          list: list.map((item) => ({
            ...item,
            createTimeText: formatDate(item.createTime),
          })),
        });
      }

      case "getDispute": {
        const res = await db.collection(COL.disputes).doc(data.id).get();
        if (!res.data) return fail(404, "记录不存在");
        const dispute = res.data;
        const evidence = await resolveEvidenceUrls(dispute.evidence || []);
        const citizenExtra = dispute.citizenExtra
          ? {
              ...dispute.citizenExtra,
              evidence: await resolveEvidenceUrls(
                dispute.citizenExtra.evidence || []
              ),
            }
          : null;
        return ok({
          dispute: {
            ...dispute,
            evidence,
            citizenExtra,
            createTimeText: formatDate(dispute.createTime),
            stages: (dispute.stages || []).map((stage) => ({
              ...stage,
              timeText: formatDate(stage.time),
            })),
          },
        });
      }

      case "updateDisputeCitizen": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        const id = data.id;
        if (!id) return fail(400, "缺少纠纷 ID");
        const docRes = await db.collection(COL.disputes).doc(id).get();
        if (!docRes.data) return fail(404, "记录不存在");
        const doc = docRes.data;
        const isOwner =
          doc.userId === user._id ||
          doc.openid === user.openid ||
          doc.openid === wxContext.OPENID;
        if (!isOwner && !isAdminUser(user, wxContext))
          return fail(403, "无权操作该办件");

        const now = Date.now();
        const update = { updateTime: now };
        const prevExtra = doc.citizenExtra || {
          note: "",
          evidence: [],
          updatedAt: 0,
        };

        if (data.extraNote != null || data.evidence != null) {
          update.citizenExtra = {
            note:
              data.extraNote != null
                ? String(data.extraNote).trim()
                : prevExtra.note || "",
            evidence: Array.isArray(data.evidence)
              ? data.evidence.slice(0, 6)
              : prevExtra.evidence || [],
            updatedAt: now,
          };
        }
        if (data.rating != null) {
          const rating = Math.min(5, Math.max(1, Number(data.rating) || 0));
          if (!rating) return fail(400, "请选择星级");
          update.citizenRating = {
            rating,
            comment: String(data.ratingComment || "").trim(),
            ratedAt: now,
          };
        }
        if (!update.citizenExtra && !update.citizenRating) {
          return fail(400, "无更新内容");
        }

        await db.collection(COL.disputes).doc(id).update({ data: update });
        const citizenExtra = update.citizenExtra
          ? {
              ...update.citizenExtra,
              evidence: await resolveEvidenceUrls(
                update.citizenExtra.evidence || []
              ),
            }
          : doc.citizenExtra || null;
        return ok({
          citizenExtra,
          citizenRating: update.citizenRating || doc.citizenRating || null,
        });
      }

      case "createDispute": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        const now = Date.now();
        const finalTitle = String(data.title || "").trim();
        let aiMeta = data.aiMeta ? { ...data.aiMeta } : null;
        if (aiMeta) {
          const suggested = String(aiMeta.suggestedTitle || "").trim();
          if (typeof aiMeta.titleEdited !== "boolean") {
            aiMeta.titleEdited = !!suggested && suggested !== finalTitle;
          }
          aiMeta.finalTitle = finalTitle;
          if (suggested) aiMeta.suggestedTitle = suggested;
        }
        const payload = {
          userId: user._id,
          openid: user.openid,
          title: finalTitle,
          content: data.content,
          aiMeta,
          evidence: data.evidence || [],
          status: "processing",
          phase: "submitted",
          views: 0,
          village: user.village,
          createTime: now,
          updateTime: now,
          stages: [
            {
              type: "submit",
              title: "已提交",
              content: "调解申请已建档。系统已记录案情要点，等待村委会受理。",
              time: now,
              status: "done",
            },
            {
              type: "queue",
              title: "待受理",
              content:
                aiMeta && aiMeta.estimatedDays
                  ? `预计 ${aiMeta.estimatedDays} 个工作日内联系您。请保持电话畅通。`
                  : "村委会将尽快安排调解员接案，请保持电话畅通。",
              time: now,
              status: "processing",
            },
          ],
        };
        const createRes = await db
          .collection(COL.disputes)
          .add({ data: payload });
        await trackAiEvent("disputeSubmit", {
          ok: true,
          source: (aiMeta && aiMeta.source) || "",
          category: (aiMeta && aiMeta.category) || "",
          riskLevel: (aiMeta && aiMeta.riskLevel) || "",
          escalate: !!(aiMeta && aiMeta.escalate),
          titleEdited: !!(aiMeta && aiMeta.titleEdited),
          latencyMs: 0,
        });
        return ok({ dispute: { _id: createRes._id, ...payload } });
      }

      case "createFeedback": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        const content = String(data.content || "").trim();
        if (!content) return fail(400, "请填写意见内容");
        const now = Date.now();
        const payload = {
          userId: user._id,
          nickname: user.nickname || "",
          village: user.village || "示范村",
          content,
          contact: data.contact || user.phone || "",
          createTime: now,
          status: "pending",
          reply: "",
          replyTime: 0,
          replyBy: "",
        };
        const addRes = await db
          .collection(COL.feedbacks)
          .add({ data: payload });
        return ok({
          feedback: {
            _id: addRes._id,
            ...payload,
            createTimeText: formatDate(now),
          },
        });
      }

      case "listMyFeedbacks": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        let list = [];
        try {
          const res = await db
            .collection(COL.feedbacks)
            .where({ userId: user._id })
            .orderBy("createTime", "desc")
            .limit(30)
            .get();
          list = res.data || [];
        } catch (e) {
          const res = await db
            .collection(COL.feedbacks)
            .where({ userId: user._id })
            .limit(30)
            .get();
          list = (res.data || []).sort(
            (a, b) => (b.createTime || 0) - (a.createTime || 0)
          );
        }
        return ok({
          list: list.map((item) => ({
            ...item,
            createTimeText: formatDate(item.createTime),
            replyTimeText: item.replyTime ? formatDate(item.replyTime) : "",
            statusLabel:
              item.status === "replied"
                ? "已答复"
                : item.status === "closed"
                ? "已关闭"
                : "待处理",
          })),
        });
      }

      case "adminListFeedbacks": {
        const auth = await requireAdmin(wxContext);
        if (auth.error) return auth.error;
        const list = await safeList(COL.feedbacks, "createTime", 50);
        return ok({
          list: list.map((item) => ({
            ...item,
            createTimeText: formatDate(item.createTime),
            replyTimeText: item.replyTime ? formatDate(item.replyTime) : "",
            statusLabel:
              item.status === "replied"
                ? "已答复"
                : item.status === "closed"
                ? "已关闭"
                : "待处理",
          })),
        });
      }

      case "adminReplyFeedback": {
        const auth = await requireAdmin(wxContext);
        if (auth.error) return auth.error;
        const id = data.id;
        const reply = String(data.reply || "").trim();
        if (!id) return fail(400, "缺少反馈 id");
        if (!reply) return fail(400, "请填写答复内容");
        const now = Date.now();
        await db
          .collection(COL.feedbacks)
          .doc(id)
          .update({
            data: {
              reply,
              replyTime: now,
              replyBy: auth.user.nickname || "村委",
              status: data.close ? "closed" : "replied",
            },
          });
        return ok({ ok: true });
      }

      case "getMoralProfile": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        let records = [];
        try {
          const res = await db
            .collection(COL.moralRecords)
            .where({ userId: user._id })
            .orderBy("createTime", "desc")
            .limit(30)
            .get();
          records = res.data;
        } catch (error) {
          const res = await db
            .collection(COL.moralRecords)
            .where({ userId: user._id })
            .limit(30)
            .get();
          records = res.data.sort(
            (a, b) => (b.createTime || 0) - (a.createTime || 0)
          );
        }
        return ok({
          points: user.points,
          records: records.map((item) => ({
            ...item,
            createTimeText: formatDate(item.createTime),
          })),
        });
      }

      case "declareMoral": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        const points = Number(data.points) || 50;
        await db.collection(COL.moralRecords).add({
          data: {
            userId: user._id,
            title: data.title,
            points,
            status: "pending",
            createTime: Date.now(),
          },
        });
        return ok({ status: "pending", message: "已提交，等待村委会审核" });
      }

      case "aiAssistDispute": {
        const t0 = Date.now();
        const cached = getAssistCache(data.title, data.content);
        if (cached && cached.data) {
          const latencyMs = Date.now() - t0;
          const payload = {
            ...cached.data,
            source: "cache",
            sourceLabel: "短缓存",
            cached: true,
            cacheOf: cached.data.source || "",
          };
          await trackAiEvent("aiAssistDispute", {
            ok: true,
            latencyMs,
            source: "cache",
            provider: "",
            category: payload.category,
            riskLevel: payload.riskLevel,
            escalate: payload.escalate,
          });
          return ok(payload);
        }
        const result = await assistDispute({
          content: data.content,
          title: data.title,
        });
        const latencyMs = Date.now() - t0;
        if (!result.ok) {
          await trackAiEvent("aiAssistDispute", { ok: false, latencyMs });
          return fail(400, result.message);
        }
        setAssistCache(data.title, data.content, result.data);
        await trackAiEvent("aiAssistDispute", {
          ok: true,
          latencyMs,
          source: result.data.source,
          provider: result.data.provider,
          category: result.data.category,
          riskLevel: result.data.riskLevel,
          escalate: result.data.escalate,
        });
        return ok(result.data);
      }

      case "aiChat": {
        const t0 = Date.now();
        const result = await villageChat({
          message: data.message,
          history: data.history,
          disputeContext: data.disputeContext || null,
        });
        const latencyMs = Date.now() - t0;
        if (!result.ok) {
          await trackAiEvent("aiChat", { ok: false, latencyMs });
          return fail(400, result.message);
        }
        await trackAiEvent("aiChat", {
          ok: true,
          latencyMs,
          source: result.data.source,
          provider: result.data.provider,
          escalate: result.data.escalate,
          refuseLegalJudgment: result.data.refuseLegalJudgment,
        });
        return ok(result.data);
      }

      case "aiLegalChat": {
        const t0 = Date.now();
        const result = await legalChat({
          message: data.message,
          history: data.history,
        });
        const latencyMs = Date.now() - t0;
        if (!result.ok) {
          await trackAiEvent("aiLegalChat", { ok: false, latencyMs });
          return fail(400, result.message);
        }
        await trackAiEvent("aiLegalChat", {
          ok: true,
          latencyMs,
          source: result.data.source,
          provider: result.data.provider,
          escalate: result.data.escalate,
          refuseLegalJudgment: result.data.refuseLegalJudgment,
        });
        return ok(result.data);
      }

      case "syncChatStore": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        const kind = data.kind === "legal" ? "legal" : "village";
        const store =
          data.store && typeof data.store === "object" ? data.store : null;
        if (!store || !Array.isArray(store.sessions))
          return fail(400, "无效会话数据");
        // 控制体积：最多 20 会话，每会话 40 条，内容截断
        const sessions = store.sessions.slice(0, 20).map((s) => ({
          id: s.id,
          title: String(s.title || "").slice(0, 40),
          updatedAt: Number(s.updatedAt) || 0,
          suggestions: Array.isArray(s.suggestions)
            ? s.suggestions.slice(0, 8)
            : [],
          disputeContext: s.disputeContext || null,
          history: Array.isArray(s.history)
            ? s.history.slice(-40).map((h) => ({
                role: h.role,
                content: String(h.content || "").slice(0, 2000),
              }))
            : [],
          messages: Array.isArray(s.messages)
            ? s.messages.slice(-40).map((m) => ({
                id: m.id,
                role: m.role,
                content: String(m.content || "").slice(0, 2000),
                citations: m.citations,
                escalate: m.escalate,
                handoff: m.handoff,
                ctas: m.ctas,
                feedback: m.feedback || null,
                failed: !!m.failed,
              }))
            : [],
        }));
        const payload = {
          userId: user._id,
          kind,
          store: {
            version: 2,
            currentId: store.currentId || (sessions[0] && sessions[0].id) || "",
            sessions,
          },
          updateTime: Date.now(),
        };
        try {
          const exist = await db
            .collection(COL.chatSessions)
            .where({ userId: user._id, kind })
            .limit(1)
            .get();
          if (exist.data && exist.data.length) {
            await db
              .collection(COL.chatSessions)
              .doc(exist.data[0]._id)
              .update({
                data: {
                  store: payload.store,
                  updateTime: payload.updateTime,
                },
              });
          } else {
            await db.collection(COL.chatSessions).add({ data: payload });
          }
        } catch (e) {
          const msg = String((e && (e.message || e.errMsg)) || e);
          if (
            msg.includes("not exist") ||
            msg.includes("不存在") ||
            msg.includes("-502005")
          ) {
            await ensureCollection(COL.chatSessions);
            await db.collection(COL.chatSessions).add({ data: payload });
          } else {
            return fail(500, "同步会话失败");
          }
        }
        return ok({ synced: true, count: sessions.length });
      }

      case "pullChatStore": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        const kind = data.kind === "legal" ? "legal" : "village";
        try {
          const res = await db
            .collection(COL.chatSessions)
            .where({ userId: user._id, kind })
            .limit(1)
            .get();
          const doc = res.data && res.data[0];
          return ok({
            store: doc ? doc.store : null,
            updateTime: doc ? doc.updateTime : 0,
          });
        } catch (e) {
          const msg = String((e && (e.message || e.errMsg)) || e);
          if (
            msg.includes("not exist") ||
            msg.includes("不存在") ||
            msg.includes("-502005")
          ) {
            await ensureCollection(COL.chatSessions);
            return ok({ store: null, updateTime: 0 });
          }
          return fail(500, "拉取会话失败");
        }
      }

      case "adminListDisputes": {
        const auth = await requireAdmin(wxContext);
        if (auth.error) return auth.error;
        const list = await safeList(COL.disputes, "createTime");
        return ok({
          list: list.map((item) => ({
            ...item,
            createTimeText: formatDate(item.createTime),
          })),
        });
      }

      case "adminUpdateDispute": {
        const auth = await requireAdmin(wxContext);
        if (auth.error) return auth.error;
        const {
          id,
          status,
          stageTitle,
          stageContent,
          stageStatus,
          advance,
          note,
        } = data;
        if (!id) return fail(400, "缺少纠纷 ID");

        const docRes = await db.collection(COL.disputes).doc(id).get();
        if (!docRes.data) return fail(404, "记录不存在");

        const ADVANCE = {
          accept: {
            phase: "accepted",
            status: "processing",
            stageTitle: "已受理",
            stageContent:
              "村调解员已接案。将尽快联系双方核实情况，请保持电话畅通。",
            stageStatus: "processing",
          },
          handle: {
            phase: "handling",
            status: "processing",
            stageTitle: "调解办理中",
            stageContent: "正在组织沟通与现场核查，调解员将持续更新进展。",
            stageStatus: "processing",
          },
          complete: {
            phase: "completed",
            status: "completed",
            stageTitle: "已办结",
            stageContent:
              "本案调解流程已办结。如有异议，可通过村务意见箱再次反映。",
            stageStatus: "done",
          },
        };

        const now = Date.now();
        const update = { updateTime: now };
        const stages = [...(docRes.data.stages || [])];

        if (advance && ADVANCE[advance]) {
          const tpl = ADVANCE[advance];
          update.status = tpl.status;
          update.phase = tpl.phase;
          stages.forEach((s) => {
            if (s.status === "processing") s.status = "done";
          });
          stages.push({
            type: "admin",
            title: tpl.stageTitle,
            content: (note && String(note).trim()) || tpl.stageContent,
            time: now,
            status: tpl.stageStatus,
          });
        } else {
          if (status) {
            update.status = status;
            if (status === "completed") update.phase = "completed";
          }
          if (stageTitle && stageContent) {
            stages.push({
              type: "admin",
              title: stageTitle,
              content: stageContent,
              time: now,
              status: stageStatus || "processing",
            });
            stages.forEach((s, idx) => {
              if (idx < stages.length - 1 && s.status === "processing")
                s.status = "done";
            });
          }
        }

        update.stages = stages;
        await db.collection(COL.disputes).doc(id).update({ data: update });

        // 办结激励：给当事人自动记一笔道德积分（待公示场景可再审）
        if (advance === "complete" && docRes.data.userId) {
          try {
            const bonus = 30;
            await db
              .collection(COL.users)
              .doc(docRes.data.userId)
              .update({
                data: { points: _.inc(bonus), updateTime: now },
              });
            await db.collection(COL.moralRecords).add({
              data: {
                userId: docRes.data.userId,
                title: `调解办结激励 · ${docRes.data.title || "纠纷"}`,
                points: bonus,
                status: "approved",
                createTime: now,
                reviewTime: now,
              },
            });
          } catch (e) {
            console.warn("complete bonus skipped", e.message);
          }
        }

        return ok({ ok: true, phase: update.phase || docRes.data.phase });
      }

      case "adminApproveMoral": {
        const auth = await requireAdmin(wxContext);
        if (auth.error) return auth.error;
        const { recordId, approve } = data;
        if (!recordId) return fail(400, "缺少记录 ID");

        const recRes = await db
          .collection(COL.moralRecords)
          .doc(recordId)
          .get();
        const record = recRes.data;
        if (!record) return fail(404, "记录不存在");
        if (record.status !== "pending") return fail(400, "该记录已处理");

        if (approve) {
          const userRes = await db
            .collection(COL.users)
            .doc(record.userId)
            .get();
          const targetUser = userRes.data;
          if (targetUser) {
            await db
              .collection(COL.users)
              .doc(record.userId)
              .update({
                data: { points: _.inc(record.points), updateTime: Date.now() },
              });
          }
          await db
            .collection(COL.moralRecords)
            .doc(recordId)
            .update({
              data: { status: "approved", reviewTime: Date.now() },
            });
        } else {
          await db
            .collection(COL.moralRecords)
            .doc(recordId)
            .update({
              data: { status: "rejected", reviewTime: Date.now() },
            });
        }
        return ok({ ok: true });
      }

      case "adminListPendingMorals": {
        const auth = await requireAdmin(wxContext);
        if (auth.error) return auth.error;
        const res = await db
          .collection(COL.moralRecords)
          .where({ status: "pending" })
          .limit(50)
          .get();
        return ok({
          list: res.data.map((item) => ({
            ...item,
            createTimeText: formatDate(item.createTime),
          })),
        });
      }

      case "adminAiMetrics": {
        const auth = await requireAdmin(wxContext);
        if (auth.error) return auth.error;
        const limit = Math.min(Math.max(Number(data.limit) || 200, 20), 500);
        let events = [];
        try {
          const res = await db
            .collection(COL.aiEvents)
            .orderBy("createTime", "desc")
            .limit(limit)
            .get();
          events = res.data || [];
        } catch (e) {
          try {
            await ensureCollection(COL.aiEvents);
            const res = await db.collection(COL.aiEvents).limit(limit).get();
            events = (res.data || []).sort(
              (a, b) => (b.createTime || 0) - (a.createTime || 0)
            );
          } catch (e2) {
            events = [];
          }
        }

        const total = events.length;
        const okCount = events.filter((e) => e.ok !== false).length;
        const escalateCount = events.filter((e) => e.escalate).length;
        const bySource = {};
        const byAction = {};
        let latencySum = 0;
        let latencyN = 0;
        events.forEach((e) => {
          const src = e.source || "unknown";
          const act = e.action || "unknown";
          bySource[src] = (bySource[src] || 0) + 1;
          byAction[act] = (byAction[act] || 0) + 1;
          if (e.latencyMs > 0) {
            latencySum += e.latencyMs;
            latencyN += 1;
          }
        });

        const disputes = await safeList(COL.disputes, "createTime");
        const withAi = disputes.filter((d) => d.aiMeta);
        const edited = withAi.filter(
          (d) => d.aiMeta && d.aiMeta.titleEdited
        ).length;
        const pending = disputes.filter(
          (d) =>
            d.phase === "submitted" || (!d.phase && d.status === "processing")
        ).length;
        const handling = disputes.filter(
          (d) => d.phase === "handling" || d.phase === "accepted"
        ).length;
        const escalateQueue = disputes.filter(
          (d) => d.aiMeta && d.aiMeta.escalate && d.status !== "completed"
        ).length;

        return ok({
          sampleSize: total,
          okRate: total ? +(okCount / total).toFixed(3) : 0,
          escalateRate: total ? +(escalateCount / total).toFixed(3) : 0,
          avgLatencyMs: latencyN ? Math.round(latencySum / latencyN) : 0,
          bySource,
          byAction,
          titleEditRate: withAi.length
            ? +(edited / withAi.length).toFixed(3)
            : null,
          titleAdoptionRate: withAi.length
            ? +((withAi.length - edited) / withAi.length).toFixed(3)
            : null,
          disputeWithAi: withAi.length,
          queue: { pending, handling, escalate: escalateQueue },
          recent: events.slice(0, 15).map((e) => ({
            ...e,
            createTimeText: formatDate(e.createTime),
          })),
        });
      }

      case "adminCreateBadcase": {
        const auth = await requireAdmin(wxContext);
        if (auth.error) return auth.error;
        const phenomenon = String(data.phenomenon || "").trim();
        if (!phenomenon) return fail(400, "请填写现象描述");
        const doc = {
          disputeId: data.disputeId || "",
          title: data.title || "",
          phenomenon,
          rootCause: String(data.rootCause || "").trim(),
          action: String(data.action || "").trim(),
          expect: data.expect || "",
          got: data.got || "",
          status: "open",
          reporterOpenid: wxContext.OPENID || "",
          createTime: Date.now(),
        };
        try {
          const addRes = await db.collection(COL.aiBadcases).add({ data: doc });
          return ok({ badcase: { _id: addRes._id, ...doc } });
        } catch (e) {
          const msg = String((e && (e.message || e.errMsg)) || e);
          if (
            msg.includes("not exist") ||
            msg.includes("不存在") ||
            msg.includes("-502005")
          ) {
            await ensureCollection(COL.aiBadcases);
            const addRes = await db
              .collection(COL.aiBadcases)
              .add({ data: doc });
            return ok({ badcase: { _id: addRes._id, ...doc } });
          }
          throw e;
        }
      }

      case "adminListBadcases": {
        const auth = await requireAdmin(wxContext);
        if (auth.error) return auth.error;
        let list = [];
        try {
          const res = await db
            .collection(COL.aiBadcases)
            .orderBy("createTime", "desc")
            .limit(50)
            .get();
          list = res.data || [];
        } catch (e) {
          try {
            await ensureCollection(COL.aiBadcases);
            const res = await db.collection(COL.aiBadcases).limit(50).get();
            list = (res.data || []).sort(
              (a, b) => (b.createTime || 0) - (a.createTime || 0)
            );
          } catch (e2) {
            list = [];
          }
        }
        const statusFilter = data.status ? String(data.status) : "";
        if (statusFilter === "open" || statusFilter === "fixed") {
          list = list.filter(
            (item) => (item.status || "open") === statusFilter
          );
        }
        return ok({
          list: list.map((item) => ({
            ...item,
            status: item.status || "open",
            statusLabel: item.status === "fixed" ? "已修好" : "待修复",
            createTimeText: formatDate(item.createTime),
            fixedAtText: item.fixedAt ? formatDate(item.fixedAt) : "",
          })),
        });
      }

      case "adminUpdateBadcase": {
        const auth = await requireAdmin(wxContext);
        if (auth.error) return auth.error;
        const id = data.id;
        const status = String(data.status || "").trim();
        if (!id) return fail(400, "缺少 Badcase id");
        if (status !== "open" && status !== "fixed")
          return fail(400, "状态仅支持 open / fixed");
        const now = Date.now();
        const patch = {
          status,
          updateTime: now,
        };
        if (status === "fixed") {
          patch.fixedAt = now;
          patch.fixedBy = (auth.user && auth.user.nickname) || "管理员";
          patch.fixNote = String(data.fixNote || "").trim();
          if (!patch.fixNote && data.action)
            patch.fixNote = String(data.action).trim();
        } else {
          patch.fixedAt = 0;
          patch.fixedBy = "";
          patch.fixNote = "";
        }
        try {
          await db.collection(COL.aiBadcases).doc(id).update({ data: patch });
        } catch (e) {
          return fail(404, "Badcase 不存在或更新失败");
        }
        return ok({ ok: true, status });
      }

      case "listMallItems": {
        const res = await db.collection(COL.mallItems).limit(50).get();
        return ok({ list: res.data });
      }

      case "redeemMallItem": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        const itemRes = await db.collection(COL.mallItems).doc(data.id).get();
        const item = itemRes.data;
        if (!item) return fail(404, "商品不存在");
        if (user.points < item.points) return fail(400, "积分不足");
        if (item.stock <= 0) return fail(400, "库存不足");

        await db
          .collection(COL.users)
          .doc(user._id)
          .update({
            data: { points: _.inc(-item.points), updateTime: Date.now() },
          });
        await db
          .collection(COL.mallItems)
          .doc(data.id)
          .update({
            data: { stock: _.inc(-1) },
          });
        await db.collection(COL.moralRecords).add({
          data: {
            userId: user._id,
            title: `兑换 ${item.name}`,
            points: -item.points,
            createTime: Date.now(),
          },
        });
        return ok({ points: user.points - item.points });
      }

      case "listProducts": {
        await ensureProductCatalog();
        const res = await db.collection(COL.products).limit(50).get();
        const list = (res.data || []).map((item) => ({
          ...item,
          img:
            typeof item.img === "string"
              ? item.img.replace(
                  /^\/static\/products\//,
                  "/static/lite/products/"
                )
              : item.img,
        }));
        return ok({ list });
      }

      case "createOrder": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        const productId = data.productId;
        if (!productId) return fail(400, "缺少商品");
        let product = null;
        // 支持演示 fallback id
        if (String(productId).startsWith("fallback-")) {
          product = {
            _id: productId,
            name: data.name || "团购商品",
            price: data.price || "0",
            img: data.img || "",
          };
        } else {
          try {
            const pr = await db.collection(COL.products).doc(productId).get();
            product = pr.data;
          } catch (e) {
            // 本地目录 id（p1-p7）或云库暂无时，允许用前端传入字段下单
            if (data.name && data.price != null) {
              product = {
                _id: productId,
                name: data.name,
                price: data.price,
                img: data.img || "",
              };
            } else {
              return fail(404, "商品不存在");
            }
          }
        }
        if (!product) return fail(404, "商品不存在");
        await ensureCollection(COL.orders);
        const price = Number(product.price) || 0;
        const qty = Math.max(1, Math.min(9, Number(data.qty) || 1));
        const amount = Math.round(price * qty * 100) / 100;
        const fundRatio = 0.3;
        const fundContribution = Math.round(amount * fundRatio * 100) / 100;
        const now = Date.now();
        const order = {
          userId: user._id,
          nickname: user.nickname || "",
          productId: product._id,
          productName: product.name,
          productImg: product.img || "",
          price,
          qty,
          amount,
          fundRatio,
          fundContribution,
          status: "paid",
          statusLabel: "已下单",
          createTime: now,
          remark: "演示订单：微信云开发记账，未接真实支付",
        };
        const addRes = await db.collection(COL.orders).add({ data: order });
        return ok({
          order: { _id: addRes._id, ...order, createTimeText: formatDate(now) },
        });
      }

      case "listMyOrders": {
        const user = await requireUser(wxContext);
        if (!user) return fail(401, "请先登录");
        let list = [];
        try {
          const res = await db
            .collection(COL.orders)
            .where({ userId: user._id })
            .orderBy("createTime", "desc")
            .limit(30)
            .get();
          list = res.data || [];
        } catch (e) {
          const res = await db
            .collection(COL.orders)
            .where({ userId: user._id })
            .limit(30)
            .get();
          list = (res.data || []).sort(
            (a, b) => (b.createTime || 0) - (a.createTime || 0)
          );
        }
        return ok({
          list: list.map((item) => ({
            ...item,
            createTimeText: formatDate(item.createTime),
          })),
        });
      }

      case "getFundStats": {
        const FUND_TARGET = 50000;
        let raised = 0;
        let orderCount = 0;
        try {
          await ensureCollection(COL.orders);
          const res = await db.collection(COL.orders).limit(200).get();
          const list = res.data || [];
          orderCount = list.length;
          raised = list.reduce(
            (sum, o) => sum + (Number(o.fundContribution) || 0),
            0
          );
        } catch (e) {
          raised = 0;
        }
        raised = Math.round(raised * 100) / 100;
        const pct = Math.min(
          100,
          Math.round((raised / FUND_TARGET) * 1000) / 10
        );
        return ok({
          raised,
          target: FUND_TARGET,
          percent: pct,
          orderCount,
          fundRatio: 0.3,
        });
      }

      /**
       * 普法视频：云函数侧换临时 HTTPS（管理员权限，绕过客户端 STORAGE_EXCEED_AUTHORITY）
       * 小程序里 video.src 用该 HTTPS；行业常规也是 CDN/云存储 HTTPS，而不是塞进主包。
       */
      case "getLawVideoUrl": {
        const DEFAULT_FID =
          "cloud://cloud1-d6gqqruqy1d721eb0.636c-cloud1-d6gqqruqy1d721eb0-1435593477/static/law-videos/law.mp4";
        const fileID =
          String((data && data.fileID) || "").trim() || DEFAULT_FID;
        try {
          const r = await cloud.getTempFileURL({ fileList: [fileID] });
          const item = (r && r.fileList && r.fileList[0]) || {};
          if (item.tempFileURL) {
            return ok({
              url: String(item.tempFileURL),
              fileID,
              maxAge: item.maxAge || 86400,
            });
          }
          const detail = item.errMsg || item.code || "无临时链接";
          return fail(
            404,
            `云视频不可用（${detail}）。请在云开发→存储上传 static/law-videos/law.mp4`
          );
        } catch (e) {
          const msg = (e && (e.message || e.errMsg)) || String(e);
          return fail(500, `换取视频链接失败：${msg}`);
        }
      }

      case "initSeed":
        await ensureSeedData();
        return ok({ ok: true });

      default:
        return fail(400, `未知操作: ${action}`);
    }
  } catch (error) {
    console.error("rt-api error", action, error);
    return fail(500, collectionHint(error));
  }
};
