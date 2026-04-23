// --- 1. ТВОИ БАЗОВЫЕ ПРАВИЛА (из index_Nvidia.js) ---
const BASE_SYSTEM_RULES = `You are Jedi AI Copilot. Return ONLY a valid JSON array.
Design System: Jedi CSS (4px grid).
Rule: All icons MUST be isolated and NOT placed on background plates.
Layout: Use 16px gaps. No markdown, no comments.`;

// --- 2. ТВОЙ СЛОВАРЬ КОМПОНЕНТОВ (дополнили схемой для кнопок) ---
const COMPONENT_LIBRARY = {
  button: `
  - Button Schema: {"type": "button", "bounds": {"x":0, "y":0, "width":160, "height":48}, "bg": {"color": "#148F2A", "radius": 8}, "label": {"text": "Click", "color": "#FFFFFF"}}
  - Rule: Every button MUST be a single "button" object, not separate rectangle and text.`,
  
  input: `
  - Input Rule: Rectangle border + Placeholder text 16px from left.`,
  
  card: `
  - Card Rule: Rectangle with white background, 12px radius, and 16px padding.`
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