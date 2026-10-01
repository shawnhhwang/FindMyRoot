import db from '../db/connection.js';
import { queryBuiltInAssistant, FAQ_DATABASE, getClanContext } from '../utils/llmAssistant.js';

/**
 * 智能問答聊天端點
 */
export async function chatWithAssistant(req, res) {
  try {
    const { message = '', history = [] } = req.body;

    if (!message.trim()) {
      return res.status(400).json({ success: false, message: '訊息內容不得為空' });
    }

    // 檢查是否有配置外部 LLM
    const config = db.prepare('SELECT * FROM ai_configs LIMIT 1').get();

    if (config && config.api_key && config.provider !== 'builtin') {
      try {
        const externalReply = await callExternalLLM(config, message, history);
        return res.json({
          success: true,
          data: {
            reply: externalReply,
            provider: config.provider,
            model: config.model_name || 'default',
            suggestions: ['查詢開基祖資訊', '什麼是兩生合一老？', '宗族統計概況']
          }
        });
      } catch (externalErr) {
        console.warn('外部 LLM 呼叫失敗，自動降級至內建領域知識庫問答:', externalErr.message);
      }
    }

    // 使用內建專業知識庫與即時資料庫檢索回答
    const result = queryBuiltInAssistant(message);

    res.json({
      success: true,
      data: {
        reply: result.reply,
        provider: 'builtin',
        model: 'FindRoot-Expert-RulesEngine',
        suggestions: result.suggestions,
        category: result.category
      }
    });
  } catch (error) {
    console.error('chatWithAssistant error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 取得知識庫 FAQ 常用問題清單
 */
export function getFaqList(req, res) {
  try {
    res.json({
      success: true,
      data: FAQ_DATABASE
    });
  } catch (error) {
    console.error('getFaqList error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 取得當前 AI 設定 (不回傳明文 api_key)
 */
export function getAIConfig(req, res) {
  try {
    const config = db.prepare('SELECT * FROM ai_configs LIMIT 1').get();
    if (!config) {
      return res.json({
        success: true,
        data: {
          provider: 'builtin',
          model_name: 'FindRoot 內建專家知識庫',
          hasApiKey: false,
          base_url: ''
        }
      });
    }

    res.json({
      success: true,
      data: {
        provider: config.provider,
        model_name: config.model_name,
        hasApiKey: Boolean(config.api_key),
        base_url: config.base_url
      }
    });
  } catch (error) {
    console.error('getAIConfig error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 更新 AI 設定 (僅管理員可用)
 */
export function updateAIConfig(req, res) {
  try {
    const { provider = 'builtin', api_key, base_url, model_name } = req.body;
    const existing = db.prepare('SELECT id FROM ai_configs LIMIT 1').get();

    if (existing) {
      db.prepare(`
        UPDATE ai_configs SET
          provider = @provider,
          api_key = COALESCE(@api_key, api_key),
          base_url = @base_url,
          model_name = @model_name,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `).run({
        id: existing.id,
        provider,
        api_key: api_key || null,
        base_url: base_url || '',
        model_name: model_name || ''
      });
    } else {
      db.prepare(`
        INSERT INTO ai_configs (id, provider, api_key, base_url, model_name)
        VALUES ('ai-config-default', @provider, @api_key, @base_url, @model_name)
      `).run({
        provider,
        api_key: api_key || '',
        base_url: base_url || '',
        model_name: model_name || ''
      });
    }

    res.json({ success: true, message: 'AI 服務設定已更新' });
  } catch (error) {
    console.error('updateAIConfig error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 呼叫外部 OpenAI 相容介面 LLM
 */
async function callExternalLLM(config, userMessage, history = []) {
  const endpoint = config.base_url 
    ? `${config.base_url.replace(/\/$/, '')}/chat/completions`
    : 'https://api.openai.com/v1/chat/completions';

  const clanCtx = getClanContext();
  const systemPrompt = `你是一位專業的華人宗族族譜與祖先牌位禮制顧問「尋根系統 AI 助手」。
當前宗族資訊：
- 宗族名稱：${clanCtx.familyName}
- 堂號：${clanCtx.hallName}
- 開基始祖：${clanCtx.progenitor}
- 字輩詩：${clanCtx.generationPoem}
- 登錄總人數：${clanCtx.totalMembersCount} 人，傳承代數：${clanCtx.maxGeneration} 世

你的職責：
1. 熱情、典雅且專業地回答使用者有關祖先牌位格式、「兩生合一老」字數計算、國農曆干支換算、族譜傳承與命名禮制。
2. 回答務必精確遵守「生老病死苦」神數規範（中行合老如 12、17 字；左右合生老）。
3. 使用繁體中文回答，條理分明，適度使用粗體與條列符號。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-4),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.api_key}`
    },
    body: JSON.stringify({
      model: config.model_name || 'gpt-4o-mini',
      messages,
      temperature: 0.6
    })
  });

  if (!response.ok) {
    throw new Error(`外部 API 回應錯誤 ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '抱歉，未能產出回應。';
}
