/** 干部推进话术模板 */

export const ADVANCE_SCRIPTS = {
  accept: [
    "已接案，将于 1～2 个工作日内电话联系双方核实情况，请保持畅通。",
    "材料已收到。请双方准备相关凭证，调解员将尽快约谈。当面核验身份即可。",
  ],
  handle: [
    "已进入办理。拟于约定时间上门/电话核实，请双方配合。",
    "正在组织沟通，请暂勿自行扩大争议；有新证据可在小程序补充。",
  ],
  complete: [
    "经调解双方达成一致，本案办结。如有异议可联系村委说明。",
    "办结说明已记录。请当事人评价本次调解，激励积分将计入账户。",
  ],
};

export function pickScript(advanceKey, index = 0) {
  const list = ADVANCE_SCRIPTS[advanceKey] || [];
  return list[index] || list[0] || "";
}

export function scriptChoices(advanceKey) {
  return (ADVANCE_SCRIPTS[advanceKey] || []).slice(0, 3);
}
