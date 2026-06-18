# AGENTS.md — Guia de Conduta para IAs

Este documento e o roteiro que toda IA (assistente, agente, copiloto) deve seguir ao trabalhar neste projeto. Leia antes de escrever qualquer codigo.

---

## 1. Identidade do Projeto

**Olho Eletronico** — Sistema de simulacao e monitoramento para a Copa do Mundo FIFA 2026.

Dois modulos principais:
- **SAOT Lab**: Analise de impedimento 3D com campo, jogadores, goles e estadio
- **ICC Command Center**: Centro de comando com gemeos digitais, IA tatica e paineis operacionais

---

## 2. Principios Eticos

### 2.1 Transparencia
- **Nunca minta** sobre o que foi feito ou nao foi feito
- Se algo deu errado, diga. Se nao tem certeza, diga
- Nao invente funcionalidades que nao existem
- Nao prometa resultados sem verificar (build + testes)

### 2.2 Seguranca
- **NUNCA** commite secrets, chaves API, senhas ou credenciais
- Nao exponha dados sensiveis em logs ou commits
- Credenciais do projeto: `funcionario / func123` (apenas para demo local)

### 2.3 Respeito ao Trabalho
- Nao reescreva codigo funcional sem necessidade
- Nao delete funcionalidade existente sem perguntar
- Nao force-push em branches compartilhadas
- Nao reescreva historico ja publicado

### 2.4 Honestidade Tecnica
- Se uma solucao e complexa, explique os trade-offs
- Se o usuario pede algo que viola boas praticas, explique o porquê
- Prefira solucoes simples e verificaveis

---

## 3. Stack Tecnico

| Tecnologia | Versao | Papel |
|-----------|--------|-------|
| React | 19 | UI |
| TypeScript | 6 (strict) | Tipagem |
| Vite | 8 | Bundler |
| Zustand | 5 | Estado |
| @react-three/fiber | 9 | 3D |
| @react-three/drei | 10 | Helpers 3D |
| Three.js | 0.184 | Engine 3D |
| Recharts | 3 | Graficos |
| Tailwind CSS | 4 | Estilos |
| Vitest | 4 | Testes |

---

## 4. Arquitetura

```
src/
├── modules/
│   ├── saot/               # SAOT Lab (3D + Engine)
│   │   ├── components/     # Player, Ball, Pitch, Goals, Stadium, etc.
│   │   ├── hooks/          # useSimulation
│   │   ├── services/       # OffsideCalculator (pura)
│   │   ├── store/          # useSaotStore, usePlaybookStore
│   │   └── types/
│   └── icc/                # ICC Command Center
│       ├── components/     # DigitalTwinMap, AIChat, SalesPanel, etc.
│       ├── hooks/          # useCrowdSimulation
│       ├── services/       # mockAIResponses
│       └── store/          # useIccStore
├── shared/                 # Codigo compartilhado
│   ├── components/         # Layout, LoginScreen, ErrorBoundary, DataOverlay
│   ├── hooks/              # usePerformance
│   ├── types/
│   └── utils/              # constants
├── __tests__/              # Testes unitarios (vitest)
├── App.tsx
└── main.tsx
```

### Regras de Arquitetura
- Componentes 3D: procedural (sem GLTF), geometria via Three.js
- Estado: Zustand (v5) com actions separadas de state
- TypeScript strict: `verbatimModuleSyntax: true`, `noImplicitAny: true`
- Componentes React: memo() em componentes 3D pesados
- Cleanup: dispose() de geometrias e materiais no useEffect return

---

## 5. Gitflow — Obrigatorio

Consulte `GITFLOW.md` para o guia completo.

### Resumo das Regras

1. **NUNCA** commite direto em `main` ou `develop`
2. Toda alteracao vai em branch `feat/*`, `fix/*` ou `hotfix/*`
3. Merge com `--no-ff` para historico claro
4. Build e testes devem passar antes do commit
5. Branch feature e deletada apos merge

### Convencoes de Commit (Gitmoji)

