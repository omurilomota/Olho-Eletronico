# Olho Eletronico

Sistema de simulacao e monitoramento para a Copa do Mundo FIFA 2026, com dois modulos principais: **SAOT Lab** (analise de impedimento 3D) e **ICC Command Center** (centro de comando operacional).

## Pre-requisitos

- [Node.js](https://nodejs.org/) >= 18
- npm >= 9

## Como Rodar

```bash
# Instalar dependencias
npm install

# Desenvolvimento
npm run dev

# Build para producao
npm run build

# Preview da build
npm run preview

# Testes
npm test
```

Acesse `http://localhost:5173`.

## Sistema de Coordenadas 3D

O campo 3D usa o sistema de coordenadas do Three.js com a seguinte convencao:

| Eixo | Direcao | Unidade |
|------|---------|---------|
| **X** | Comprimento do campo (lado esquerdo → direito) | 1 unidade = 1 metro |
| **Y** | Altura (chao → cima) | 1 unidade = 1 metro |
| **Z** | Largura do campo (fundo → frente) | 1 unidade = 1 metro |

- **Campo**: 37m de comprimento × 22m de largura
- **Gol esquerdo**: x = -16.5
- **Gol direito**: x = +16.5
- **Linha central**: x = 0
- **Atacante com bola**: x positivo (avanca em direcao ao gol adversario)
- **Goleiro**: comeca com a bola e chuta para o atacante

## Funcionalidades

### SAOT Lab

- Cena 3D interativa com campo, goles, estadio e cidade procedural ao redor
- Jogadores humanos com animacao articulada (corpo, bracos, pernas, cabeca)
- Calculo de impedimento milimetrico (margem em cm)
- 5 cenarios pre-definidos (impedimento normal, marginal, reverso, legal atras, legal nivel)
- Modo livre para arrastar jogadores e configurar posicoes
- Motor de simulacao com play/pause/reset/seek/velocidade ajustavel
- 5 presets de camera (Broadcast, Tatical, Gol Esquerda, Gol Direita, Livre)
- Modo Playbook com 5 jogadas pre-definidas e navegacao passo a passo
- Linha de impedimento: vermelha no defensor + azul no atacante

### ICC Command Center

- Mapa de Geamais Digitais com simulacao de 600 torcedores e deteccao de congestamento
- Assistente tatico IA com efeito typewriter e graficos de resposta
- Indicador de risco circular (0-100)
- Widget de clima com 3 abas (Agora, Semanal, Mensal)
- Painel de status dos sistemas (Cameras, IoT, 5G, IA, Backup, GPS)
- Painel comercial com receita por categoria e ranking de lojas
- Ticker de operacoes ao vivo com niveis de severidade

### Compartilhado

- Tela de login com glass-morphism e animacao de erro
- Design system com efeitos glass, gradientes, animacoes customizadas
- Error Boundary com retry por modulo
- Data Overlay com FPS, triangles e draw calls em tempo real

## Stack Tecnico

| Tecnologia | Versao |
|-----------|--------|
| React | 19 |
| TypeScript | 6 (strict) |
| Vite | 8 |
| Zustand | 5 |
| @react-three/fiber | 9 |
| @react-three/drei | 10 |
| Three.js | 0.184 |
| Recharts | 3 |
| Tailwind CSS | 4 |

## Estrutura do Projeto

```
src/
├── modules/
│   ├── saot/               # Modulo SAOT Lab (3D + Engine)
│   │   ├── components/     # Player, Ball, Pitch, Goals, Stadium, OffsideLine, etc.
│   │   ├── hooks/          # useSimulation, useDragPlayer
│   │   ├── services/       # OffsideCalculator
│   │   └── store/          # useSaotStore, usePlaybookStore
│   └── icc/                # Modulo ICC Command Center
│       ├── components/     # DigitalTwinMap, AIChat, SalesPanel, etc.
│       ├── hooks/          # useCrowdSimulation
│       ├── services/       # mockAIResponses
│       └── store/          # useIccStore
├── shared/                 # Codigo compartilhado
│   ├── components/         # Layout, LoginScreen, ErrorBoundary, DataOverlay
│   ├── utils/              # formatCm, clamp, lerp, constants
├── App.tsx
└── main.tsx
```

## Credenciais de Login

| Usuario | Senha |
|---------|-------|
| funcionario | func123 |

## Gitflow

Consulte [GITFLOW.md](./GITFLOW.md) para o guia completo de branching strategy e commits.
