// ==================== MISTRAL AI INTEGRATION ====================
const MISTRAL_API_KEY = 'Gwci6DvnuEdvSiCZN78KkkVFSsHlnXGo';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

async function callMistralAI(modelId, messages) {
  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Нет ответа от модели';
  } catch (error) {
    console.error('Mistral AI Error:', error);
    throw error;
  }
}

window.callMistralAI = callMistralAI;
