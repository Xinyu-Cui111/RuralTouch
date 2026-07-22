const https = require("https");

const PROVIDERS = {
  deepseek: {
    baseUrl: "api.deepseek.com",
    path: "/chat/completions",
    defaultModel: "deepseek-chat",
  },
  tongyi: {
    baseUrl: "dashscope.aliyuncs.com",
    path: "/compatible-mode/v1/chat/completions",
    defaultModel: "qwen-turbo",
  },
};

function loadSecrets() {
  try {
    return require("./secrets.local.js");
  } catch (e) {
    return {};
  }
}

function getConfig() {
  const local = loadSecrets();
  const provider = (
    process.env.LLM_PROVIDER ||
    local.LLM_PROVIDER ||
    "deepseek"
  ).toLowerCase();
  const apiKey = process.env.LLM_API_KEY || local.LLM_API_KEY || "";
  const model =
    process.env.LLM_MODEL ||
    local.LLM_MODEL ||
    (PROVIDERS[provider] && PROVIDERS[provider].defaultModel) ||
    "deepseek-chat";
  return { provider, apiKey, model, enabled: !!apiKey };
}

function postJson(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request(
      {
        hostname,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          ...headers,
        },
        timeout: 55000,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          try {
            const json = JSON.parse(raw || "{}");
            if (res.statusCode >= 400) {
              reject(
                new Error(
                  json.error?.message ||
                    json.message ||
                    `LLM HTTP ${res.statusCode}`
                )
              );
              return;
            }
            resolve(json);
          } catch (error) {
            reject(new Error(`LLM 响应解析失败: ${raw.slice(0, 200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("LLM 请求超时"));
    });
    req.write(payload);
    req.end();
  });
}

async function chatCompletion(messages, options = {}) {
  const cfg = getConfig();
  if (!cfg.enabled) {
    return { ok: false, reason: "no_key" };
  }

  const providerCfg = PROVIDERS[cfg.provider] || PROVIDERS.deepseek;
  const body = {
    model: cfg.model,
    messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 1200,
  };

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const headers = { Authorization: `Bearer ${cfg.apiKey}` };

  try {
    const res = await postJson(
      providerCfg.baseUrl,
      providerCfg.path,
      headers,
      body
    );
    const content = res.choices?.[0]?.message?.content || "";
    return {
      ok: true,
      content: content.trim(),
      provider: cfg.provider,
      model: cfg.model,
    };
  } catch (error) {
    console.error("LLM error", error.message);
    return { ok: false, reason: "error", message: error.message };
  }
}

function extractJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

module.exports = { chatCompletion, extractJson, getConfig };
