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

// --- 3. NVIDIA API BODY TEMPLATE (Шаблон тела запроса) ---
const nvidiaBody = {
  model: "meta/llama-3.1-70b-instruct",
  messages: [
    { 
      role: "system", 
      content: `You are Jedi AI. Return ONLY JSON. No comments.
      
      STRICT SCHEMA:
      - For buttons use type "button" (DO NOT use RECTANGLE+TEXT separately).
      - Structure: {"type": "button", "bounds": {"width": 160, "height": 48}, "bg": {"color": "#148F2A", "radius": 8}, "label": {"text": "Click"}}
      - For others use "RECTANGLE" or "TEXT".` 
    },
    { role: "user", content: prompt }
  ],
  temperature: 0.1 // Снижаем температуру для точности!
};

export default async function handler(req, res) {
  // --- ЧИНИМ CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Ответ на предварительный запрос браузера (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { prompt } = req.body;

    const nvidiaBody = {
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { 
          role: "system", 
          content: `You are a Jedi UI Bot. Return ONLY JSON array. No comments.
          
          STRICT SCHEMA CONSTRAINING:
          - Every button MUST be: {"type": "button", "bounds": {"x": 0, "y": 0, "width": 160, "height": 48}, "bg": {"color": "#148F2A", "radius": 8}, "label": {"text": "Click", "color": "#FFFFFF"}}
          - Layout: Use 16px gaps. No complex nesting. No markdown.` 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1 // Делаем модель максимально "послушной"
    };

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify(nvidiaBody)
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}