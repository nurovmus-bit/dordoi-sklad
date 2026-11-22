import React, { useState } from 'react';
import { CheckCircle2, Plus, ArrowRight } from 'lucide-react';
import { MACHINE_TYPES, MachineType, SEAMSTRESSES, SewingBatch } from '../types/warehouse';
import { formatDateTime } from '../data/initialData';
import { Translations } from '../i18n/translations';

interface SewingStageProps {
  batches: SewingBatch[];
  t: Translations;
  onUpdateSewn: (id: string, sewnPieces: number, defectPieces: number) => void;
  onAddTask: (payload: {
    modelName: string;
    color: string;
    seamstressName: string;
    machineType: MachineType;
    assignedPieces: number;
  }) => void;
  onSendToPacking: (id: string) => void;
  onGoToPacking: () => void;
}

export const SewingStage: React.FC<SewingStageProps> = ({
  batches,
  t,
  onUpdateSewn,
  onAddTask,
  onSendToPacking,
  onGoToPacking,
}) => {
  const [seamstressFilter, setSeamstressFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [modelName, setModelName] = useState('');
  const [color, setColor] = useState('Кара');
  const [seamstressName, setSeamstressName] = useState<string>(SEAMSTRESSES[0]);
  const [machineType, setMachineType] = useState<MachineType>('Түз тигүү');
  const [assignedPieces, setAssignedPieces] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSewn, setEditSewn] = useState('');
  const [editDefect, setEditDefect] = useState('0');

  const activeBatches = batches.filter((b) =>
    seamstressFilter === 'all' ? true : b.seamstressName === seamstressFilter
  );

  const handleStartEdit = (batch: SewingBatch) => {
    setEditingId(batch.id);
    setEditSewn(String(batch.sewnPieces));
    setEditDefect(String(batch.defectPieces));
  };

  const handleSaveEdit = (batch: SewingBatch) => {
    const sewn = Math.max(0, Math.min(batch.assignedPieces, parseInt(editSewn, 10) || 0));
    const defect = Math.max(0, parseInt(editDefect, 10) || 0);
    onUpdateSewn(batch.id, sewn, defect);
    setEditingId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pcs = parseInt(assignedPieces, 10);
    if (!modelName.trim() || Number.isNaN(pcs) || pcs <= 0) return;
    onAddTask({
      modelName: modelName.trim(),
      color: color.trim() || 'Кара',
      seamstressName,
      machineType,
      assignedPieces: pcs,
    });
    setModelName('');
    setAssignedPieces('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-4">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setSeamstressFilter('all')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              seamstressFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.sewing.allTab(batches.length)}
          </button>
          {SEAMSTRESSES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSeamstressFilter(name)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                seamstressFilter === name
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.sewing.addTaskBtn}
          </button>
          <button
            type="button"
            onClick={onGoToPacking}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0"
          >
            {t.sewing.goPackingBtn}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 items-end"
        >
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.sewing.modelLabel}
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Спорт костюм K-108"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.sewing.seamstressLabel}
            </label>
            <select
              value={seamstressName}
              onChange={(e) => setSeamstressName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
            >
              {SEAMSTRESSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.sewing.machineLabel}
            </label>
            <select
              value={machineType}
              onChange={(e) => setMachineType(e.target.value as MachineType)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
            >
              {MACHINE_TYPES.map((m) => (
                <option key={m} value={m}>
                  {t.sewing.machines[m]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.sewing.piecesLabel}
            </label>
            <input
              type="number"
              min="1"
              value={assignedPieces}
              onChange={(e) => setAssignedPieces(e.target.value)}
              placeholder="50"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 font-mono text-sm text-slate-900 dark:text-slate-100 tabular-nums focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder={t.sewing.colorPlaceholder}
              className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
            />
            <button
              type="submit"
              className="flex-1 rounded-lg bg-slate-900 dark:bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 whitespace-nowrap"
            >
              {t.common.add}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.sewing.listTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.sewing.listSub}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">{t.sewing.colModel}</th>
                <th className="px-4 py-3">{t.sewing.colSeamstress}</th>
                <th className="px-4 py-3 text-right">{t.sewing.colAssigned}</th>
                <th className="px-4 py-3 text-right">{t.sewing.colSewn}</th>
                <th className="px-4 py-3 text-right">{t.sewing.colDefect}</th>
                <th className="px-6 py-3 text-right">{t.sewing.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeBatches.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {t.sewing.emptyList}
                  </td>
                </tr>
              ) : (
                activeBatches.map((batch) => {
                  const isEditing = editingId === batch.id;
                  const isSent = batch.status === 'sent_to_packing';
                  return (
                    <tr
                      key={batch.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {batch.modelName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {batch.color} · {formatDateTime(batch.updatedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{batch.seamstressName}</span>
                        <span className="text-slate-400"> · </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {t.sewing.machines[batch.machineType]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                        {batch.assignedPieces}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max={batch.assignedPieces}
                            value={editSewn}
                            onChange={(e) => setEditSewn(e.target.value)}
                            className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-2 py-1 text-right font-mono text-sm tabular-nums"
                          />
                        ) : (
                          `${batch.sewnPieces} ${t.common.pieces}`
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editDefect}
                            onChange={(e) => setEditDefect(e.target.value)}
                            className="w-16 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-2 py-1 text-right font-mono text-sm tabular-nums"
                          />
                        ) : (
                          batch.defectPieces
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {isSent ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t.sewing.sentToPacking}
                          </span>
                        ) : isEditing ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(batch)}
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
                              onClick={() => handleStartEdit(batch)}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
                            >
                              {t.sewing.editCountBtn}
                            </button>
                            <button
                              type="button"
                              onClick={() => onSendToPacking(batch.id)}
                              disabled={batch.sewnPieces <= 0}
                              className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-40 whitespace-nowrap shrink-0"
                            >
                              {t.sewing.sendToPackingBtn}
                            </button>
                          </div>
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
