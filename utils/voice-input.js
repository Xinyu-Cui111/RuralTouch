/**
 * 语音输入（可选，默认关闭）
 * 未授权同声传译插件时不要在 app.json 声明 plugins，否则启动报「插件未授权」。
 */

/** @returns {boolean} */
export function isVoiceInputAvailable() {
  return false;
}

export function bindVoiceHandlers() {
  return false;
}

export function startVoiceInput() {
  return Promise.reject(new Error("VOICE_UNAVAILABLE"));
}

export function stopVoiceInput() {
  /* no-op：未启用同声传译插件 */
}
