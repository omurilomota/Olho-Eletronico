import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'pt-BR', label: 'PT', flag: '\uD83C\uDDE7\uD83C\uDDF7' },
  { code: 'en', label: 'EN', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  { code: 'es', label: 'ES', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
] as const;

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('olho-lang', code);
  };

  return (
    <div className="flex gap-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
            i18n.language === lang.code
              ? 'bg-brand-600 text-white'
              : 'bg-surface-700/50 text-surface-200/50 hover:text-surface-200/80'
          }`}
          title={lang.label}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}
