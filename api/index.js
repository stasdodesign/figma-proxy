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
    // Вытаскиваем данные, которые пришли из Фигмы
    const { prompt, systemRules } = req.body;

    // ПЕРЕУПАКОВЫВАЕМ в строгий стандарт OpenAI/Nvidia
    const nvidiaBody = {
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { 
          role: "system", 
          content: systemRules || "Return ONLY valid JSON." 
        },
        { 
          role: "user", 
          content: prompt || "" 
        }
      ]
    };

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}` 
      },
      body: JSON.stringify(nvidiaBody) // Отправляем правильную структуру
    });

    const data = await response.json();
    
    // Возвращаем ответ обратно в Figma
    res.status(response.status).json(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}