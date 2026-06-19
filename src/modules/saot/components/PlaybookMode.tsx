import { useTranslation } from 'react-i18next';
import { usePlaybookStore } from '../store/usePlaybookStore';
import { useSaotStore } from '../store/useSaotStore';

export default function PlaybookMode() {
  const { t } = useTranslation();
  const { plays, currentPlayId, currentStep, selectPlay, nextStep, prevStep, resetPlay, clearPlay } = usePlaybookStore();
  const { setAttacker, setDefender } = useSaotStore();

  const currentPlay = plays.find((p) => p.id === currentPlayId);
  const currentStepData = currentPlay?.steps[currentStep];

  const handleSelectPlay = (id: string) => {
    selectPlay(id);
    const play = plays.find((p) => p.id === id);
    if (play) {
      const step = play.steps[0];
      setAttacker(step.attackerEnd);
      setDefender(step.defenderEnd);
    }
  };

  const handleNextStep = () => {
    if (!currentPlay) return;
    const nextIdx = currentStep + 1;
    if (nextIdx < currentPlay.steps.length) {
      nextStep();
      const step = currentPlay.steps[nextIdx];
      setAttacker(step.attackerEnd);
      setDefender(step.defenderEnd);
    }
  };

  const handlePrevStep = () => {
    if (!currentPlay) return;
    const prevIdx = currentStep - 1;
    if (prevIdx >= 0) {
      prevStep();
      const step = currentPlay.steps[prevIdx];
      setAttacker(step.attackerEnd);
      setDefender(step.defenderEnd);
    }
  };

  const handleReset = () => {
    if (!currentPlay) return;
    resetPlay();
    const step = currentPlay.steps[0];
    setAttacker(step.attackerEnd);
    setDefender(step.defenderEnd);
  };

  if (!currentPlayId) {
    return (
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-surface-200/80 mb-3">
          {t('saot.playbook_title')}
        </h3>
        <p className="text-xs text-surface-200/50 mb-4">
          {t('saot.playbook_hint')}
        </p>
        <div className="space-y-2">
          {plays.map((play) => (
            <button
              key={play.id}
              onClick={() => handleSelectPlay(play.id)}
              className="w-full text-left p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-all border border-surface-700/30 hover:border-surface-600/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{play.icon}</span>
                <span className="text-sm font-medium text-surface-200/90">{t(`saot.plays.${play.id}.name`)}</span>
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  play.result === 'offside'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {play.result === 'offside' ? t('saot.offside') : t('saot.legal')}
                </span>
              </div>
              <p className="text-[11px] text-surface-200/50">{t(`saot.plays.${play.id}.description`)}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  play.difficulty === 'facil' ? 'bg-emerald-500/10 text-emerald-400' :
                  play.difficulty === 'medio' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {t(`saot.difficulty.${play.difficulty}`)}
                </span>
                <span className="text-[10px] text-surface-200/30">
                  {play.steps.length} {t('saot.steps')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-surface-200/80">
          {currentPlay?.icon} {t(`saot.plays.${currentPlayId}.name`)}
        </h3>
        <button
          onClick={clearPlay}
          className="text-xs text-surface-200/40 hover:text-surface-200/70 transition-colors"
        >
          {t('saot.back')}
        </button>
      </div>

      <div className="flex gap-1 mb-4">
        {currentPlay?.steps.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              i <= currentStep
                ? 'bg-brand-500'
                : 'bg-surface-700'
            }`}
          />
        ))}
      </div>

      {currentStepData && (
        <div className="bg-surface-900/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-brand-400 bg-brand-500/20 px-1.5 py-0.5 rounded">
              {t('saot.step')} {currentStep + 1}/{currentPlay?.steps.length}
            </span>
          </div>
          <p className="text-xs text-surface-200/80 font-medium">
            {t(`saot.plays.${currentPlayId}.steps.${currentStep}`)}
          </p>

          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-surface-200/40">{t('saot.ball')}</span>
              <span className="font-mono text-surface-200/60 ml-1">
                [{currentStepData.ballStart.join(', ')}] → [{currentStepData.ballEnd.join(', ')}]
              </span>
            </div>
            <div>
              <span className="text-surface-200/40">{t('saot.attacker')}:</span>
              <span className="font-mono text-surface-200/60 ml-1">
                ({currentStepData.attackerEnd.x.toFixed(1)}, {currentStepData.attackerEnd.z.toFixed(1)})
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 disabled:opacity-30 disabled:cursor-not-allowed text-surface-200/80 transition-colors"
        >
          {'◄'} {t('saot.prev')}
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-surface-700 hover:bg-surface-600 text-surface-200/80 transition-colors"
        >
          {'↻'}
        </button>
        <button
          onClick={handleNextStep}
          disabled={currentStep === (currentPlay?.steps.length ?? 1) - 1}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
        >
          {t('saot.next')} {'▶'}
        </button>
      </div>

      {currentStep === (currentPlay?.steps.length ?? 1) - 1 && (
        <div className={`mt-3 p-2 rounded-lg text-center text-xs font-bold ${
          currentPlay?.result === 'offside'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}>
          {currentPlay?.result === 'offside' ? `\u26A0 ${t('saot.offside')}` : `\u2713 ${t('saot.legal')}`}
        </div>
      )}
    </div>
  );
}
