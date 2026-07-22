import { analyzeDispute, chatReply } from "@/utils/ai-engine.js";

const STORAGE_KEY = "ruraltouch_mock_db";

function loadDb() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }
  return createSeedDb();
}

function saveDb(db) {
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(db));
}

function createSeedDb() {
  const now = Date.now();
  const db = {
    user: {
      _id: "mock-user-1",
      openid: "mock-openid",
      nickname: "演示村民",
      phone: "13800000000",
      village: "示范村",
      points: 1250,
      isAdmin: true,
    },
    notices: [
      {
        _id: "n1",
        title: "关于冬季防火安全的通知",
        content:
          "请各户检查柴火存放位置，严禁在村内违规用火，共同维护村庄安全。",
        publishTime: now - 86400000 * 2,
        village: "示范村",
      },
      {
        _id: "n2",
        title: "集体土地确权资料补充公告",
        content: "请涉及土地边界争议的村民于本周五前到村委会补充相关材料。",
        publishTime: now - 86400000 * 5,
        village: "示范村",
      },
    ],
    disputes: [
      {
        _id: "d1",
        title: "张某与李某土地争议",
        content: "双方土地边界存在纠纷，多次协商未达成一致，申请村委介入调解。",
        status: "processing",
        views: 328,
        village: "示范村",
        createTime: now - 86400000 * 3,
        stages: [
          {
            type: "submit",
            title: "反映诉求",
            content:
              "张某与李某土地争议，双方土地边界存在纠纷，多次协商未达成一致，申请村委介入调解。",
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
            content: "该纠纷已召开村民代表议事会，商议调解方案，确定调解流程。",
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
          {
            type: "review",
            title: "村民评",
            content: "等待调解完成后开展村民评议。",
            time: now,
            status: "pending",
          },
        ],
      },
      {
        _id: "d2",
        title: "王某劳动纠纷",
        content: "务工人员薪资结算存在分歧，申请村委协调处理。",
        status: "processing",
        views: 156,
        village: "示范村",
        createTime: now - 86400000 * 6,
        stages: [],
      },
    ],
    feedbacks: [],
    orders: [],
    moralRecords: [
      {
        _id: "mr1",
        title: "普法活动",
        points: 50,
        createTime: now - 86400000 * 10,
      },
      {
        _id: "mr2",
        title: "纠纷调解成功",
        points: 100,
        createTime: now - 86400000 * 12,
      },
      {
        _id: "mr3",
        title: "团购推广成功",
        points: 30,
        createTime: now - 86400000 * 15,
      },
    ],
    mallItems: [
      { _id: "m1", name: "洗衣液", points: 100, stock: 20 },
      { _id: "m2", name: "大米", points: 200, stock: 15 },
      { _id: "m3", name: "茶叶", points: 500, stock: 8 },
      { _id: "m4", name: "农具套装", points: 800, stock: 5 },
    ],
    products: [
      {
        _id: "p1",
        name: "黑豆粉 500g",
        desc: "低温烘焙细磨，豆香浓郁",
        price: "32.8",
        img: "/static/lite/products/heidoufen.jpg",
        category: "农产品",
      },
      {
        _id: "p2",
        name: "花糕粉 1kg",
        desc: "传统配方复配粉，做蒸糕松软细腻",
        price: "26.9",
        img: "/static/lite/products/huagaofen.jpg",
        category: "农产品",
      },
      {
        _id: "p3",
        name: "桑葚鲜果 2斤装",
        desc: "当季鲜摘，酸甜适口",
        price: "39.9",
        img: "/static/lite/products/sangshen.jpg",
        category: "农产品",
      },
      {
        _id: "p4",
        name: "三文鱼切片 300g",
        desc: "冷冻锁鲜，适合家常烹饪",
        price: "59.0",
        img: "/static/lite/products/sanwenyu.jpg",
        category: "农产品",
      },
      {
        _id: "p5",
        name: "园艺手套",
        desc: "耐磨防滑，田间劳作防护",
        price: "18.8",
        img: "/static/lite/group/nongzinongju.jpg",
        category: "农资农具",
      },
      {
        _id: "p6",
        name: "洗衣液 2kg",
        desc: "温和去污，家用常备",
        price: "29.9",
        img: "/static/lite/group/shenghuoyongpin.jpg",
        category: "生活用品",
      },
      {
        _id: "p7",
        name: "棉质短袖",
        desc: "透气亲肤，日常穿着",
        price: "45.0",
        img: "/static/lite/group/fuzhuangxiemao.jpg",
        category: "服装鞋帽",
      },
    ],
  };
  saveDb(db);
  return db;
}

function formatDate(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function mockApi(action, data = {}) {
  const db = loadDb();

  switch (action) {
    case "login": {
      if (data.phone) db.user.phone = data.phone;
      if (data.nickname) db.user.nickname = data.nickname;
      saveDb(db);
      return { code: 0, data: { user: db.user, token: "mock-token" } };
    }
    case "getUser":
      return { code: 0, data: { user: db.user } };
    case "updateProfile": {
      if (data.nickname != null) {
        const nickname = String(data.nickname || "")
          .trim()
          .slice(0, 20);
        if (!nickname) return { code: 400, message: "昵称不能为空" };
        db.user.nickname = nickname;
      }
      if (data.phone != null) {
        const phone = String(data.phone || "").trim();
        if (phone && !/^1\d{10}$/.test(phone))
          return { code: 400, message: "请输入正确手机号" };
        db.user.phone = phone;
      }
      if (data.avatarUrl != null) {
        db.user.avatarUrl = String(data.avatarUrl || "").trim();
      }
      saveDb(db);
      return { code: 0, data: { user: db.user } };
    }
    case "listNotices":
      return {
        code: 0,
        data: {
          list: db.notices.map((n) => ({
            ...n,
            publishTimeText: formatDate(n.publishTime),
          })),
        },
      };
    case "listDisputes":
      return {
        code: 0,
        data: {
          list: db.disputes.map((d) => ({
            ...d,
            createTimeText: formatDate(d.createTime),
          })),
        },
      };
    case "getDispute": {
      const item = db.disputes.find((d) => d._id === data.id);
      if (!item) return { code: 404, message: "记录不存在" };
      const evidence = (item.evidence || []).map((e) => ({
        ...e,
        url: e.mockUrl || e.url || "",
      }));
      const citizenExtra = item.citizenExtra
        ? {
            ...item.citizenExtra,
            evidence: (item.citizenExtra.evidence || []).map((e) => ({
              ...e,
              url: e.mockUrl || e.url || "",
            })),
          }
        : null;
      return {
        code: 0,
        data: {
          dispute: {
            ...item,
            evidence,
            citizenExtra,
            createTimeText: formatDate(item.createTime),
            stages: (item.stages || []).map((s) => ({
              ...s,
              timeText: formatDate(s.time),
            })),
          },
        },
      };
    }
    case "updateDisputeCitizen": {
      const item = db.disputes.find((d) => d._id === data.id);
      if (!item) return { code: 404, message: "记录不存在" };
      const now = Date.now();
      if (data.extraNote != null || data.evidence != null) {
        const prev = item.citizenExtra || { note: "", evidence: [] };
        item.citizenExtra = {
          note:
            data.extraNote != null
              ? String(data.extraNote).trim()
              : prev.note || "",
          evidence: Array.isArray(data.evidence)
            ? data.evidence.slice(0, 6)
            : prev.evidence || [],
          updatedAt: now,
        };
      }
      if (data.rating != null) {
        item.citizenRating = {
          rating: Math.min(5, Math.max(1, Number(data.rating) || 0)),
          comment: String(data.ratingComment || "").trim(),
          ratedAt: now,
        };
      }
      item.updateTime = now;
      saveDb(db);
      return {
        code: 0,
        data: {
          citizenExtra: item.citizenExtra || null,
          citizenRating: item.citizenRating || null,
        },
      };
    }
    case "createDispute": {
      const dispute = {
        _id: `d-${nowId()}`,
        title: data.title,
        content: data.content,
        aiMeta: data.aiMeta || null,
        evidence: data.evidence || [],
        status: "processing",
        views: 0,
        village: db.user.village,
        createTime: Date.now(),
        stages: [
          {
            type: "submit",
            title: "反映诉求",
            content: data.content,
            time: Date.now(),
            status: "done",
          },
          {
            type: "secretary",
            title: "书记回复",
            content: "村委会已收到您的调解申请，将尽快安排核查。",
            time: Date.now(),
            status: "processing",
          },
        ],
      };
      db.disputes.unshift(dispute);
      saveDb(db);
      return { code: 0, data: { dispute } };
    }
    case "createFeedback": {
      const item = {
        _id: `f-${nowId()}`,
        content: data.content,
        contact: data.contact || db.user.phone,
        nickname: db.user.nickname,
        village: db.user.village,
        createTime: Date.now(),
        status: "pending",
        reply: "",
        replyTime: 0,
      };
      db.feedbacks.unshift(item);
      saveDb(db);
      return {
        code: 0,
        data: {
          feedback: {
            ...item,
            createTimeText: formatDate(item.createTime),
            statusLabel: "待处理",
          },
        },
      };
    }
    case "listMyFeedbacks":
      return {
        code: 0,
        data: {
          list: db.feedbacks.map((f) => ({
            ...f,
            createTimeText: formatDate(f.createTime),
            replyTimeText: f.replyTime ? formatDate(f.replyTime) : "",
            statusLabel:
              f.status === "replied"
                ? "已答复"
                : f.status === "closed"
                ? "已关闭"
                : "待处理",
          })),
        },
      };
    case "adminListFeedbacks":
      return {
        code: 0,
        data: {
          list: db.feedbacks.map((f) => ({
            ...f,
            createTimeText: formatDate(f.createTime),
            replyTimeText: f.replyTime ? formatDate(f.replyTime) : "",
            statusLabel:
              f.status === "replied"
                ? "已答复"
                : f.status === "closed"
                ? "已关闭"
                : "待处理",
          })),
        },
      };
    case "adminReplyFeedback": {
      const item = db.feedbacks.find((f) => f._id === data.id);
      if (!item) return { code: 404, message: "反馈不存在" };
      item.reply = String(data.reply || "").trim();
      item.replyTime = Date.now();
      item.status = data.close ? "closed" : "replied";
      saveDb(db);
      return { code: 0, data: { ok: true } };
    }
    case "getMoralProfile":
      return {
        code: 0,
        data: {
          points: db.user.points,
          records: db.moralRecords.map((r) => ({
            ...r,
            createTimeText: formatDate(r.createTime),
          })),
        },
      };
    case "declareMoral": {
      const points = Number(data.points) || 50;
      db.moralRecords.unshift({
        _id: `mr-${nowId()}`,
        title: data.title,
        points,
        status: "pending",
        createTime: Date.now(),
      });
      saveDb(db);
      return {
        code: 0,
        data: { status: "pending", message: "已提交，等待村委会审核" },
      };
    }
    case "listMallItems":
      return { code: 0, data: { list: db.mallItems } };
    case "redeemMallItem": {
      const item = db.mallItems.find((m) => m._id === data.id);
      if (!item) return { code: 404, message: "商品不存在" };
      if (db.user.points < item.points)
        return { code: 400, message: "积分不足" };
      if (item.stock <= 0) return { code: 400, message: "库存不足" };
      db.user.points -= item.points;
      item.stock -= 1;
      db.moralRecords.unshift({
        _id: `mr-${nowId()}`,
        title: `兑换 ${item.name}`,
        points: -item.points,
        createTime: Date.now(),
      });
      saveDb(db);
      return { code: 0, data: { points: db.user.points } };
    }
    case "listProducts":
      return { code: 0, data: { list: db.products } };
    case "createOrder": {
      const product =
        db.products.find((p) => p._id === data.productId) ||
        (String(data.productId || "").startsWith("fallback-")
          ? {
              _id: data.productId,
              name: data.name || "团购商品",
              price: data.price || "0",
              img: data.img || "",
            }
          : null);
      if (!product) return { code: 404, message: "商品不存在" };
      const price = Number(product.price) || 0;
      const qty = Math.max(1, Number(data.qty) || 1);
      const amount = Math.round(price * qty * 100) / 100;
      const fundContribution = Math.round(amount * 0.3 * 100) / 100;
      const order = {
        _id: `o-${nowId()}`,
        userId: db.user._id,
        productId: product._id,
        productName: product.name,
        price,
        qty,
        amount,
        fundRatio: 0.3,
        fundContribution,
        status: "paid",
        statusLabel: "已下单",
        createTime: Date.now(),
      };
      db.orders = db.orders || [];
      db.orders.unshift(order);
      saveDb(db);
      return {
        code: 0,
        data: {
          order: { ...order, createTimeText: formatDate(order.createTime) },
        },
      };
    }
    case "listMyOrders":
      return {
        code: 0,
        data: {
          list: (db.orders || []).map((o) => ({
            ...o,
            createTimeText: formatDate(o.createTime),
          })),
        },
      };
    case "getFundStats": {
      const orders = db.orders || [];
      const raised =
        Math.round(
          orders.reduce((s, o) => s + (Number(o.fundContribution) || 0), 0) *
            100
        ) / 100;
      const target = 50000;
      return {
        code: 0,
        data: {
          raised,
          target,
          percent: Math.min(100, Math.round((raised / target) * 1000) / 10),
          orderCount: orders.length,
          fundRatio: 0.3,
        },
      };
    }
    case "initSeed":
      saveDb(createSeedDb());
      return { code: 0, data: { ok: true } };
    case "aiAssistDispute": {
      const result = analyzeDispute({
        content: data.content,
        title: data.title,
      });
      if (!result.ok) return { code: 400, message: result.message };
      return { code: 0, data: result.data };
    }
    case "aiChat": {
      const result = chatReply({
        message: data.message,
        history: data.history,
      });
      if (!result.ok) return { code: 400, message: result.message };
      return { code: 0, data: result.data };
    }
    case "aiLegalChat": {
      const result = chatReply({
        message: data.message,
        history: data.history,
      });
      if (!result.ok) return { code: 400, message: result.message };
      return {
        code: 0,
        data: {
          ...result.data,
          reply: result.data.reply + "（普法参考，复杂案件请咨询专业律师）",
          suggestions: [
            "土地边界争议怎么办？",
            "邻居噪音如何维权？",
            "如何防范电信诈骗？",
          ],
        },
      };
    }
    case "syncChatStore":
      return {
        code: 0,
        data: {
          synced: true,
          count:
            (data.store && data.store.sessions && data.store.sessions.length) ||
            0,
        },
      };
    case "pullChatStore":
      return { code: 0, data: { store: null, updateTime: 0 } };
    case "adminListDisputes":
      return {
        code: 0,
        data: {
          list: db.disputes.map((d) => ({
            ...d,
            createTimeText: formatDate(d.createTime),
          })),
        },
      };
    case "adminUpdateDispute": {
      const item = db.disputes.find((d) => d._id === data.id);
      if (!item) return { code: 404, message: "记录不存在" };
      if (data.status) item.status = data.status;
      if (data.stageTitle && data.stageContent) {
        item.stages = item.stages || [];
        item.stages.forEach((s) => {
          if (s.status === "processing") s.status = "done";
        });
        item.stages.push({
          type: "admin",
          title: data.stageTitle,
          content: data.stageContent,
          time: Date.now(),
          status: data.stageStatus || "processing",
        });
      }
      item.updateTime = Date.now();
      saveDb(db);
      return { code: 0, data: { ok: true } };
    }
    case "adminListPendingMorals":
      return {
        code: 0,
        data: {
          list: db.moralRecords
            .filter((r) => r.status === "pending")
            .map((r) => ({ ...r, createTimeText: formatDate(r.createTime) })),
        },
      };
    case "adminApproveMoral": {
      const record = db.moralRecords.find((r) => r._id === data.recordId);
      if (!record) return { code: 404, message: "记录不存在" };
      if (record.status !== "pending") return { code: 400, message: "已处理" };
      record.status = data.approve ? "approved" : "rejected";
      if (data.approve) db.user.points += record.points;
      saveDb(db);
      return { code: 0, data: { ok: true } };
    }
    default:
      return { code: 400, message: `未知操作: ${action}` };
  }
}

function nowId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
