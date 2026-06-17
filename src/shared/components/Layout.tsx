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
          IMPEDIMENTO MILIMETRICO 4.0
        </h1>
        <nav className="flex gap-2">
          <button
            className={`px-4 py-1 rounded transition-colors ${
              activeTab === 'saot'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => onTabChange('saot')}
          >
            SAOT Lab
          </button>
          <button
            className={`px-4 py-1 rounded transition-colors ${
              activeTab === 'icc'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