```
emoji tipo(escopo): descricao curta

Exemplos:
✨ feat(saot): goleiro chuta bola para atacante
🐛 fix(pitch): clareia gramado para verde vibrante
📝 docs: atualiza README com campos atuais
♻️ refactor(icc): separa componentes do chat
🧪 test(saot): adiciona testes para useSimulation
```

---

## 6. Comandos Essenciais

```bash
# Desenvolvimento
npm run dev                    # localhost:5173

# Build
npm run build                  # tsc -b && vite build

# Testes
npm run test                   # vitest run

# Preview
npm run preview                # preview da build
```

**Antes de commitar, SEMPRE rode:**
```bash
npm run build && npm run test
```

---

## 7. Regras de Codigo

### TypeScript
- Nao use `any` — prefira tipos genericos ou `unknown`
- Use `import type` para imports somente de tipo (`verbatimModuleSyntax`)
- Funcoes puras para calculos (ex: OffsideCalculator)

### React
- Componentes com funcao (nunca classe)
- `useCallback`/`useMemo` em componentes 3D
- Cleanup de efeitos colaterais em `useEffect` return
- Props: interfaces, nao types inline

### Three.js / R3F
- Geometrias procedural (sem GLTF)
- dispose() de geometrias e materiais no cleanup
- DragControls via `@react-three/drei`
- Sombras: usar `castShadow` e `receiveShadow` nos meshes corretos

### Testes
- Testes unitarios com vitest
- Testar servicos puros (OffsideCalculator)
- Testar stores (useSaotStore, useIccStore)
- Testar mockAIResponses

---

## 8. Fluxo de Trabalho da IA

### Ao Receber uma Tarefa

1. **Leia o contexto**: git log, git status, arquivos relevantes
2. **Entenda o pedido**: pergunte se nao tiver certeza
3. **Crie a branch**: `git checkout develop && git checkout -b feat/x`
4. **Implemente**: siga o estilo existente do projeto
5. **Verifique**: `npm run build && npm run test`
6. **Commite**: siga Gitmoji, atomico, descritivo
7. **Informe**: diga ao usuario o que foi feito e onde

### Ao Encontrar um Bug

1. Reproduza o problema
2. Identifique a causa raiz
3. Crie branch `fix/*`
4. Corrija com teste que reproduz o bug
5. Verifique: build + testes
6. Commite e faca merge

### Quando Nao Tiver Certeza

- Pergunte ao usuario
- Explique as opcoes e trade-offs
- Nao assuma — verifique

---

## 9. O que NAO Fazer

| Proibido | Motivo |
|----------|--------|
| Commit direto em main/develop | Viola Gitflow |
| Forcar push | Pode quebrar trabalho de outros |
| Deletar branches remotas | Pode afetar outros desenvolvedores |
| Ignorar testes | Compromete estabilidade |
| Adicionar dependencias sem necessidade | Infla o bundle |
| Usar `any` | Remove seguranca de tipos |
| Commitar secrets | Risco de seguranca |
| Reescrever historico | Perde rastreabilidade |
| Responder sem verificar | Gera informacao incorreta |

---

## 10. Credenciais de Demo

| Usuario | Senha |
|---------|-------|
| funcionario | func123 |

Estas credenciais sao apenas para demonstracao local. Nao sao secrets reais.

---

## 11. Branches

| Branch | Descricao | Status |
|--------|-----------|--------|
| `main` | Versao estable | Ativa |
| `develop` | Integracao de features | Ativa |
| `feat/city-background` | Cidade procedural (feature futura) | Pendente |

---

## 12. Quando o Usuario Pedir para Committar

1. Verifique `git status` e `git diff`
2. Se esta em `main` ou `develop`:
   - Crie automaticamente uma branch feature/fix
   - Explique o que esta fazendo
3. Se ja esta em branch feature/fix:
   - Faca o commit
4. Nao faca push sem o usuario pedir explicitamente

---

## 13. Notas Importantes

- O projeto ainda esta em desenvolvimento ativo
- A branch `feat/city-background` tem a cidade procedural salva para uso futuro
- O campo 3D tem dimensoes 37x22 (unidades = metros)
- O goleiro inicia junto a bola e e ele quem da o passe
- Todos os componentes 3D sao procedurais (sem modelos externos)
