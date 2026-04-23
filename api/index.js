export default async function handler(req, res) {
  // 1. Разрешаем CORS (чтобы Figma не ругалась)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  // Убрали Authorization из разрешенных заголовков, так как Figma его больше не шлет
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); 

  // 2. Обработка запроса от браузера (проверка связи)
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') return res.status(200).send('Nvidia Proxy is online! 🚀');

  // 3. Проксируем запрос в Nvidia NIM
  try {
    // Перехватываем тело запроса от Figma и принудительно ставим нужную модель
    const requestBody = {
      ...req.body,
      model: "meta/llama-3.1-70b-instruct" 
    };

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Ключ теперь берется безопасно из настроек самого Vercel!
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}` 
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}