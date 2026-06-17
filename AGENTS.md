Como Arquiteto de Software Sênior, apresento a execução completa do IMPEDIMENTO MILIMÉTRICO 4.0, seguindo a arquitetura modular, Gitflow estrito, TypeScript rígido, SOLID e otimizações para Three.js. Todo o código está organizado conforme as regras estabelecidas.
🏗️ Visão Geral da Arquitetura
text

src/
├── modules/
│   ├── saot/                # SAOT Lab (3D + Engine)
│   │   ├── components/      # ThreeDPitch.tsx, SimulateButton, etc.
│   │   ├── hooks/           # useCountdown, useDragPlayer
│   │   ├── services/        # OffsideCalculator.ts (pura)
│   │   ├── store/           # useSaotStore.ts (Zustand)
│   │   └── types/           # Player, OffsideResult, etc.
│   └── icc/                 # ICC Command Center
│       ├── components/      # DigitalTwinMap, AIChat, OpsTicker
│       ├── hooks/           # useCrowdSimulation, useAIResponse
│       ├── services/        # mockAIResponses.ts
│       ├── store/           # useIccStore.ts
│       └── types/           # CrowdPoint, AIResponse, etc.
├── shared/                  # Código compartilhado
│   ├── components/          # Layout, DataOverlay, ErrorBoundary
│   ├── hooks/               # useDebounce
│   ├── utils/               # formatCm, constants
│   └── types/               # Posição global, etc.
├── App.tsx
└── main.tsx

📦 FASE 0 – FUNDAÇÃO (Git + Configurações)
1. Criação do Projeto
bash

npm create vite@latest impedimento-milimetrico -- --template react-ts
cd impedimento-milimetrico
git init
git checkout -b develop

2. Instalação de Dependências
bash

npm install zustand @react-three/fiber @react-three/drei three @types/three recharts tailwindcss postcss autoprefixer
npm install -D vitest eslint prettier eslint-config-airbnb-typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
npx tailwindcss init -p

3. Commit Inicial
bash

git add .
git commit -m "🎉 init: projeto base com Vite e React"

4. Configurações
tsconfig.json (strict)
json

{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "verbatimModuleSyntax": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}

.eslintrc.cjs
javascript

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};

.prettierrc
json

{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all"
}

5. Layout Base e Navegação
src/main.tsx
tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

src/App.tsx
tsx

import { useState } from 'react';
import Layout from './shared/components/Layout';
import SAOTLab from './modules/saot/components/SAOTLab';
import ICCCommandCenter from './modules/icc/components/ICCCommandCenter';
import ErrorBoundary from './shared/components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState<'saot' | 'icc'>('saot');
  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <ErrorBoundary fallback={<div>Erro no módulo SAOT</div>}>
        {activeTab === 'saot' && <SAOTLab />}
      </ErrorBoundary>
      <ErrorBoundary fallback={<div>Erro no módulo ICC</div>}>
        {activeTab === 'icc' && <ICCCommandCenter />}
      </ErrorBoundary>
    </Layout>
  );
}

src/shared/components/Layout.tsx
tsx

type Props = {
  children: React.ReactNode;
  activeTab: 'saot' | 'icc';
  onTabChange: (tab: 'saot' | 'icc') => void;
};

