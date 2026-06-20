import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePDF, type ReportData } from '../services/reportGenerator';

interface ExportButtonProps {
  data: Omit<ReportData, 'timestamp'>;
}

export default function ExportButton({ data }: ExportButtonProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await generatePDF({ ...data, timestamp: new Date() });
      setShowSuccess(true);
      timeoutRef.current = setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [data]);

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
        showSuccess
          ? 'bg-emerald-600 text-white'
          : 'bg-surface-700 hover:bg-surface-600 text-surface-200/80'
      } disabled:opacity-50`}
    >
      {isExporting ? (
        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : showSuccess ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      {showSuccess ? t('overlay.export.success') : t('overlay.export.pdf')}
    </button>
  );
}
