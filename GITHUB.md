# Guia Gitflow + GitHub — Olho Eletronico

Este documento orienta assistentes de IA (e desenvolvedores humanos) a usarem Gitflow e GitHub de forma etica e profissional neste projeto.

## Regra de Ouro

> **NUNCA commite direto em `main` ou `develop`.** Todo trabalho novo acontece em branches feature/fix/hotfix.

## Estrutura de Branches

```
main          ← release estavel, protegida no GitHub
  └── develop ← integracao de features
        ├── feat/nome-da-feature
        ├── fix/nome-do-fix
        └── hotfix/nome-do-hotfix
```

## Fluxo de Trabalho

### 1. Feature Nova (feat/*)

```
git checkout develop
git pull origin develop
git checkout -b feat/nome-da-feature

# ... implementar ...

git add .
git commit -m "✨ feat(modulo): descricao"

git checkout develop
git merge --no-ff feat/nome-da-feature
git push origin develop

git branch -d feat/nome-da-feature
```

### 2. Bug Fix (fix/*)

```
git checkout develop
git pull origin develop
git checkout -b fix/nome-do-fix

# ... corrigir ...

git add .
git commit -m "🐛 fix(modulo): descricao"

git checkout develop
git merge --no-ff fix/nome-do-fix
git push origin develop

git branch -d fix/nome-do-fix
```

### 3. Hotfix (hotfix/*)

```
git checkout main
git pull origin main
git checkout -b hotfix/nome-do-hotfix

# ... corrigir ...

git add .
git commit -m "🐛 fix(modulo): descricao urgente"

git checkout main
git merge --no-ff hotfix/nome-do-hotfix
git push origin main

git checkout develop
git merge --no-ff hotfix/nome-do-hotfix
git push origin develop

git branch -d hotfix/nome-do-hotfix
```

### 4. Release

```
git checkout develop
git pull origin develop
git checkout -b release/v1.x.x

# ... testes finais, documentacao ...

git checkout main
git merge --no-ff release/v1.x.x
git tag -a v1.x.x -m "🔖 release: v1.x.x"
git push origin main --tags

git checkout develop
git merge --no-ff release/v1.x.x
git push origin develop

git branch -d release/v1.x.x
```

---

## Protecao de Branches no GitHub

As branches `main` e `develop` estao protegidas via **Rulesets** no GitHub. Isso significa que certas acoes sao bloqueadas direto no servidor.

### Regras Ativadas

| Regra | O que faz | Branches afetadas |
|-------|-----------|-------------------|
| **Block force pushes** | Impede `git push --force` | `main`, `develop` |
| **Restrict deletions** | Impede deletar branch via GitHub | `main`, `develop` |
| **Require pull request** | Exige PR com 1 approval antes de merge | `main`, `develop` |

### Como Funciona na Pratica

1. **Nao e possivel commite direto** em `main` ou `develop` via GitHub
2. **Toda alteracao** precisa de Pull Request com 1 approval
3. **Force push e bloqueado** — nao da pra reescrever historico
4. **Deletion e bloqueada** — branches so sao deletadas localmente

### Fluxo Correto (com protecao)

```
1. Criar branch feat/* ou fix/* a partir de develop
2. Implementar e commitar
3. Push para origin
4. Abrir Pull Request no GitHub (target: develop)
5. Aguardar 1 approval
6. Merge via GitHub (squash ou merge commit)
7. Branch automaticamente deletada ou deletar manualmente
```

### O que Nao Fazer

| Acao | Por que e bloqueada |
|------|---------------------|
| `git push origin main` | Branch protegida, precisa de PR |
| `git push --force` | Force push bloqueado |
| `git branch -d main` | Deletion restrita |
| Commit direto no develop | Precisa de PR + approval |

### Nota sobre Repositorios Privados

> Regrasets so sao enforced em repositorios **GitHub Team** ou superior. Em contas Free/Person, as regras funcionam apenas como configuracao visual. Para protecao real, considere GitHub Team ou Pro.

---

