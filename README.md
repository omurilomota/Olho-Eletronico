# Olho Eletronico

Sistema de simulacao e monitoramento para a Copa do Mundo FIFA 2026, com dois modulos principais: **SAOT Lab** (analise de impedimento 3D) e **ICC Command Center** (centro de comando operacional).

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
- Visualizacao da linha de impedimento com preenchimento de zona, linha tracejada e margem

### ICC Command Center

- Mapa de Gêmeos Digitais com simulacao de 600 torcedores e deteccao de congestamento
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
```

Acesse `http://localhost:5173`.

## Estrutura do Projeto

```
src/
├── modules/
│   ├── saot/               # Modulo SAOT Lab (3D + Engine)
│   │   ├── components/     # Player, Ball, Pitch, Goals, Stadium, CityBackground, etc.
│   │   ├── hooks/          # useSimulation, useDragPlayer
│   │   ├── services/       # OffsideCalculator
│   │   ├── store/          # useSaotStore, usePlaybookStore
│   │   └── types/          # Tipos do modulo
│   └── icc/                # Modulo ICC Command Center
│       ├── components/     # DigitalTwinMap, AIChat, SalesPanel, etc.
│       ├── hooks/          # useCrowdSimulation
│       ├── services/       # mockAIResponses
│       └── store/          # useIccStore
├── shared/                 # Codigo compartilhado
│   ├── components/         # Layout, LoginScreen, ErrorBoundary, DataOverlay
│   ├── hooks/              # useDebounce, usePerformance
│   ├── types/              # Position, Vector3, etc.
│   └── utils/              # formatCm, clamp, lerp, constants
├── App.tsx
└── main.tsx
```

## Credenciais de Login

| Usuario | Senha |
|---------|-------|
| funcionario | func123 |
