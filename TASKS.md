# TASKS.md — Tarefas Pendentes

Lista de tarefas a serem executadas no projeto Olho Eletronico. Organizadas por prioridade e modulo.

---

## Prioridade Alta

### Multiplayer — Corrigir instabilidade

- [x] Corrigir state leak: `isConnected` fica `true` apos canal morrer
- [x] Tratar erros de conexao Supabase (CHANNEL_ERROR, TIMED_OUT, CLOSED)
- [x] Feedback visual no SessionModal (Conectando..., erros)
- [x] Limpeza de cursors remotos quando participant sai
- [x] Conectar sendScenario e sendPlaybook
- [x] Generation counter para StrictMode
- [x] Mover canal para MultiplayerProvider (fora do SAOTLab)
- [x] Remover useRealtimeSync/useRealtimeChannel (logica no Provider)
- [x] Botao "Tentar novamente" no SessionModal quando erro
- [x] Adicionar reconexao automatica (3 tentativas, backoff exponencial)
- [x] **Corrigir identidade: adicionar `localUserId` ao store (antes: `participants[0]`)**
- [x] **Remover `channel.track()` do `sendCursor` (causava spam de presenca)**
- [x] **Refatorar SAOTLab para usar `useMultiplayer()` context**
- [x] **Deletar arquivos obsoletos: `useRealtimeSync.ts`, `useRealtimeChannel.ts`**
- [ ] **Mover `MultiplayerProvider` para acima do `SessionBar` no Layout (provider unico)**
- [ ] **Remover console.logs do MultiplayerProvider (11 statements) — usar flag `import.meta.env.DEV`**
- [ ] Investigar cookie `__cf_bm` (Cloudflare Bot Management) bloqueando WebSocket

### Seguranca

- [ ] **S-1: Mover credenciais hardcoded do LoginScreen para env vars** (`src/shared/components/LoginScreen.tsx:18`)
- [ ] **S-2: Instalar DOMPurify e sanitizar `dangerouslySetInnerHTML` no AIChat** (`src/modules/icc/components/AIChat.tsx:225,293`)
- [ ] **S-3: Documentar que auth via localStorage e so para demo** (`src/App.tsx:10,18`)
- [ ] **S-4: Verificar que Supabase key nao e `service_role`** (`.env.local`)

### CI/CD

- [ ] GitHub Actions: lint + build + testes no push/PR
- [ ] Deploy automatico no Vercel (ja configurado, falta o action)

---

## Prioridade Media

### Acessibilidade

- [ ] **A-1: Adicionar `aria-label` em todos os botoes icon-only** (Layout, ControlPanel, SessionModal, etc.)
- [ ] **A-2: Focus management no SessionModal** — `role="dialog"`, `aria-modal="true"`, focus trap
- [ ] **A-3: Keyboard navigation para tab switches** — `role="tablist"`, `aria-selected`, setas
- [ ] **A-4: Adicionar `aria-label` no LanguageSwitcher** — cada botao de lingua
- [ ] **A-5: Tornar Toggle acessivel** — `role="switch"`, `aria-checked` (`ControlPanel.tsx:207-215`)

### i18n

- [ ] **I-1: Adicionar chave `connection_failed` em EN e ES** (ja existe em pt-BR)
- [ ] **I-2: Mover strings hardcoded do mockAIResponses para i18n** (`src/modules/icc/services/mockAIResponses.ts:12-301`)
- [ ] **I-3: Mover strings hardcoded do reportGenerator para i18n** (`src/shared/services/reportGenerator.ts:20-77`)
- [ ] **I-4: Tornar `SUGGESTED_PROMPTS` reativo a mudanca de lingua** (`mockAIResponses.ts:397-400`)
- [ ] **I-5: Atualizar nomes do StatusPanel quando lingua muda** (`StatusPanel.tsx:13-20`)
- [ ] **I-6: Mover alerta hardcoded do useCrowdSimulation para i18n** (`useCrowdSimulation.ts:225`)

