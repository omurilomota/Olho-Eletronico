import i18n from '../../../i18n';
import type { AIModel, ChatMessage } from '../store/useIccStore';

interface AIResponse {
  text: string;
  reasoning: string;
  model: AIModel;
  chart?: { label: string; data: number[] };
}

const keywordMap: Record<string, AIResponse> = {
  ataque: {
    text: `**Analise Tatica de Ataque**

O time adversario concentra **65% dos ataques pelo lado esquerdo**, com transicao rapida em 4.2 segundos em media.

**Pontos fortes:**
- Cruzamentos da lateral com 38% de precisao
- Atacante centraliza bem na area (7 gols de cabeca)
- Meia criativo distribui 3.2 passe decisivo por jogo

**Pontos fracos:**
- Defesa aerea na entrada da area (sofre 2 gols de escanteio por mes)
- Laterais sobem demais, deixando espaco nas costas
- Falta profundidade quando recuado

**Recomendacao:** Marcar a saida de bola adversaria pelo lado esquerdo e usar contra-ataques rapidos pelas laterais.`,
    reasoning: 'Analisando padrao de ataque do adversario nos ultimos 6 jogos... Processando dados de posicionamento... Cruzando estatisticas de eficiencia por setor...',
    model: 'tatico',
  },
  defesa: {
    text: `**Vulnerabilidades Defensivas**

A zaga sofreu **8 gols nos ultimos 6 jogos**. Principal falha: marcacao na segunda trave em escanteios.

**Distribuicao dos gols sofridos:**
- Bolas paradas: 5 gols (62%)
- Contra-ataques: 2 gols (25%)
- Jogadas abertas: 1 gol (13%)

**Golpe principal:** Escanteio curto + cruzamento na segunda trave. O zagueiro central nao acompanha o atacante adversario.

**Recomendacao:** Reforcar marcacao na segunda trave. Usar marcador fixo no homem mais perigoso em bolas paradas.`,
    reasoning: 'Carregando historico defensivo dos ultimos 6 confrontos... Identificando padroes de gols sofridos... Analisando falhas por tipo de jogada...',
    model: 'tatico',
  },
  posse: {
    text: `**Analise de Posse de bola**

Media de **58% de posse** nos ultimos 5 jogos. Posse no ataque: 42%.

**Distribuicao por zona:**
- Defensiva: 62% (acima da media da liga)
- Medio-campo: 55%
- Ofensiva: 42% (abaixo da media)

**Progressao:** 342 passes por jogo com 89% de precisao. Passe longo: 72% de acerto.

**Problema:** Posse alta nao se converte em gols. Time joga muito na lateral e pouco na profundidade.

**Recomendacao:** Aumentar passes verticais. Usar o meia como ponta de lanca para quebrar linhas.`,
    reasoning: 'Processando dados de posse de bola dos ultimos 5 confrontos... Calculando distribuicao por zona do campo... Comparando com media da liga...',
    model: 'estatistico',
  },
  formacao: {
    text: `**Formacao Recomendada: 4-3-3**

Considerando o estilo adversario (pressing alto), a melhor formacao e o **4-3-3 com medio-receptivo**.

**Por que 4-3-3:**
- Superioridade numerica no meio-campo (3 vs 2)
- Laterais podem apoiar sem deixar espaco
- Atacante central pode recuar e criar superioridade

**Alinhamento sugerido:**
- Linha defensiva recuada (nao suffers pressing alto)
- Medio-receptivo entre linhas
- Atacantes rápidos para contra-ataques pelas laterais

**Alternativa:** 4-2-3-1 se o adversario marcar com 3 no meio.`,
    reasoning: 'Analisando estilo de jogo adversario... Avaliando eficiencia de formacoes recentes... Calculando matchups taticos...',
    model: 'tatico',
  },
  jogador: {
    text: `**Performance Individual — Atacante Principal (#9)**

**Numeros da temporada:**
- 12 gols em 15 jogos (0.8 por jogo)
- 5 assistencias
- xG: 10.8 (acima da media — eficiente)
- Distancia percorrida: 11.2 km/jogo

**Perfil:**
- Velocidade maxima: 34.2 km/h
- Duelos aereos: 58% de vitoria
- Finalizacao: 4.2 chutes por jogo, 38% no gol

**Forte:** Posicionamento na area e finalizacao de primeira.
**Fraco:** Participacao na construcao (so 18 passes por jogo).`,
    reasoning: 'Carregando perfil do atacante... Processando metricas da temporada... Cruzando dados de desempenho individual...',
    model: 'estatistico',
  },
  historico: {
    text: `**Historico de Confrontos**

**15 jogos disputados:**
- 7 vitorias (47%)
- 4 empates (27%)
- 4 derrotas (27%)
- Saldo de gols: +8

**Ultimos 5 confrontos:**
- Vitoria 2-0 (casa)
- Empate 1-1 (fora)
- Vitoria 3-1 (casa)
- Derrota 0-1 (fora)
- Vitoria 2-0 (casa)

**Tendencia:** Time ganha mais em casa (71% de vitorias). Fora, a taxa cai para 29%.`,
    reasoning: 'Buscando historico de confrontos diretos... Processando resultados dos ultimos 15 jogos... Calculando tendencias por mando de campo...',
    model: 'estatistico',
  },
  clima: {
    text: `**Condicoes Climaticas — Dia do Jogo**

**Previsao para as 21h (horario do jogo):**
- Temperatura: 22°C
- Umidade: 65%
- Vento: 12 km/h NE (sem efeito significativo)
- Chuva: Nenhuma previsao

**Impacto no jogo:** Condicoes ideais para jogo rapido com bola no chao. Sem desvantagem para nenhum time.

**Nota:** Temperatura amena favorece alto rendimento fisico por 90 minutos.`,
    reasoning: 'Consultando dados meteorologicos em tempo real... Analisando impacto no desempenho dos atletas... Validando previsao com modelo local...',
    model: 'operacional',
  },
  lesao: {
    text: `**Status de Lesoes**

**Jogadores duvidosos:**
- #7 (meio-campista) — Desconforto muscular. Probabilidade de jogo: 60%

**Jogadores fora:**
- #11 (lateral esquerdo) — Entorse grau 2. Retorno em 3 semanas

**Jogadores recuperados:**
- #4 (zagueiro) — Voltou dos treinos em 100%

**Impacto:** Perda do #11 enfraquece o ataque pelo lado esquerdo. Considerar substituto titular.`,
    reasoning: 'Verificando boletim medico atualizado... Cruzando dados de recuperacao... Avaliando impacto tatico das ausencias...',
    model: 'operacional',
  },
  arbitragem: {
    text: `**Perfil do Arbitro — Joao Silva**

**Media da temporada:**
- 4.2 cartoes por jogo
- 0.3 penaltis por jogo
- 11.5 faltas por jogo

**Tendencias:**
- Permissivo em faltas taticas (so 35% de cartoes)
- Rigoroso em faltas de ataque (65% dos cartoes)
- Ultimo jogo: 6 cartoes (acima da media)

**Estrategia:** Jogar limpo no primeiro tempo. Pressionar no segundo tempo quando o arbitro tende a apertar.`,
    reasoning: 'Analisando historico de arbitragem... Processando dados de cartoes e faltas... Identificando tendencias do apitador...',
    model: 'tatico',
  },
  estrategia: {
    text: `**Estrategia Recomendada**

**Plano de jogo:**
1. **Pressing medio-baixo** — Linha defensiva na linha de meio-campo
2. **Transicao rapida** — Maximo 3 passes do meio-campo ao gol
3. **Explorar laterais** — Atacantes atacam as brechas entre zagueiro e lateral
4. **Bola na area** — Cruzamentos na segunda trave com 3 jogadores na area

**Se ganhando:** Recuar e manter posicao. Usar contra-ataques.
**Se perdendo:** Aumentar pressing, colocar zagueiro na area em bolas paradas.
**Se empate:** Manter ritmo, trocar um volante por atacante no minuto 70.`,
    reasoning: 'Sintetizando dados taticos, estatisticos e de historico... Gerando plano de jogo personalizado... Validando coerencia com estilo do time...',
    model: 'tatico',
  },
  vendas: {
    text: `**Analise Comercial do Estadio**

**Receita total do evento:** $185.400
**Ocupacao media:** 78%

**Categorias por receita:**
- Alimentacao: $45.200 (24%)
- Merchandise: $38.700 (21%)
- Bebidas: $29.100 (16%)
- Ingressos: $22.400 (12%)

**Top estabelecimento:** Food Court Central ($45.200)
**Item mais vendido:** Hamburger artesanal (1.240 unidades)

**Oportunidade:** Bebidas tem margem alta mas volume baixo. Aumentar pontos de venda de cerveja.`,
    reasoning: 'Acessando dados de vendas em tempo real... Processando receita por categoria... Identificando top estabelecimento e produto mais vendido...',
    model: 'operacional',
  },
  estadio: {
    text: `**Status do Estadio**

**Capacidade:** 80.000 pessoas
**Ocupacao atual:** 78% (62.400 pessoas)

**Sistemas operacionais:**
- Cameras HD: Online (128 pontos)
- Sensores IoT: Online (2.400 dispositivos)
- Rede 5G: Estavel (latencia media: 12ms)
- IA Tatica: Processando

**Seguranca:**
- Checkpoints: 4/4 liberados
- Equipe medica: 12 postos ativos
- Varredura concluida: 100%

**Risco geral:** BAIXO (28/100)`,
    reasoning: 'Consultando painel de sistemas do estadio... Verificando status de todos os checkpoints... Calculando indice de risco geral...',
    model: 'operacional',
  },
  torcida: {
    text: `**Simulacao de Multidao**

**Torcedores ativos:** 600 pontos simulados
**Portoes monitorados:** 4 (Norte A, Norte B, Sul A, Sul B)

**Fluxo atual:**
- Norte A: 180 pessoas (fluxo medio)
- Norte B: 145 pessoas (fluxo baixo)
- Sul A: 165 pessoas (fluxo medio)
- Sul B: 110 pessoas (fluxo baixo)

**Alertas:** Nenhum congestionamento detectado
**Previsao:** Portao Norte A atingira capacidade maxima em 15 minutos

**Recomendacao:** Redirecionar fluxo para portao Sul B.`,
    reasoning: 'Processando dados da simulacao de multidao... Analisando fluxo por portao... Calculando previsoes de congestamento...',
    model: 'operacional',
  },
  risco: {
    text: `**Analise de Risco**

**Indice atual:** 28/100 (BAIXO)

**Fatores avaliados:**
- Seguranca: 15/100 (Baixo)
- Multidao: 32/100 (Medio-Baixo)
- Clima: 5/100 (Baixo)
- Sistemas: 22/100 (Baixo)
- Medicos: 18/100 (Baixo)

**Risco mais alto:** Multidao (32/100) — Portao Norte A com fluxo intenso

**Recomendacao:** Monitorar portao Norte A nos proximos 20 minutos. Nenhuma acao urgente necessaria.`,
    reasoning: 'Calculando indice de risco composto... Avaliando fatores de seguranca, multidao, clima e sistemas... Gerando relatorio consolidado...',
    model: 'operacional',
  },
  previsao: {
    text: `**Previsao de Resultado**

**Probabilidades calculadas:**
- Vitoria do time da casa: 45%
- Empate: 28%
- Vitoria do visitante: 27%

**Gols esperados:** 2.4 (total)
**Mais provavel:** Vitoria por 2-1 (probabilidade: 18%)

**Fatores favoraveis:**
- Mando de campo (71% de vitorias em casa)
- Publico favorable
- Condicoes climaticas ideais

**Fator de risco:** Lesao do #11 pode reduzir eficiencia do ataque em 15%.`,
    reasoning: 'Rodando modelo preditivo com dados historicos... Calculando probabilidades bayesianas... Validando com tendencias recentes...',
    model: 'preditivo',
  },
  placar: {
    text: `**Previsao de Placar**

**Placar mais provavel:** 2-1 (vitoria do time da casa)

**Distribuicao de gols:**
- Time da casa: 1.8 gols esperados
- Visitante: 1.1 gols esperados

**Sequencia de gols provavel:**
1. Time da casa marca primeiro (55% de chance)
2. Visitante empata (40% de chance)
3. Time da casa decide no segundo tempo (35% de chance)

**Confianca da previsao:** 62% (media). Jogo e imprevisivel.`,
    reasoning: 'Processando modelo de previsao de placar... Analisando historico de gols por tempo... Calculando probabilidades condicionais...',
    model: 'preditivo',
  },
};

