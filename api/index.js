// --- 1. БАЗОВЫЕ ПРАВИЛА (Константы) ---
const BASE_SYSTEM_RULES = `You are Jedi AI Copilot. Return ONLY a valid JSON array.
Design System: Jedi CSS (4px grid, Tailwind-like colors).
Rule: All icons MUST be isolated and NOT placed on background plates.`;

// --- 2. COMPONENT DICTIONARY (Словарь компонентов) ---
const COMPONENT_LIBRARY = {
  button: `Button Rule: Must have RECTANGLE (bg) and TEXT (label) with exact same bounds.`,
  input: `Input Rule: Rectangle border + Placeholder text 16px from left.`,
  card: `Card Rule: Rectangle with white background, 12px radius, and 16px padding.`
};

export default async function handler(req, res) {
  // 1. Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Обработка запроса от браузера
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') return res.status(200).send('Nvidia Proxy is online! 🚀');

  // 3. Проксируем запрос в Nvidia NIM
try {
    const { prompt } = req.body;
    let dynamicSkills = "";

    // --- ДИНАМИЧЕСКАЯ СБОРКА ---
    // Ищем ключевые слова в запросе пользователя
    if (prompt.toLowerCase().includes("button") || prompt.toLowerCase().includes("кнопк")) {
      dynamicSkills += "\n" + COMPONENT_LIBRARY.button;
    }
    if (prompt.toLowerCase().includes("input") || prompt.toLowerCase().includes("поле")) {
      dynamicSkills += "\n" + COMPONENT_LIBRARY.input;
    }
    // Если ничего конкретного не нашли, можно добавить базовый набор
    if (dynamicSkills === "") {
      dynamicSkills = "\nGeneral: Use standard rectangles and text layers.";
    }

    const finalSystemPrompt = `${BASE_SYSTEM_RULES}\n${dynamicSkills}`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [
          { role: "system", content: finalSystemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.2 // Низкая температура для строгого соблюдения JSON
      })
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}