### Performance

- [ ] **P-1: Code-splitting com `React.lazy()`** — SAOTLab e ICCCommandCenter em lazy chunks (`App.tsx:4-5`)
- [ ] **P-2: Adicionar `memo()` em componentes 3D pesados** — Pitch, Goals, Stadium, Ball, OffsideLine, Environment, RemoteCursor
- [ ] **P-3: Corrigir DataOverlay RAF loop** — usar R3F `useFrame` em vez de RAF separado (`DataOverlay.tsx:23-46`)
- [ ] **P-4: Remover metricas falsas (triangles/drawCalls)** — conectar a `renderer.info` ou remover (`DataOverlay.tsx:48-54`)
- [ ] **P-5: Memoizar geometria cloned em Goals.tsx** — `sideNetGeom.clone()` a cada render (`Goals.tsx:141,146`)
- [ ] **P-6: Limpar canvas textures** — `createBallTexture` e `createGrassTexture` (`Ball.tsx:12`, `Pitch.tsx:4`)

### Testes

- [ ] **T-1: Testes unitarios para `useMultiplayerStore`** — 8 actions, localUserId, updateCursor
- [ ] **T-2: Testes unitarios para `MultiplayerProvider`** — mock Supabase, context, send functions
- [ ] **T-3: Testes para `useSimulation`** — generateFrame, play/pause/reset/seek, easing
- [ ] **T-4: Testes para `useCrowdSimulation`** — updatePoint, checkCongestion, pushOutOfField
- [ ] **T-5: Testes para `useNotificationStore`** — 5 actions sem cobertura
- [ ] **T-6: Testes E2E para fluxo multiplayer** — criar sessao, entrar, sair
- [ ] **T-7: Teste de completude i18n** — comparar keys de pt-BR, en, es
- [ ] **T-8: Aumentar cobertura dos testes existentes**

---

## Prioridade Baixa

### City Background

- [ ] Rebase da branch `feat/city-background` no develop
- [ ] Resolver conflitos (73 arquivos divergem)
- [ ] Atualizar componente procedural com stack atual (React 19, Three.js 0.184)
- [ ] Integrar cidade no SAOTLab (toggle ligado/desligado)

### Dead Code / Limpeza

- [ ] **D-1: Remover `isPlaying` do usePlaybookStore** (nunca usado externamente)
- [ ] **D-2: Unificar tipo `Position`** — shared/types vs useSaotStore (duplicado)
- [ ] **D-3: Remover `ballPosition`/`setBallPosition` do useSaotStore** (nunca usado)
- [ ] **D-4: Deletar diretorio `supabase/` vazio**
- [ ] **D-5: Usar constantes de `constants.ts` no Pitch.tsx** (valores hardcoded duplicados)
- [ ] **D-6: Remover `formatCm` se nao for usar** (exportado mas nao importado)

### Bugs Menores

- [ ] **B-1: Corrigir `renderMarkdown` HTML invalido** — regex produz tags `<p>` sem fechamento (`AIChat.tsx:39-45`)
- [ ] **B-2: Tipar `useRef` no CameraController** — substituir `useRef<any>` por tipo correto (`CameraController.tsx:38`)
- [ ] **B-3: Limpar timeouts no SessionBar** — `setTimeout` sem cleanup no unmount (`SessionBar.tsx:19,22`)
- [ ] **B-4: Limpar timeout no ExportButton** — `setTimeout` sem cleanup (`ExportButton.tsx:19`)
- [ ] **B-5: Parar RAF loop quando pausado** — `useCrowdSimulation` continua rodando (`useCrowdSimulation.ts:197-201`)
- [ ] **B-6: Corrigir `removeEventListener` bug** — DigitalTwinMap usa funcao anonima (`DigitalTwinMap.tsx`)
- [ ] **B-7: Adicionar Escape key para fechar modais** — NotificationBell (`NotificationBell.tsx:20-28`)
- [ ] **B-8: Corrigir i18n keys baseadas em indice** — PlaybookMode (`PlaybookMode.tsx:135`)

