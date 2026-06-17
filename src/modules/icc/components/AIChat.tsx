import { useState } from 'react';
import { useIccStore } from '../store/useIccStore';
import { getAIResponse } from '../services/mockAIResponses';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AIChat() {
  const { messages, addMessage } = useIccStore();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage({ role: 'user', content: input });
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
                  <BarChart
                    data={msg.chartData.data.map((v, j) => ({
                      name: `Set ${j + 1}`,
                      value: v,
                    }))}
                  >
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
          className="flex-1 bg-gray-900 rounded px-3 py-1 text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ex: padroes de ataque"
        />
        <button
          onClick={handleSend}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-1 rounded transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
