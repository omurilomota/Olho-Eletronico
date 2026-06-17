import type { ChatMessage } from '../store/useIccStore';

interface AIResponse {
  text: string;
  chart?: { label: string; data: number[]; colors?: string[] };
}

const keywordMap: Record<string, AIResponse> = {
  ataque: {
    text: 'Analise de padroes de ataque: O time adversario concentra 65% dos ataques pelo lado esquerdo, com transicao rapida em 4.2 segundos. Ponto forte: cruzamentos da lateral. Ponto fraco: defesa aerea na entrada da area.',
    chart: {
      label: 'Ataques por Setor',
      data: [25, 65, 10],
      colors: ['#22c55e', '#ef4444', '#3b82f6'],
    },
  },
  defesa: {
    text: 'Vulnerabilidades defensivas: A zaga sofreu 8 gols nos ultimos 6 jogos. 62% dos gols vieram de bolas paradas. Principal falha: marcação na segunda trave em escanteios.',
    chart: {
      label: 'Gols Sofridos por Tipo',
      data: [3, 2, 1, 2],
      colors: ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6'],
    },
  },
  posse: {
    text: 'Analise de posse de bola: Media de 58% nos ultimos 5 jogos. Posse no ataque: 42%. Progressao com bola: 342 passes por jogo (89% de precisao).',
    chart: {
      label: 'Posse por Zona (%)',
      data: [42, 58, 35],
      colors: ['#3b82f6', '#22c55e', '#f59e0b'],
    },
  },
  formacao: {
    text: 'Formacao recomendada: 4-3-3 com medio-receptivo. Considerando o estilo adversario (pressing alto), sugiro linha defensiva recuada e contra-ataques rapidos pelas laterais.',
    chart: {
      label: 'Eficiencia por Formacao',
      data: [72, 65, 58, 81],
      colors: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'],
    },
  },
  jogador: {
    text: 'Performance individual: #9 (atacante principal) - 12 gols, 5 assistencias. xG: 10.8 (acima da media). Distancia percorrida: 11.2 km/jogo. Velocidade maxima: 34.2 km/h.',
    chart: {
      label: 'Metricas do Atacante',
      data: [12, 5, 11, 34],
      colors: ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'],
    },
  },
  historico: {
    text: 'Historico de confrontos: 15 jogos, 7 vitorias, 4 empates, 4 derrotas. Saldo de gols: +8. Melhor resultado: 3-1. ultimo confronto: 2-0 (vitoria).',
    chart: {
      label: 'Resultado nos Confrontos',
      data: [7, 4, 4],
      colors: ['#22c55e', '#f59e0b', '#ef4444'],
    },
  },
  clima: {
    text: 'Condicoes climaticas para o jogo: 22°C, umidade 65%, vento 12 km/h NE. Sem previsao de chuva. Condicoes ideais para jogo rapido com bola no chao.',
    chart: {
      label: 'Condicoes por Hora',
      data: [22, 23, 24, 23, 22],
      colors: ['#3b82f6', '#3b82f6', '#f59e0b', '#3b82f6', '#3b82f6'],
    },
  },
  lesao: {
    text: 'Status de lesao: #7 (meio-campista) - Duvida (muscular). #11 (lateral) - Fora (entorse grau 2). #4 (zagueiro) - Recuperado. Tempo estimado de retorno: #11 - 3 semanas.',
    chart: {
      label: 'Dias de Recuperacao',
      data: [0, 21, 0, 7],
      colors: ['#22c55e', '#ef4444', '#22c55e', '#f59e0b'],
    },
  },
  arbitragem: {
    text: 'Perfil do arbitro: Media de 4.2 cartoes por jogo. Tendencia: permissivo em faltas taticas (so 35% de cartoes). Bolas paradas: 12 penaltis marcados em 20 jogos.',
    chart: {
      label: 'Cartoes por Jogo',
      data: [3, 4, 5, 4, 3, 6],
      colors: ['#f59e0b', '#f59e0b', '#ef4444', '#f59e0b', '#f59e0b', '#ef4444'],
    },
  },
  estrategia: {
    text: 'Estrategia recomendada: Pressing medio-baixo (linha defensiva na linha de meio-campo). Transicao rapida em 3 passes. Explorar brechas laterais. Marcar a saida de bola adversaria.',
    chart: {
      label: 'Eficacia Tatica (%)',
      data: [78, 65, 82, 71],
      colors: ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b'],
    },
  },
};

const defaultResponses: AIResponse[] = [
  {
    text: 'Analise geral: Time em boa fase, 4 vitorias nos ultimos 5 jogos. Media de 2.4 gols por jogo. Defesa solida com apenas 0.6 gols sofridos por partida.',
    chart: {
      label: 'Desempenho Recente',
      data: [85, 72, 90, 68, 88],
      colors: ['#22c55e', '#3b82f6', '#22c55e', '#f59e0b', '#22c55e'],
    },
  },
  {
    text: 'Dica tatica: Considere usar o meia criador como falso 9 para criar superioridade numerica no meio-campo e abrir espacos nas laterais.',
  },
  {
    text: 'Estatisticas avancadas: xG acumulado: 15.3 (2o lugar na liga). xGA: 8.1 (melhor da liga). Pressao pos-perda: recupera a bola em 6.2s em media.',
  },
];

export function getAIResponse(userMessage: string): ChatMessage {
  const lower = userMessage.toLowerCase();

  for (const [key, response] of Object.entries(keywordMap)) {
    if (lower.includes(key)) {
      return {
        role: 'ai',
        content: response.text,
        chartData: response.chart
          ? { label: response.chart.label, data: response.chart.data }
          : undefined,
      };
    }
  }

  const fallback = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  return {
    role: 'ai',
    content: fallback.text,
    chartData: fallback.chart
      ? { label: fallback.chart.label, data: fallback.chart.data }
      : undefined,
  };
}

export const SUGGESTED_PROMPTS = [
  'Analise de ataque',
  'Vulnerabilidades defensivas',
  'Posse de bola',
  'Formacao recomendada',
  'Performance do atacante',
  'Historico de confrontos',
  'Estrategia para o jogo',
];
