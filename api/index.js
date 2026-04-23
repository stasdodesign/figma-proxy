// --- 1. ТВОИ БАЗОВЫЕ ПРАВИЛА  ---
const BASE_SYSTEM_RULES = `You are Jedi AI Copilot. 
Everything is based on the "Jedi Design System".
Return ONLY a valid JSON array. No comments.
Rule: All variables must strictly follow the Jedi Design System naming convention.`;

// --- 2. ТВОЙ СЛОВАРЬ КОМПОНЕНТОВ  ---
const COMPONENT_LIBRARY = {
  button: `
  - Use type: "button".
  - Button Schema: {
      "type": "button",
      "bounds": {"x":0, "y":0, "width":160, "height":48},
      "bgVariable": "jedi/primary", 
      "textVariable": "jedi/text/primary",
      "radius": 8,
      "label": "Click Me"
    }
  - Available BG Variables: "jedi/primary", "jedi/primary-dark", "jedi/surface", "jedi/error".
  - Available Text Variables: "jedi/text/primary", "jedi/text/on-dark".
  - Note: Variable names are case-sensitive and must exist in Jedi Design System.`
};


export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt } = req.body;
    let dynamicRules = "";

    // --- ДИНАМИЧЕСКАЯ СБОРКА (чтобы не перегружать контекст) ---
    const lowerPrompt = prompt.toLowerCase();
    
    // Если в запросе есть "button" или "кнопка" — добавляем правила кнопок
    if (lowerPrompt.includes("button") || lowerPrompt.includes("кнопк")) {
      dynamicRules += COMPONENT_LIBRARY.button;
    }
    // Если есть "input" или "поле" — добавляем правила инпутов
    if (lowerPrompt.includes("input") || lowerPrompt.includes("поле")) {
      dynamicRules += COMPONENT_LIBRARY.input;
    }
    // Если есть "card" или "карточк" — добавляем правила карточек
    if (lowerPrompt.includes("card") || lowerPrompt.includes("карточк")) {
      dynamicRules += COMPONENT_LIBRARY.card;
    }

    // Собираем финальный системный промпт
    const finalSystemContent = `${BASE_SYSTEM_RULES}\n\nSTRICT SCHEMA CONSTRAINING:\n${dynamicRules}`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [
          { role: "system", content: finalSystemContent },
          { role: "user", content: prompt }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}