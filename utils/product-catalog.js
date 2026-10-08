/**
 * 团购商品目录（本地兜底 + 云库种子对齐）
 */
export const PRODUCT_CATALOG = [
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
];

export const GROUP_CATEGORIES = [
  {
    key: "农资农具",
    text: "农资农具",
    img: "/static/lite/group/nongzinongju.jpg",
  },
  { key: "农产品", text: "农产品", img: "/static/lite/group/nongchanpin.jpg" },
  {
    key: "生活用品",
    text: "生活用品",
    img: "/static/lite/group/shenghuoyongpin.jpg",
  },
  {
    key: "服装鞋帽",
    text: "服装鞋帽",
    img: "/static/lite/group/fuzhuangxiemao.jpg",
  },
];

/** 云端列表不足时，用本地目录按名称补齐 */
export function mergeProductList(remote = []) {
  const list = Array.isArray(remote) ? remote.slice() : [];
  const names = new Set(list.map((p) => p && p.name).filter(Boolean));
  PRODUCT_CATALOG.forEach((item) => {
    if (!names.has(item.name)) list.push({ ...item });
  });
  return list.map(normalizeProductImg);
}

export function filterByCategory(list, category) {
  if (!category) return list;
  return (list || []).filter((p) => p.category === category);
}

export function normalizeProductImg(item) {
  if (!item || !item.img) return item;
  let img = String(item.img);
  img = img
    .replace(/^\/static\/products\//, "/static/lite/products/")
    .replace(/^\/static\/group-icons\//, "/static/lite/group/")
    .replace(/^\/static\/banner\//, "/static/lite/");
  return { ...item, img };
}
