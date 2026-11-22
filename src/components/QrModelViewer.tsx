import React from 'react';
import { ArrowLeft, Image as ImageIcon, PackageCheck, Scissors } from 'lucide-react';
import { CuttingBatch, GarmentModel, ProductStock } from '../types/warehouse';
import { formatDateTime } from '../data/initialData';
import { Lang, Translations } from '../i18n/translations';

interface QrModelViewerProps {
  model: GarmentModel | null;
  batch?: CuttingBatch | null;
  relatedBatches: CuttingBatch[];
  relatedProducts: ProductStock[];
  t: Translations;
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  onBackToApp: () => void;
}

export const QrModelViewer: React.FC<QrModelViewerProps> = ({
  model,
  batch,
  relatedBatches,
  relatedProducts,
  t,
  lang,
  onChangeLang,
  onBackToApp,
}) => {
  if (!model) {
    return (
      <div className="min-h-screen bg-warehouse-light dark:bg-warehouse-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 text-center space-y-4">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t.qrViewer.notFoundTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.qrViewer.notFoundMsg}</p>
          <button
            type="button"
            onClick={onBackToApp}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.qrViewer.goSiteBtn}
          </button>
        </div>
      </div>
    );
  }

  const totalRemaining = relatedProducts.reduce((s, p) => s + p.remaining, 0);

  return (
    <div className="min-h-screen bg-warehouse-light dark:bg-warehouse-dark py-6 px-4">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBackToApp}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.qrViewer.backBtn}
          </button>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 p-0.5">
              <button
                type="button"
                onClick={() => onChangeLang('ky')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === 'ky'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Кыр
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('ru')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === 'ru'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Рус
              </button>
            </div>
          </div>
        </div>

        <article className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shadow-sm">
          <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800">
            {model.photoUrl ? (
              <img
                src={model.photoUrl}
                alt={model.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <ImageIcon className="h-10 w-10" />
                <span className="text-xs">{t.qrViewer.noPhoto}</span>
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            <div>
              <div className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {t.qrViewer.modelPrefix}: {model.modelCode}
              </div>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {model.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {model.color} · {model.sizeRange}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-slate-800 py-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">
                  {t.qrViewer.fabricLabel}
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                  {model.fabricType}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">
                  {t.qrViewer.stockLabel}
                </dt>
                <dd className="mt-0.5 font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {totalRemaining} {t.common.pieces}
                </dd>
              </div>
            </dl>

            <div>
              <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.qrViewer.notesTitle}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {model.sewingNotes || t.qrViewer.noNotes}
              </p>
            </div>

            {batch && (
              <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-300">
                  <Scissors className="h-4 w-4" />
                  {t.qrViewer.batchTitle}: {batch.id}
                </div>
                <div className="text-sm text-slate-800 dark:text-slate-200">
                  {t.qrViewer.cutInfo(batch.cutPieces, batch.kgUsed.toFixed(1))}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {t.qrViewer.statusLabel}: {t.cutting.statuses[batch.status]} ·{' '}
                  {formatDateTime(batch.createdAt)}
                </div>
              </div>
            )}

            {!batch && relatedBatches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <PackageCheck className="h-4 w-4 text-emerald-600" />
                  {t.qrViewer.recentBatches}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                  {relatedBatches.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-300">
                        {t.cutting.statuses[b.status]}
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {b.cutPieces} {t.common.pieces}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};
