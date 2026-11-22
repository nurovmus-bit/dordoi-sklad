import React, { useState } from 'react';
import { Scissors, ArrowRight, QrCode } from 'lucide-react';
import { CuttingBatch, FabricRoll, GarmentModel } from '../types/warehouse';
import { formatDateTime } from '../data/initialData';
import { Translations } from '../i18n/translations';

interface CuttingStageProps {
  models: GarmentModel[];
  rolls: FabricRoll[];
  batches: CuttingBatch[];
  t: Translations;
  onCreateCutting: (payload: {
    modelId?: string;
    modelName: string;
    modelPhoto?: string;
    fabricRollId: string;
    kgUsed: number;
    cutPieces: number;
    note?: string;
  }) => { ok: boolean; error?: string; batch?: CuttingBatch };
  onOpenBatchQr: (batch: CuttingBatch) => void;
  onGoToModels?: () => void;
  onGoToSewing?: () => void;
}

export const CuttingStage: React.FC<CuttingStageProps> = ({
  models,
  rolls,
  batches,
  t,
  onCreateCutting,
  onOpenBatchQr,
  onGoToModels,
  onGoToSewing,
}) => {
  const availableRolls = rolls.filter((r) => r.remainingKg > 0);
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id ?? '');
  const [customModelName, setCustomModelName] = useState('');
  const [fabricRollId, setFabricRollId] = useState(availableRolls[0]?.id ?? '');
  const [kgUsed, setKgUsed] = useState('');
  const [cutPieces, setCutPieces] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const selectedModel = models.find((m) => m.id === selectedModelId);
  const selectedRoll = rolls.find((r) => r.id === fabricRollId) ?? availableRolls[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedModelName = selectedModel
      ? `${selectedModel.name} ${selectedModel.modelCode}`
      : customModelName.trim();

    if (!resolvedModelName) {
      setError(t.cutting.errModel);
      return;
    }
    if (!selectedRoll) {
      setError(t.cutting.errRoll);
      return;
    }
    const kg = parseFloat(kgUsed);
    const pcs = parseInt(cutPieces, 10);
    if (Number.isNaN(kg) || kg <= 0) {
      setError(t.cutting.errKg);
      return;
    }
    if (Number.isNaN(pcs) || pcs <= 0) {
      setError(t.cutting.errPieces);
      return;
    }

    const res = onCreateCutting({
      modelId: selectedModel?.id,
      modelName: resolvedModelName,
      modelPhoto: selectedModel?.photoUrl,
      fabricRollId: selectedRoll.id,
      kgUsed: kg,
      cutPieces: pcs,
      note: note.trim() || selectedModel?.sizeRange || undefined,
    });

    if (!res.ok) {
      setError(res.error ?? '');
      return;
    }

    setCustomModelName('');
    setKgUsed('');
    setCutPieces('');
    setNote('');
    setError('');
    if (res.batch) {
      onOpenBatchQr(res.batch);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-6 space-y-4 self-start"
      >
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.cutting.formTitle}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t.cutting.formSub}</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.cutting.modelSelectLabel}
            </label>
            {onGoToModels && (
              <button
                type="button"
                onClick={onGoToModels}
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {t.cutting.newModelLink}
              </button>
            )}
          </div>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.modelCode} — {m.name} ({m.color})
              </option>
            ))}
            <option value="__custom__">{t.cutting.customModelOption}</option>
          </select>

          {selectedModel && (
            <div className="mt-2.5 flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2.5">
              {selectedModel.photoUrl && (
                <img
                  src={selectedModel.photoUrl}
                  alt={selectedModel.name}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
              )}
              <div className="min-w-0 text-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {selectedModel.name} ({selectedModel.modelCode})
                </div>
                <div className="text-slate-500 dark:text-slate-400 truncate">
                  {selectedModel.sizeRange} · {selectedModel.fabricType}
                </div>
              </div>
            </div>
          )}

          {selectedModelId === '__custom__' && (
            <input
              type="text"
              value={customModelName}
              onChange={(e) => setCustomModelName(e.target.value)}
              placeholder={t.cutting.customModelPlaceholder}
              className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.cutting.rollSelectLabel}
          </label>
          <select
            value={selectedRoll?.id ?? ''}
            onChange={(e) => setFabricRollId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
          >
            {availableRolls.length === 0 ? (
              <option value="">{t.cutting.noFabricOption}</option>
            ) : (
              availableRolls.map((r) => (
                <option key={r.id} value={r.id}>
                  {t.cutting.rollOption(r.name, r.color, r.remainingKg.toFixed(1))}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.cutting.kgUsedLabel}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={kgUsed}
              onChange={(e) => setKgUsed(e.target.value)}
              placeholder="25"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 font-mono text-sm text-slate-900 dark:text-slate-100 tabular-nums focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.cutting.cutPiecesLabel}
            </label>
            <input
              type="number"
              min="1"
              value={cutPieces}
              onChange={(e) => setCutPieces(e.target.value)}
              placeholder="100"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 font-mono text-sm text-slate-900 dark:text-slate-100 tabular-nums focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {selectedRoll && kgUsed && !Number.isNaN(parseFloat(kgUsed)) && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>{t.cutting.remainingAfter}</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {Math.max(0, selectedRoll.remainingKg - parseFloat(kgUsed)).toFixed(1)} {t.common.kg}
            </span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.cutting.noteLabel}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.cutting.notePlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={availableRolls.length === 0}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          <Scissors className="h-4 w-4" />
          {t.cutting.submitBtn}
        </button>
      </form>

      <div className="lg:col-span-8 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.cutting.listTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.cutting.listSub}</p>
          </div>
          {onGoToSewing && (
            <button
              type="button"
              onClick={onGoToSewing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              {t.cutting.goSewing}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">{t.cutting.colModel}</th>
                <th className="px-4 py-3">{t.cutting.colFabric}</th>
                <th className="px-4 py-3 text-right">{t.cutting.colKgUsed}</th>
                <th className="px-4 py-3 text-right">{t.cutting.colCutPieces}</th>
                <th className="px-4 py-3">{t.cutting.colStage}</th>
                <th className="px-6 py-3 text-right">{t.cutting.colQr}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {batches.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {t.cutting.emptyList}
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {b.modelPhoto && (
                          <img
                            src={b.modelPhoto}
                            alt={b.modelName}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 object-cover shrink-0"
                          />
                        )}
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {b.modelName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {b.note ? `${b.note} · ` : ''}
                            {formatDateTime(b.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {b.fabricName} · {b.color}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                      {b.kgUsed.toFixed(1)} {t.common.kg}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {b.cutPieces} {t.common.pieces}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {t.cutting.statuses[b.status]}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenBatchQr(b)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                      >
                        <QrCode className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                        {t.cutting.qrBtn}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