export default function Layout({ children, activeTab, onTabChange }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wider">
          IMPEDIMENTO MILIMÉTRICO 4.0
        </h1>
        <nav className="flex gap-2">
          <button
            className={`px-4 py-1 rounded ${
              activeTab === 'saot' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
            onClick={() => onTabChange('saot')}
          >
            SAOT Lab
          </button>
          <button
            className={`px-4 py-1 rounded ${
              activeTab === 'icc' ? 'bg-emerald-600' : 'bg-gray-700'
            }`}
            onClick={() => onTabChange('icc')}
          >
            ICC Command Center
          </button>
        </nav>
      </header>
      <main className="flex-1 relative">{children}</main>
    </div>
  );
}

Commit:
bash

git add .
git commit -m "🔧 config: adiciona ESLint, Prettier e estrutura de pastas modular"

⚽ FASE 1 – MÓDULO SAOT (3D + Engine)
Store (Zustand)
src/modules/saot/store/useSaotStore.ts
typescript

import { create } from 'zustand';

export interface Position {
  x: number;
  z: number;
}

export interface SAOTState {
  attacker: Position;
  defender: Position;
  goalkeeper: Position;
  setAttacker: (pos: Position) => void;
  setDefender: (pos: Position) => void;
  setGoalkeeper: (pos: Position) => void;
  reset: () => void;
}

const initialState = {
  attacker: { x: 6, z: 0 },
  defender: { x: 4, z: -2 },
  goalkeeper: { x: -8, z: 0 },
};

export const useSaotStore = create<SAOTState>((set) => ({
  ...initialState,
  setAttacker: (pos) => set({ attacker: pos }),
  setDefender: (pos) => set({ defender: pos }),
  setGoalkeeper: (pos) => set({ goalkeeper: pos }),
  reset: () => set(initialState),
}));

Serviço de Cálculo
src/modules/saot/services/OffsideCalculator.ts
typescript

import type { Position } from '../store/useSaotStore';

export interface OffsideResult {
  isOffside: boolean;
  marginCm: number;
}

/**
 * Calcula impedimento comparando a posição X do atacante com o
 * penúltimo defensor (considerando goleiro e defensor).
 * Regra: 1 unidade = 1 metro = 100 cm.
 */
export function calculateOffside(
  attacker: Position,
  defender: Position,
  goalkeeper: Position,
): OffsideResult {
  // Ordena os dois defensores por X decrescente (mais adiantado primeiro)
  const defenders = [defender, goalkeeper].sort((a, b) => b.x - a.x);
  const secondLastX = defenders[1].x; // penúltimo defensor

  const marginCm = (attacker.x - secondLastX) * 100;
  return {
    isOffside: marginCm > 0,
    marginCm: Math.round(marginCm * 100) / 100,
  };
}

Hook de Drag para Jogador
src/modules/saot/hooks/useDragPlayer.ts
typescript

import { useCallback } from 'react';
import type { Position } from '../store/useSaotStore';

export function useDragPlayer(onUpdate: (pos: Position) => void) {
  const handleDrag = useCallback(
    (matrix: number[]) => {
      // matrix é a nova matriz mundial do objeto 3D
      const x = matrix[12];
      const z = matrix[14];
      onUpdate({ x, z });
    },
    [onUpdate],
  );
  return handleDrag;
}

Componente 3D do Jogador
src/modules/saot/components/Player.tsx
tsx

import { useRef, useEffect, memo } from 'react';
import { Mesh, BufferGeometry, Material } from 'three';
import { DragControls } from '@react-three/drei';
import type { Position } from '../store/useSaotStore';
import { useDragPlayer } from '../hooks/useDragPlayer';

interface PlayerProps {
  position: Position;
  color: string;
  onDragEnd: (pos: Position) => void;
}

const Player = memo(({ position, color, onDragEnd }: PlayerProps) => {
  const groupRef = useRef<THREE.Group>(null!);
  const handleDrag = useDragPlayer(onDragEnd);

  useEffect(() => {
    return () => {
      // Cleanup das geometrias e materiais
      groupRef.current?.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry?.dispose();
          if (child.material instanceof Material) child.material.dispose();
        }
      });
    };
  }, []);

  return (
    <DragControls onDragEnd={handleDrag} autoTransform={false}>
      <group ref={groupRef} position={[position.x, 0, position.z]}>
        {/* Corpo */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 1.5, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Cabeça */}
        <mesh position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="peachpuff" />
        </mesh>
        {/* Pé direito */}
        <mesh position={[0.1, 0.1, 0.15]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
        {/* Pé esquerdo */}
        <mesh position={[-0.1, 0.1, -0.15]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
    </DragControls>
  );
});

export default Player;

Componente da Cena 3D
src/modules/saot/components/ThreeDPitch.tsx
tsx

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Plane } from '@react-three/drei';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useSaotStore } from '../store/useSaotStore';
import { calculateOffside, type OffsideResult } from '../services/OffsideCalculator';
import Player from './Player';

export default function ThreeDPitch({ showResult }: { showResult?: OffsideResult }) {
  const { attacker, defender, goalkeeper, setAttacker, setDefender, setGoalkeeper } = useSaotStore();
  const controlsRef = useRef(null);

  useEffect(() => {
    return () => {
      // Desmonta OrbitControls
      (controlsRef.current as unknown as { dispose?: () => void })?.dispose?.();
    };
  }, []);

  // Linha de impedimento (renderizada condicionalmente)
  const offsideLineX = useMemo(() => {
    if (!showResult) return null;
    const defenders = [defender, goalkeeper].sort((a, b) => b.x - a.x);
    return defenders[1].x;
  }, [showResult, defender, goalkeeper]);

  return (
    <div className="h-[500px] w-full relative">
      <Canvas camera={{ position: [0, 10, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls ref={controlsRef} enableDamping />
        {/* Campo */}
        <Plane args={[20, 12]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <meshStandardMaterial color="green" />
        </Plane>
        {/* Linhas do campo (simplificadas) */}
        <gridHelper args={[20, 20, 'white', 'white']} position={[0, 0.01, 0]} />
        {/* Jogadores */}
        <Player position={attacker} color="red" onDragEnd={setAttacker} />
        <Player position={defender} color="blue" onDragEnd={setDefender} />
        <Player position={goalkeeper} color="yellow" onDragEnd={setGoalkeeper} />
        {/* Linha de impedimento */}
        {offsideLineX !== null && (
          <mesh position={[offsideLineX, 0.05, 0]}>
            <boxGeometry args={[0.05, 2, 12]} />
            <meshBasicMaterial color={showResult?.isOffside ? 'red' : 'green'} />
          </mesh>
        )}
      </Canvas>
    </div>
  );
}

Componente de Simulação
src/modules/saot/components/SimulateButton.tsx
tsx

import { useState, useCallback } from 'react';
import { useSaotStore } from '../store/useSaotStore';
import { calculateOffside, type OffsideResult } from '../services/OffsideCalculator';

export default function SimulateButton() {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OffsideResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { attacker, defender, goalkeeper } = useSaotStore();

  const handleSimulate = useCallback(() => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);
    let time = 0;
    const interval = setInterval(() => {
      time += 100;
      setProgress((prev) => prev + 0.5);
      if (time >= 20000) {
        clearInterval(interval);
        setIsRunning(false);
        const offside = calculateOffside(attacker, defender, goalkeeper);
        setResult(offside);
      }
    }, 100);
  }, [attacker, defender, goalkeeper]);

  return (
    <div className="p-4 bg-gray-800 rounded">
      <button
        onClick={handleSimulate}
        disabled={isRunning}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded font-bold"
      >
        Simular Passe
      </button>
      {isRunning && (
        <div className="mt-2 h-2 bg-gray-700 rounded overflow-hidden">
          <div
            className="h-full bg-blue-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {result && (
        <div className="mt-3 text-lg">
          <span className={result.isOffside ? 'text-red-400' : 'text-green-400'}>
            {result.isOffside ? 'IMPEDIDO' : 'LEGAL'}
          </span>
          <span className="ml-2 text-gray-300">
            Margem: {result.marginCm.toFixed(2)} cm
          </span>
        </div>
      )}
    </div>
  );
}

Container do Módulo SAOT
src/modules/saot/components/SAOTLab.tsx
tsx

import ThreeDPitch from './ThreeDPitch';
import SimulateButton from './SimulateButton';

export default function SAOTLab() {
  return (
    <div className="p-4">
      <ThreeDPitch />
      <SimulateButton />
    </div>
  );
}

Commit:
bash

git add .
git commit -m "✨ feat(saot): implementa simulação 3D com cálculo de impedimento milimétrico"

🧠 FASE 2 – MÓDULO ICC (Digital Twin + IA)
Store ICC (opcional, para chat)
src/modules/icc/store/useIccStore.ts
typescript

import { create } from 'zustand';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  chartData?: unknown;
}

interface ICCState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
}

export const useIccStore = create<ICCState>((set) => ({
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearChat: () => set({ messages: [] }),
}));

Serviço de Respostas Mock da IA
src/modules/icc/services/mockAIResponses.ts
typescript

import type { ChatMessage } from '../store/useIccStore';

const keywordMap: Record<string, { text: string; chart?: { label: string; data: number[] } }> = {
  ataque: {
    text: 'Padrões de ataque: O time adversário usa 60% das jogadas pelo lado esquerdo. Veja o gráfico:',
    chart: { label: 'Ataques por setor', data: [40, 60, 20] },
  },
  defesa: {
    text: 'A defesa adversária sofreu 12 gols nos últimos 5 jogos. Gráfico de vulnerabilidades:',
    chart: { label: 'Gols sofridos', data: [2, 3, 1, 4, 2] },
  },
  posse: {
    text: 'Média de posse de bola: 54% nos últimos jogos. Comparativo:',
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
    content: 'Desculpe, não encontrei informações específicas. Pergunte sobre ataque, defesa ou posse.',
  };
}

Componente do Chat com IA
src/modules/icc/components/AIChat.tsx
tsx

import { useState } from 'react';
import { useIccStore } from '../store/useIccStore';
import { getAIResponse } from '../services/mockAIResponses';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AIChat() {
  const { messages, addMessage } = useIccStore();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    addMessage(userMsg);
    const aiMsg = getAIResponse(input);
    addMessage(aiMsg);
    setInput('');
  };

  return (
    <div className="bg-gray-800 p-4 rounded h-96 flex flex-col">
      <h3 className="text-lg font-semibold mb-2">FIFA AI Pro</h3>
      <div className="flex-1 overflow-y-auto space-y-2 mb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              msg.role === 'user' ? 'bg-blue-900 ml-8' : 'bg-gray-700 mr-8'
            }`}
          >
            <p>{msg.content}</p>
            {msg.chartData && (
              <div className="h-32 mt-2">
                <ResponsiveContainer>
                  <BarChart data={msg.chartData.data.map((v, i) => ({ name: `Set ${i+1}`, value: v }))}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-gray-900 rounded px-3 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ex: padrões de ataque"
        />
        <button onClick={handleSend} className="bg-emerald-600 px-4 py-1 rounded">
          Enviar
        </button>
      </div>
    </div>
  );
}

Gêmeos Digitais (Canvas 2D)
src/modules/icc/hooks/useCrowdSimulation.ts
typescript

import { useEffect, useRef, useState } from 'react';

interface Gate {
  x: number;
  y: number;
  radius: number;
}

interface CrowdPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const GATES: Gate[] = [
  { x: 150, y: 50, radius: 30 },
  { x: 450, y: 50, radius: 30 },
  { x: 150, y: 350, radius: 30 },
  { x: 450, y: 350, radius: 30 },
];

export function useCrowdSimulation(timeLeftMinutes: number) {
  const [points, setPoints] = useState<CrowdPoint[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  const animRef = useRef<number>();

  useEffect(() => {
    const N = 500;
    const initialPoints: CrowdPoint[] = Array.from({ length: N }, () => ({
      x: Math.random() * 600,
      y: Math.random() * 400,
      vx: 0,
      vy: 0,
    }));
    setPoints(initialPoints);

    const update = () => {
      setPoints((prev) => {
        const factor = Math.max(0.1, timeLeftMinutes / 120); // 0..1, quanto menor mais rápido
        return prev.map((p) => {
          // Escolhe portão mais próximo
          let target = GATES[0];
          let minDist = Infinity;
          for (const g of GATES) {
            const dx = g.x - p.x;
            const dy = g.y - p.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < minDist) {
              minDist = d;
              target = g;
            }
          }
          const speed = (1 - factor) * 2 + 0.1;
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          return {
            x: p.x + (dx / len) * speed,
            y: p.y + (dy / len) * speed,
            vx: (dx / len) * speed,
            vy: (dy / len) * speed,
          };
        });
      });

      // Verifica congestionamento
      setPoints((prev) => {
        let alertMsg = null;
        for (const g of GATES) {
          const count = prev.filter((p) => {
            const dx = p.x - g.x;
            const dy = p.y - g.y;
            return Math.sqrt(dx * dx + dy * dy) < g.radius;
          }).length;
          if (count > 200) {
            alertMsg = `⚠️ Alerta: portão (${g.x},${g.y}) com ${count} torcedores!`;
            break;
          }
        }
        setAlert(alertMsg);
        return prev;
      });

      animRef.current = requestAnimationFrame(update);
    };

    animRef.current = requestAnimationFrame(update);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [timeLeftMinutes]);

  return { points, alert };
}

src/modules/icc/components/DigitalTwinMap.tsx
tsx

import { useEffect, useRef, useState } from 'react';
import { useCrowdSimulation } from '../hooks/useCrowdSimulation';

export default function DigitalTwinMap() {
  const [timeLeft, setTimeLeft] = useState(120); // minutos
  const { points, alert } = useCrowdSimulation(timeLeft);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 600, 400);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 600, 400);
    // Portões
    ctx.fillStyle = '#fbbf24';
    [
      [150, 50],
      [450, 50],
      [150, 350],
      [450, 350],
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
    });
    // Pontos
    ctx.fillStyle = '#60a5fa';
    for (const p of points) {
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
  }, [points]);

  return (
    <div className="bg-gray-800 p-4 rounded">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Gêmeos Digitais – Fluxo de Torcedores</h3>
        <label className="text-sm">
          Tempo p/ início: {timeLeft} min
          <input
            type="range"
            min="0"
            max="120"
            value={timeLeft}
            onChange={(e) => setTimeLeft(Number(e.target.value))}
            className="ml-2 w-32"
          />
        </label>
      </div>
      <canvas ref={canvasRef} width={600} height={400} className="w-full rounded" />
      {alert && (
        <div className="mt-2 bg-red-900 text-red-200 px-3 py-1 rounded animate-pulse">
          {alert}
        </div>
      )}
    </div>
  );
}

