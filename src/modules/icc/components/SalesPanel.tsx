import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface StoreData {
  name: string;
  revenue: number;
  category: string;
}

const CATEGORIES = [
  { key: 'alimentacao', label: 'Alimentacao', color: '#f59e0b', icon: '\uD83C\uDF54' },
  { key: 'merchandise', label: 'Merchandise', color: '#3b82f6', icon: '\uD83C\uDFAE' },
  { key: 'bebidas', label: 'Bebidas', color: '#22c55e', icon: '\uD83C\uDF7A' },
  { key: 'ingressos', label: 'Ingressos', color: '#8b5cf6', icon: '\uD83C\uDFAB' },
];

const TOP_STORES: StoreData[] = [
  { name: 'Food Court Central', revenue: 45200, category: 'alimentacao' },
  { name: 'Merch Oficial FIFA', revenue: 38700, category: 'merchandise' },
  { name: 'Bar do Estadio', revenue: 29100, category: 'bebidas' },
  { name: 'Concessionaria Norte', revenue: 22400, category: 'alimentacao' },
  { name: 'Loja Camisas', revenue: 18900, category: 'merchandise' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}

export default function SalesPanel() {
  const [categoryRevenue, setCategoryRevenue] = useState(() =>
    CATEGORIES.map((c) => ({
      ...c,
      value: 15000 + Math.round(Math.random() * 20000),
    })),
  );
  const [totalRevenue, setTotalRevenue] = useState(185400);
  const [occupancy, setOccupancy] = useState(78);
  const [stores, setStores] = useState(TOP_STORES);

  useEffect(() => {
    const interval = setInterval(() => {
      setCategoryRevenue((prev) =>
        prev.map((c) => ({
          ...c,
          value: Math.max(5000, c.value + Math.round((Math.random() - 0.4) * 800)),
        })),
      );
      setTotalRevenue((prev) => prev + Math.round((Math.random() - 0.3) * 500));
      setOccupancy((prev) => Math.max(40, Math.min(98, prev + (Math.random() - 0.5) * 3)));
      setStores((prev) =>
        prev
          .map((s) => ({
            ...s,
            revenue: Math.max(5000, s.revenue + Math.round((Math.random() - 0.4) * 400)),
          }))
          .sort((a, b) => b.revenue - a.revenue),
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const chartData = categoryRevenue.map((c) => ({
    name: c.label,
    value: c.value,
    color: c.color,
  }));

  return (
    <div className="bg-surface-800/50 rounded-xl border border-surface-700/50 p-4">
      <h3 className="text-sm font-semibold text-surface-200/80 mb-3">
        Vendas & Estabelecimentos
      </h3>

      {/* Receita total */}
      <div className="bg-surface-900/50 rounded-lg p-3 mb-3">
        <p className="text-[10px] text-surface-200/40 uppercase tracking-wider mb-1">Receita Total</p>
        <p className="text-2xl font-black text-emerald-400 font-mono">
          {formatCurrency(totalRevenue)}
        </p>
      </div>

      {/* Ocupacao */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-surface-200/50 mb-1">
          <span>Ocupacao do Estadio</span>
          <span className="font-mono">{occupancy.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-surface-900 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              occupancy > 85 ? 'bg-red-500' : occupancy > 60 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${occupancy}%` }}
          />
        </div>
      </div>

      {/* Barras por categoria */}
      <div className="mb-3">
        <p className="text-[10px] text-surface-200/40 uppercase tracking-wider mb-2">Por Categoria</p>
        <div className="h-36">
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis
                type="number"
                tick={{ fill: '#94a3b8', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 3 lojas */}
      <div>
        <p className="text-[10px] text-surface-200/40 uppercase tracking-wider mb-2">Top 3 Lojas</p>
        <div className="space-y-1.5">
          {stores.slice(0, 3).map((store, i) => {
            const cat = CATEGORIES.find((c) => c.key === store.category);
            return (
              <div key={store.name} className="flex items-center gap-2 bg-surface-900/50 rounded-lg px-2.5 py-1.5">
                <span className={`text-xs font-black ${
                  i === 0 ? 'text-amber-400' : i === 1 ? 'text-surface-200/60' : 'text-orange-600'
                }`}>
                  {i + 1}º
                </span>
                <span className="text-xs">{cat?.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-surface-200/80 truncate">{store.name}</p>
                </div>
                <span className="text-xs font-mono text-surface-200/60">
                  {formatCurrency(store.revenue)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