## Convencoes de Commit (Gitmoji)

| Emoji | Tipo | Quando usar |
|-------|------|-------------|
| `🎉` | init | Commit inicial |
| `🔧` | config | Configuracao de ferramentas |
| `✨` | feat | Nova funcionalidade |
| `🐛` | fix | Correcao de bug |
| `♻️` | refactor | Refatoracao sem mudar comportamento |
| `📝` | docs | Documentacao |
| `🚀` | perf | Melhoria de performance |
| `🧪` | test | Adicionar/corrigir testes |
| `🔒` | security | Seguranca |
| `🔖` | release | Release tag |
| `⬆️` | deps | Atualizar dependencias |
| `🎨` | style | Formatacao, sem mudanca logica |

### Formato

```
<emoji> <tipo>(<escopo>): <descricao curta em minusculas>

Exemplos:
✨ feat(saot): goleiro chuta bola para atacante
🐛 fix(pitch): clareia gramado para verde vibrante
📝 docs: atualiza README com campos atuais
♻️ refactor(icc): separa componentes do chat
```

## Regras para IA

### O que FAZER

1. **Sempre criar branch** antes de qualquer modificacao
2. **Commit Atomico** — uma logica por commit
3. **Verificar build** antes de commitar: `npm run build`
4. **Verificar testes** antes de commitar: `npm run test`
5. **Merge com --no-ff** para manter historico claro
6. **Deletar branch** apos merge
7. **Pull antes de push** para evitar conflitos
8. **Ler o estado atual** (git log, git status, git diff) antes de agir
9. **Seguir o estilo** existente do projeto (TypeScript strict, SOLID, Gitmoji)

### O que NAO fazer

1. **NUNCA** commite direto em `main` ou `develop`
2. **NUNCA** force push em branches compartilhadas
3. **NUNCA** mude historico ja publicado
4. **NUNCA** pule testes ou lint para "ser mais rapido"
5. **NUNCA** commite secrets, chaves ou credenciais
6. **NUNCA** ignore conflitos de merge — resolva-os
7. **NUNCA** assuma que algo funciona sem verificar (build + testes)

## Quando o Usuario Pedir para Committar

1. Verifique `git status` e `git diff`
2. Se esta em `main` ou `develop` e tem alteracoes:
   - **Pergunte** ao usuario se quer criar uma branch
   - Ou crie automaticamente seguindo o fluxo
3. Se ja esta em uma branch feature/fix:
   - Faca o commit normalmente
   - Nao faca push sem pedir

## Exemplo Completo

Usuario: "adicione um botao de exportar relatorio"

```
1. git checkout develop
2. git checkout -b feat/export-relatorio
3. Implementar o botao
4. npm run build  → OK
5. npm run test   → OK
6. git add .
7. git commit -m "✨ feat(icc): adiciona botao de exportar relatorio"
8. git push origin feat/export-relatorio
9. Abrir PR no GitHub (feat/export-relatorio → develop)
10. Aguardar approval
11. Merge via GitHub
12. Deletar branch local: git branch -d feat/export-relatorio
```

## Conflitos de Merge

1. `git merge` vai indicar conflito
2. Abra os arquivos e resolva os marks `<<<<<<<` / `=======` / `>>>>>>>`
3. `git add <arquivo>` apos resolver
4. `git commit` (git fara o merge commit automaticamente)
5. Teste novamente: `npm run build && npm run test`

## Commits de Merge

Para merges de branches feature, use o `--no-ff`:

```bash
git merge --no-ff feat/nome-da-feature -m "🔀 merge: integra feat/nome-da-feature no develop"
```

## Referencia Rapida

| Comando | Quando |
|---------|--------|
| `git checkout -b feat/x` | Criar feature branch |
| `git merge --no-ff branch` | Merge preservando historico |
| `git rebase develop` | Atualizar feature com develop |
| `git cherry-pick <hash>` | Copiar commit especifico |
| `git stash` | Guardar alteracoes temporariamente |
| `git stash pop` | Recuperar alteracoes guardadas |
