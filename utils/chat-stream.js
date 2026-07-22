/**
 * 客户端流式揭示（云函数暂无真 SSE 时的打字机体验）
 */

export function createStreamer({ interval = 22, step = 2 } = {}) {
  let timer = null;
  let cancelled = false;

  return {
    cancel() {
      cancelled = true;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
    async run(fullText = "", onChunk) {
      const text = String(fullText || "");
      cancelled = false;
      if (!text) {
        if (typeof onChunk === "function") onChunk("", true);
        return { cancelled: false };
      }
      return new Promise((resolve) => {
        let i = 0;
        timer = setInterval(() => {
          if (cancelled) {
            clearInterval(timer);
            timer = null;
            resolve({ cancelled: true });
            return;
          }
          i = Math.min(text.length, i + step);
          const done = i >= text.length;
          if (typeof onChunk === "function") onChunk(text.slice(0, i), done);
          if (done) {
            clearInterval(timer);
            timer = null;
            resolve({ cancelled: false });
          }
        }, interval);
      });
    },
  };
}