Ticker de Operações
src/modules/icc/components/OpsTicker.tsx
tsx

import { useEffect, useState } from 'react';

const EVENTS = [
  '🚌 Delegação do Brasil chegou ao estádio',
  '🔒 Checkpoint 3 liberado',
  '🍔 Reabastecimento de alimentos no setor B',
  '📡 Sinal de IPTV 100% estável',
  '🚑 Equipe médica posicionada no portão 2',
  '🛡️ Varredura de segurança concluída',
];

export default function OpsTicker() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % EVENTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 px-4 py-2 overflow-hidden whitespace-nowrap text-sm border border-gray-700 rounded">
      <span className="animate-marquee inline-block">
        {EVENTS[current]} &nbsp;&nbsp;|&nbsp;&nbsp; {EVENTS[(current + 1) % EVENTS.length]}
      </span>
    </div>
  );
}

Container ICC
src/modules/icc/components/ICCCommandCenter.tsx
tsx

import DigitalTwinMap from './DigitalTwinMap';
import AIChat from './AIChat';
import OpsTicker from './OpsTicker';

export default function ICCCommandCenter() {
  return (
    <div className="p-4 space-y-4">
      <OpsTicker />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DigitalTwinMap />
        <AIChat />
      </div>
    </div>
  );
}

Commit:
bash