const defaultResponses: AIResponse[] = [
  {
    text: `**Analise Geral do Time**

Time em **boa fase**, com 4 vitorias nos ultimos 5 jogos.

**Numeros recentes:**
- Media de 2.4 gols por jogo
- Defesa solida: apenas 0.6 gols sofridos por partida
- 85% de aproveitamento nos ultimos 5 jogos

**Destaque:** Atacante principal com 4 gols nos ultimos 3 jogos. Medio-campista com 3 assistencias.`,
    reasoning: 'Compilando dados gerais dos ultimos 5 jogos... Calculando medias de desempenho... Sintetizando analise consolidada...',
    model: 'estatistico',
  },
  {
    text: `**Dica Tatica**

Considere usar o **meia criador como falso 9**. Isso cria superioridade numerica no meio-campo e abre espacos nas laterais para os atacantes rapidos.

**Como aplicar:**
1. Meia recua para receber no meio
2. Atacantes centrais atacam as costas da zaga
3. Laterais sobem para apoiar pelas beiradas

**Quando usar:** Quando o adversario marca com 4 volantes no meio.`,
    reasoning: 'Analisando configuracao tatica atual... Avaliando alternativas de formacao... Gerando dica personalizada...',
    model: 'tatico',
  },
  {
    text: `**Estatisticas Avancadas**

**xG (Gols Esperados):** 15.3 acumulado (2o lugar na liga)
**xGA (Gols Sofridos Esperados):** 8.1 (melhor da liga)
**Pressao pos-perda:** Recupera a bola em 6.2s em media

**Comparativo com a liga:**
- xG: 15.3 (media da liga: 12.1)
- xGA: 8.1 (media da liga: 11.4)
- Pressao: 6.2s (media da liga: 8.1s)

**Conclusao:** Time e defensivamente sólido e ofensivamente eficiente.`,
    reasoning: 'Processando metricas avancadas da temporada... Cruzando dados com media da liga... Calculando percentis de desempenho...',
    model: 'estatistico',
  },
];

