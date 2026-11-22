import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import { PackingBatch } from '../types/warehouse';
import { formatDateTime } from '../data/initialData';
import { Translations } from '../i18n/translations';

interface PackingStageProps {
  batches: PackingBatch[];
  t: Translations;
  onUpdatePackedCount: (id: string, packedPieces: number) => void;
  onHandOverToZavsklad: (id: string) => void;
  onAddManualPacking: (payload: {
    modelName: string;
    color: string;
    packedPieces: number;
  }) => void;
  onGoToZavsklad: () => void;
}

export const PackingStage: React.FC<PackingStageProps> = ({
  batches,
  t,
  onUpdatePackedCount,
  onHandOverToZavsklad,
  onAddManualPacking,
  onGoToZavsklad,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCount, setEditCount] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [modelName, setModelName] = useState('');
  const [color, setColor] = useState('Кара');
  const [manualPieces, setManualPieces] = useState('');

  const handleSaveCount = (id: string) => {
    const num = Math.max(0, parseInt(editCount, 10) || 0);
    onUpdatePackedCount(id, num);
    setEditingId(null);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pcs = parseInt(manualPieces, 10);
    if (!modelName.trim() || Number.isNaN(pcs) || pcs <= 0) return;
    onAddManualPacking({
      modelName: modelName.trim(),
      color: color.trim() || 'Кара',
      packedPieces: pcs,
    });
    setModelName('');
    setManualPieces('');
    setShowManual(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.packing.headerTitle}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t.packing.headerSub}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowManual((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.packing.manualAddBtn}
          </button>
          <button
            type="button"
            onClick={onGoToZavsklad}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
          >
            {t.packing.goZavskladBtn}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showManual && (
        <form
          onSubmit={handleManualSubmit}
          className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5 grid grid-cols-1 gap-4 sm:grid-cols-4 items-end"
        >
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.packing.modelLabel}
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Худи базовый X-305"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.packing.colorLabel}
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.packing.piecesLabel}
              </label>
              <input
                type="number"
                min="1"
                value={manualPieces}
                onChange={(e) => setManualPieces(e.target.value)}
                placeholder="95"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 font-mono text-sm text-slate-900 dark:text-slate-100 tabular-nums focus:border-slate-900 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap h-[38px]"
            >
              {t.common.add}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">{t.packing.colModel}</th>
                <th className="px-4 py-3">{t.packing.colResponsible}</th>
                <th className="px-4 py-3 text-right">{t.packing.colIncoming}</th>
                <th className="px-4 py-3 text-right">{t.packing.colPacked}</th>
                <th className="px-4 py-3">{t.packing.colStatus}</th>
                <th className="px-6 py-3 text-right">{t.packing.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {batches.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {t.packing.emptyList}
                  </td>
                </tr>
              ) : (
                batches.map((b) => {
                  const isEditing = editingId === b.id;
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {b.modelName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {b.color} · {formatDateTime(b.updatedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                        {b.packedBy}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                        {b.incomingPieces} {t.common.pieces}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editCount}
                            onChange={(e) => setEditCount(e.target.value)}
                            className="w-24 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-2 py-1 text-right font-mono text-sm tabular-nums"
                          />
                        ) : (
                          `${b.packedPieces} ${t.common.pieces}`
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium">
                        {b.status === 'accepted' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t.packing.statusAccepted}
                          </span>
                        ) : b.status === 'awaiting_zavsklad' ? (
                          <span className="text-amber-700 dark:text-amber-400">
                            {t.packing.statusAwaiting}
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300">
                            {t.packing.statusPacking}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {b.status === 'packing' ? (
                          isEditing ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveCount(b.id)}
                                className="rounded-lg bg-slate-900 dark:bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap"
                              >
                                {t.common.save}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                              >
                                {t.common.close}
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(b.id);
                                  setEditCount(String(b.packedPieces));
                                }}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap"
                              >
                                {t.packing.editCountBtn}
                              </button>
                              <button
                                type="button"
                                onClick={() => onHandOverToZavsklad(b.id)}
                                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 whitespace-nowrap"
                              >
                                {t.packing.handOverBtn}
                              </button>
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-slate-400">{t.packing.handedOverText}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
