<div align="center">

# Olho Eletronico

**Sistema de simulacao e monitoramento para a Copa do Mundo FIFA 2026**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

</div>

---

## Visao Geral

O **Olho Eletronico** e um sistema web de alta performance para simulacao e monitoramento em tempo real da Copa do Mundo FIFA 2026. Possui dois modulos principais:

| Modulo | Descricao |
|--------|-----------|
| **SAOT Lab** | Analise de impedimento 3D interativa com campo, jogadores, goles e estadio procedurais |
| **ICC Command Center** | Centro de comando com gemeos digitais, IA tatica e paineis operacionais |

---

## Pre-requisitos

- [Node.js](https://nodejs.org/) >= 18
- npm >= 9

---

## Como Rodar

```bash
# Clonar o repositorio
git clone https://github.com/seu-usuario/olho-eletronico.git
cd olho-eletronico

# Instalar dependencias
npm install

# Iniciar desenvolvimento
npm run dev

# Acessar no navegador
# http://localhost:5173
```

---

## Variaveis de Ambiente

Copie o `.env.example` para `.env.local` e preencha com suas credenciais Supabase:

```bash
cp .env.example .env.local
```

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publicavel do Supabase | `sb_publishable_xxx...` |

> As credenciais sao necessarias apenas para o multiplayer. O resto do sistema funciona sem Supabase.

---

## Funcionalidades

### SAOT Lab (Simulacao de Impedimento)

- Cena 3D interativa com campo (37x22m), goles e estadio completo
- Jogadores humanos com animacao articulada (corpo, bracos, pernas, cabeca)
- Calculo de impedimento milimetrico (margem em cm)
- 5 cenarios pre-definidos (impedimento normal, marginal, reverso, legal atras, legal nivel)
- Modo livre para arrastar jogadores e configurar posicoes
- Motor de simulacao com play/pause/reset/seek/velocidade ajustavel
- 5 presets de camera (Broadcast, Tactical, Gol Esquerda, Gol Direita, Livre)
- Modo Playbook com 5 jogadas pre-definidas e navegacao passo a passo
- Linha de impedimento visual (vermelha no defensor + azul no atacante)
- Sincronizacao multiplayer em tempo real (cursor, jogadores, cenarios, playbook)

### ICC Command Center (Centro de Comando)

- Mapa de Gemeos Digitais com simulacao de 600 torcedores e deteccao de congestamento
- Assistente tatico IA com efeito typewriter e graficos de resposta
- Indicador de risco circular (0-100)
- Widget de clima com 3 abas (Agora, Semanal, Mensal)
- Painel de status dos sistemas (Cameras, IoT, 5G, IA, Backup, GPS)
- Painel comercial com receita por categoria e ranking de lojas
- Ticker de operacoes ao vivo com niveis de severidade

### Multiplayer (Colaborativo)

- Sessoes colaborativas com ID compartilhavel (6 caracteres)
- Presenca em tempo real (quem esta na sessao)
- Sincronizacao de cursores 3D entre participantes
- Sincronizacao de posicoes de jogadores (arrastar e soltar)
- Sincronizacao de cenarios e playbook
- Roles: admin (criador) e viewer (participante)

### Compartilhado

- Tela de login com glass-morphism e animacao
- Design system com efeitos glass, gradientes, animacoes customizadas
- Error Boundary com retry por modulo
- Data Overlay com FPS, triangles e draw calls em tempo real
- Suporte a 3 idiomas (PT-BR, EN, ES) via i18next
- PWA (Progressive Web App) com cache offline
- Exportacao de relatorios em PDF

---

## Stack Tecnico

| Tecnologia | Versao | Papel |
|-----------|--------|-------|
| [React](https://react.dev/) | 19 | UI |
| [TypeScript](https://www.typescriptlang.org/) | 6 (strict) | Tipagem |
| [Vite](https://vitejs.dev/) | 8 | Bundler |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | Estado |
| [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) | 9 | Renderizacao 3D |
| [@react-three/drei](https://github.com/pmndrs/drei) | 10 | Helpers 3D |
| [Three.js](https://threejs.org/) | 0.184 | Engine 3D |
| [Recharts](https://recharts.org/) | 3 | Graficos |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Estilos |
| [Supabase](https://supabase.com/) | 2.108 | Multiplayer (Realtime) |
| [Vitest](https://vitest.dev/) | 4 | Testes unitarios |
| [Playwright](https://playwright.dev/) | 1.61 | Testes E2E |

---

## Estrutura do Projeto

```
src/
├── modules/
│   ├── saot/                   # SAOT Lab (3D + Engine)
│   │   ├── components/         # Player, Ball, Pitch, Goals, Stadium, etc.
│   │   ├── hooks/              # useSimulation, useDragPlayer
│   │   ├── services/           # OffsideCalculator (pura)
│   │   └── store/              # useSaotStore, usePlaybookStore
│   ├── icc/                    # ICC Command Center
│   │   ├── components/         # DigitalTwinMap, AIChat, SalesPanel, etc.
│   │   ├── hooks/              # useCrowdSimulation
│   │   ├── services/           # mockAIResponses
│   │   └── store/              # useIccStore
│   └── multiplayer/            # Sistema multiplayer (Supabase Realtime)
│       ├── components/         # SessionBar, SessionModal
│       ├── services/           # supabaseClient, useRealtimeChannel, useRealtimeSync
│       └── store/              # useMultiplayerStore
├── shared/
│   ├── components/             # Layout, LoginScreen, ErrorBoundary, DataOverlay
│   ├── hooks/                  # usePerformance
│   ├── types/                  # Tipos compartilhados
│   └── utils/                  # constants, helpers
├── i18n/
│   └── locales/                # pt-BR.json, en.json, es.json
├── __tests__/                  # Testes unitarios (vitest)
├── e2e/                        # Testes E2E (playwright)
├── App.tsx                     # Root component
└── main.tsx                    # Entry point
```

---

## Scripts

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Iniciar servidor de desenvolvimento |
| `npm run build` | Build para producao (`tsc -b && vite build`) |
| `npm run preview` | Preview da build de producao |
| `npm run lint` | Verificar codigo com ESLint |
| `npm run test` | Rodar testes unitarios (vitest) |
| `npm run test:watch` | Rodar testes em modo watch |
| `npm run test:e2e` | Rodar testes E2E (playwright) |
| `npm run test:e2e:ui` | Rodar testes E2E com interface grafica |

---

## Testes

### Unitarios (Vitest)

```bash
npm run test
```

Cobertos: OffsideCalculator, useSaotStore, useIccStore, usePlaybookStore, mockAIResponses, constants.

### E2E (Playwright)

```bash
npm run test:e2e
```

Cobertos: fluxo de login, SAOT Lab, ICC Command Center.

---

## Branches

| Branch | Descricao | Status |
|--------|-----------|--------|
| `main` | Versao estable do projeto | Ativa |
| `develop` | Integracao de features | Ativa |
| `feat/city-background` | Cidade procedural ao redor do estadio | Pendente |

---

## Credenciais de Login (Demo)

| Usuario | Senha |
|---------|-------|
| `funcionario` | `func123` |

> Estas credenciais sao apenas para demonstracao local. Nao sao secrets reais.

---

## Contribuindo

Consulte [GITFLOW.md](./GITFLOW.md) para o guia completo de branching strategy e commits.

### Convencoes de Commit

Este projeto usa [Gitmoji](https://gitmoji.dev/) para commits:

```
emoji tipo(escopo): descricao curta

Exemplos:
✨ feat(saot): goleiro chuta bola para atacante
🐛 fix(pitch): clareia gramado para verde vibrante
📝 docs: atualiza README com campos atuais
♻️ refactor(icc): separa componentes do chat
🧪 test(saot): adiciona testes para useSimulation
```

### Fluxo

1. Criar branch `feat/*` ou `fix/*` a partir de `develop`
2. Implementar seguindo o estilo existente
3. Rodar `npm run build && npm run test`
4. Commitar com Gitmoji
5. Merge com `--no-ff` no `develop`

---

## Regras de Codigo

- **TypeScript strict**: `verbatimModuleSyntax: true`, `noImplicitAny: true`
- **Componentes 3D**: procedural (sem GLTF), geometria via Three.js
- **Estado**: Zustand (v5) com actions separadas de state
- **Testes**: unitarios com vitest, E2E com playwright
- **Nunca** commite secrets, chaves API ou credenciais

---

## Licenca

Este projeto esta licenciado sob a [Licenca MIT](./LICENSE).

---

<div align="center">

Feito com dedicacao para a Copa do Mundo FIFA 2026

</div>