function detectModel(message: string): AIModel {
  const lower = message.toLowerCase();

  const tatico = ['formacao', 'estrategia', 'tatica', 'marcar', 'pressing', 'ataque', 'defesa', 'arbitro', 'arbitragem', ' time '];
  const estatistico = ['stats', 'estatistica', 'numero', 'historico', 'posse', 'jogador', 'performance', 'xg', 'media', 'quantos', 'quantas'];
  const operacional = ['estadio', 'clima', 'vendas', 'ingresso', 'seguranca', 'sistema', 'torcida', 'multidao', 'congestionamento', 'risco', 'camera', 'iot'];
  const preditivo = ['previsao', 'placar', 'vai ganhar', 'quem ganha', 'resultado', 'chance', 'probabilidade', 'o que vai acontecer'];

  if (preditivo.some((k) => lower.includes(k))) return 'preditivo';
  if (operacional.some((k) => lower.includes(k))) return 'operacional';
  if (tatico.some((k) => lower.includes(k))) return 'tatico';
  if (estatistico.some((k) => lower.includes(k))) return 'estatistico';

  return 'tatico';
}

export function getAIResponse(userMessage: string): ChatMessage {
  const lower = userMessage.toLowerCase();

  for (const [key, response] of Object.entries(keywordMap)) {
    if (lower.includes(key)) {
      return {
        role: 'ai',
        content: response.text,
        reasoning: response.reasoning,
        model: response.model,
        chartData: response.chart
          ? { label: response.chart.label, data: response.chart.data }
          : undefined,
      };
    }
  }

  const model = detectModel(userMessage);
  const fallback = defaultResponses.find((r) => r.model === model) ?? defaultResponses[0];

  return {
    role: 'ai',
    content: fallback.text,
    reasoning: fallback.reasoning,
    model: fallback.model,
    chartData: fallback.chart
      ? { label: fallback.chart.label, data: fallback.chart.data }
      : undefined,
  };
}

export const SUGGESTED_PROMPTS = (() => {
  const prompts = i18n.t('icc.chat.suggested_prompts', { returnObjects: true }) as string[];
  return prompts;
})();

export function getModelLabels(): Record<AIModel, string> {
  return {
    tatico: i18n.t('icc.chat.models.tatico'),
    estatistico: i18n.t('icc.chat.models.estatistico'),
    operacional: i18n.t('icc.chat.models.operacional'),
    preditivo: i18n.t('icc.chat.models.preditivo'),
  };
}

export const MODEL_COLORS: Record<AIModel, string> = {
  tatico: '#22c55e',
  estatistico: '#3b82f6',
  operacional: '#f59e0b',
  preditivo: '#8b5cf6',
};
