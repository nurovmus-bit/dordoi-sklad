import React, { useState } from 'react';
import { Plus, Search, Trash2, ArrowRight } from 'lucide-react';
import { FabricRoll } from '../types/warehouse';
import { formatDateTime } from '../data/initialData';
import { Translations } from '../i18n/translations';

interface FabricStageProps {
  rolls: FabricRoll[];
  t: Translations;
  onAddRoll: (roll: {
    name: string;
    color: string;
    rollsCount: number;
    initialKg: number;
    supplier: string;
  }) => void;
  onDeleteRoll: (id: string) => void;
  onGoToCutting: () => void;
}

export const FabricStage: React.FC<FabricStageProps> = ({
  rolls,
  t,
  onAddRoll,
  onDeleteRoll,
  onGoToCutting,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [rollsCount, setRollsCount] = useState('1');
  const [initialKg, setInitialKg] = useState('');
  const [supplier, setSupplier] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kgNum = parseFloat(initialKg);
    const countNum = parseInt(rollsCount, 10);
    if (!name.trim() || !color.trim()) {
      setError(t.fabric.errNameColor);
      return;
    }
    if (Number.isNaN(kgNum) || kgNum <= 0) {
      setError(t.fabric.errKg);
      return;
    }
    if (Number.isNaN(countNum) || countNum <= 0) {
      setError(t.fabric.errRolls);
      return;
    }

    onAddRoll({
      name: name.trim(),
      color: color.trim(),
      rollsCount: countNum,
      initialKg: kgNum,
      supplier: supplier.trim() || 'Мадина базар',
    });

    setName('');
    setColor('');
    setRollsCount('1');
    setInitialKg('');
    setSupplier('');
    setError('');
  };

  const filtered = rolls.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.color.toLowerCase().includes(q) ||
      r.supplier.toLowerCase().includes(q)
    );
  });

  const totalRemainingKg = rolls.reduce((s, r) => s + r.remainingKg, 0);
  const totalInitialKg = rolls.reduce((s, r) => s + r.initialKg, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-6 space-y-4 self-start"
        >
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.fabric.formTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t.fabric.formSub}</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.fabric.typeLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.fabric.typePlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.fabric.colorLabel}
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder={t.fabric.colorPlaceholder}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.fabric.rollsLabel}
              </label>
              <input
                type="number"
                min="1"
                value={rollsCount}
                onChange={(e) => setRollsCount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 font-mono text-sm text-slate-900 dark:text-slate-100 tabular-nums focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.fabric.kgLabel}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={initialKg}
              onChange={(e) => setInitialKg(e.target.value)}
              placeholder={t.fabric.kgPlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 font-mono text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 tabular-nums focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.fabric.supplierLabel}
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder={t.fabric.supplierPlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            {t.fabric.submitBtn}
          </button>
        </form>

        <div className="lg:col-span-8 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.fabric.listTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {t.fabric.summary(totalRemainingKg.toFixed(1), totalInitialKg.toFixed(1))}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.fabric.searchPlaceholder}
                  className="w-44 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={onGoToCutting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
              >
                {t.fabric.goCutting}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-xs font-medium text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3">{t.fabric.colFabric}</th>
                  <th className="px-4 py-3">{t.fabric.colRolls}</th>
                  <th className="px-4 py-3 text-right">{t.fabric.colInitKg}</th>
                  <th className="px-4 py-3 text-right">{t.fabric.colRemKg}</th>
                  <th className="px-4 py-3">{t.fabric.colReceivedAt}</th>
                  <th className="px-6 py-3 text-right">{t.fabric.colDelete}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      {t.fabric.emptyList}
                    </td>
                  </tr>
                ) : (
                  filtered.map((roll) => (
                    <tr
                      key={roll.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {roll.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {roll.color} · {roll.supplier}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                        {roll.rollsCount} {t.common.rolls}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                        {roll.initialKg.toFixed(1)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums">
                        <span
                          className={
                            roll.remainingKg <= 15
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }
                        >
                          {roll.remainingKg.toFixed(1)} {t.common.kg}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {formatDateTime(roll.receivedAt)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteRoll(roll.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 transition-colors"
                          aria-label={t.common.delete}
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
};
