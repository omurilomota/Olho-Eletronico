import type { ChatMessage } from '../store/useIccStore';

const keywordMap: Record<
  string,
  { text: string; chart?: { label: string; data: number[] } }
> = {
  ataque: {
    text: 'Padroes de ataque: O time adversario usa 60% das jogadas pelo lado esquerdo. Veja o grafico:',
    chart: { label: 'Ataques por setor', data: [40, 60, 20] },
  },
  defesa: {
    text: 'A defesa adversaria sofreu 12 gols nos ultimos 5 jogos. Grafico de vulnerabilidades:',
    chart: { label: 'Gols sofridos', data: [2, 3, 1, 4, 2] },
  },
  posse: {
    text: 'Media de posse de bola: 54% nos ultimos jogos. Comparativo:',
    chart: { label: 'Posse (%)', data: [54, 46] },
  },
};

export function getAIResponse(userMessage: string): ChatMessage {
  const lower = userMessage.toLowerCase();
  for (const [key, response] of Object.entries(keywordMap)) {
    if (lower.includes(key)) {
      return {
        role: 'ai',
        content: response.text,
        chartData: response.chart,
      };
    }
  }
  return {
    role: 'ai',
    content:
      'Desculpe, nao encontrei informacoes especificas. Pergunte sobre ataque, defesa ou posse.',
  };
}