### Codigo e Qualidade

- [ ] **Q-1: Reduzir `as unknown as` casts no MultiplayerProvider** — tipar presenca Supabase corretamente
- [ ] **Q-2: Corrigir `as unknown as` no reportGenerator** — tipar jsPDF-autotable (`reportGenerator.ts:48,68`)
- [ ] **Q-3: Wraps console.logs em `import.meta.env.DEV`** — 10 statements no MultiplayerProvider
- [ ] **Q-4: Internacionalizar mensagens de erro** — hardcoded PT no MultiplayerProvider
- [ ] **Q-5: Corrigir botao Reset hardcoded em EN** — DigitalTwinMap (`DigitalTwinMap.tsx:189`)
- [ ] **Q-6: Otimizar `CAMERA_PRESETS`** — definir fora do componente ou usar `useMemo` (`ControlPanel.tsx:52-58`)
- [ ] **Q-7: Usar ref para `animId` no DataOverlay** — closure fragil (`DataOverlay.tsx:44`)

### Documentacao

- [ ] Atualizar AGENTS.md com modulo multiplayer e notifications
- [ ] Adicionar JSDoc em hooks e servicos principais
- [ ] Documentar arquitetura do MultiplayerProvider
- [ ] Atualizar README.md com modulos atuais
- [ ] Adicionar comentarios em geometria 3D complexa (Goals, Pitch, Stadium)

### Seguranca Avancada

- [ ] Adicionar Content Security Policy (CSP) headers no `vercel.json`
- [ ] Integrar Sentry/LogRocket para error tracking em producao
- [ ] Adicionar debounce no botao de envio do AIChat (rate limiting)

### Design

- [ ] Responsividade mobile (atualmente desktop-only)
- [ ] Tema light (atualmente dark-only)
- [ ] Animacoes de transicao entre abas
- [ ] Adicionar "Skip to content" link para acessibilidade

### Features Futuras

- [ ] Chat textual entre participantes da sessao
- [ ] Gravacao de sessoes (playback)
- [ ] Exportar sessao como video/GIF
- [ ] Modo observador (viewer pode ver mas nao mover)
- [ ] Senha de sessao (privacidade)
- [ ] Service worker offline fallback
- [ ] PWA completo (ja configurado via vite-plugin-pwa)

---

## Concluido

| Data | Tarefa | Branch/PR |
|------|--------|-----------|
| 2026-06-20 | Multiplayer: localUserId, sendCursor fix, reconexao 3x, SAOTLab refactor | `fix/multiplayer-identity` |
| 2026-06-20 | Deletar useRealtimeSync/useRealtimeChannel (dual channel bug) | `fix/multiplayer-identity` |
| 2026-06-19 | Multiplayer: conexao, erros, sync | `feat/multiplayer-fix-and-readme` |
| 2026-06-19 | README + LICENSE MIT | `feat/multiplayer-fix-and-readme` |
| 2026-06-19 | GITHUB.md (renomeado de GITFLOW.md) | `feat/multiplayer-fix-and-readme` |
| 2026-06-19 | Deletar branches obsoletas | direto no GitHub |
| 2026-06-19 | StrictMode fix (generation counter) | `feat/multiplayer-fix-and-readme` |
| 2026-06-19 | Sessao nao fecha apos criacao | `feat/multiplayer-fix-and-readme` |
| 2026-06-19 | MultiplayerProvider (canal fora do SAOTLab) | `feat/multiplayer-fix-and-readme` |
| 2026-06-19 | Remover useRealtimeSync/useRealtimeChannel | `feat/multiplayer-fix-and-readme` |
| 2026-06-19 | Botao "Tentar novamente" no SessionModal | `feat/multiplayer-fix-and-readme` |