git add .
git commit -m "✨ feat(icc): adiciona simulação de multidão e assistente tático IA"

🚀 FASE 3 – POLIMENTO E PERFORMANCE
1. Error Boundaries
src/shared/components/ErrorBoundary.tsx
tsx

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

2. React.memo nos componentes 3D

Já aplicado em Player.tsx (usando memo).
3. DataOverlay Global
src/shared/components/DataOverlay.tsx
tsx

import { useEffect, useState } from 'react';
import { useSaotStore } from '../../modules/saot/store/useSaotStore';

export default function DataOverlay() {
  const { attacker, defender, goalkeeper } = useSaotStore();
  const [fps, setFps] = useState(50);
  const [hz, setHz] = useState(500);
  const [blink, setBlink] = useState(false);

  // Simula atualização de 50 fps
  useEffect(() => {
    const interval = setInterval(() => setFps(Math.floor(48 + Math.random() * 4)), 20);
    return () => clearInterval(interval);
  }, []);

  // Pisca os 29 pontos quando posições mudam (arraste)
  useEffect(() => {
    setBlink(true);
    const t = setTimeout(() => setBlink(false), 200);
    return () => clearTimeout(t);
  }, [attacker, defender, goalkeeper]);

  return (
    <div className="absolute top-2 right-2 bg-black/70 text-xs px-3 py-2 rounded space-y-1 z-50">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${blink ? 'bg-yellow-400' : 'bg-green-400'}`} />
        <span>29 pontos corporais</span>
      </div>
      <div>Câmeras: {fps} fps</div>
      <div>Sensor na bola: {hz} Hz</div>
    </div>
  );
}

Integre em App.tsx:
tsx

<Layout ...>
  <DataOverlay />
  ...
</Layout>

4. Otimizações de Memória

Já incluímos dispose() no Player e OrbitControls no ThreeDPitch.
5. README.md
README.md
markdown

# Impedimento Milimétrico 4.0

Simulador SAOT + ICC para a Copa do Mundo FIFA 2026.

## Arquitetura

- **Módulo SAOT**: Engine de impedimento 3D com cálculo milimétrico.
- **Módulo ICC**: Centro de comando com gêmeos digitais e assistente IA.
- **Shared**: Componentes reutilizáveis, DataOverlay, Error Boundaries.

### Tecnologias

- React 18 + TypeScript (strict)
- Zustand (estado)
- @react-three/fiber + drei (3D)
- Recharts (gráficos)
- Tailwind CSS
- Vitest (testes)

### Como rodar

```bash
npm install
npm run dev

Gitmoji Commits

    🎉 init

    🔧 config

    ✨ feat

    🐛 fix

    ♻️ refactor

    📝 docs

    🚀 perf

    🔖 release

Créditos

Tecnologia inspirada nos sistemas oficiais da Copa do Mundo FIFA 2026.
text


**Commit:**

```bash
git add .
git commit -m "🚀 perf: otimiza renderização 3D e adiciona documentação completa"

🔖 FINAL – Merge e Release
bash

git checkout main
git merge develop
git commit -m "🔖 release: versão estável 1.0.0 do Impedimento Milimétrico 4.0"

🎯 Comandos para Rodar o Projeto
bash

npm install
npm run dev

Acesse http://localhost:5173 e utilize as abas SAOT Lab e ICC Command Center.