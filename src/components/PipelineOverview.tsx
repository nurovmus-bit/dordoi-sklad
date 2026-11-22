import React from 'react';
import {
  ArrowRight,
  PackageCheck,
  Scissors,
  Truck,
  Layers,
  AlertTriangle,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { GarmentModel, StageKey, UiVariant, WarehouseState } from '../types/warehouse';
import { formatDateTime } from '../data/initialData';
import { Translations } from '../i18n/translations';

interface PipelineOverviewProps {
  state: WarehouseState;
  variant: UiVariant;
  t: Translations;
  onNavigate: (stage: StageKey) => void;
  onQuickDispatch: (productId: string) => void;
  onOpenModelQr: (model: GarmentModel) => void;
  onPreviewMobile: (modelId: string) => void;
}

export const PipelineOverview: React.FC<PipelineOverviewProps> = ({
  state,
  variant,
  t,
  onNavigate,
  onQuickDispatch,
  onOpenModelQr,
  onPreviewMobile,
}) => {
  const totalFabricKg = state.fabricRolls.reduce((sum, r) => sum + r.remainingKg, 0);
  const totalRolls = state.fabricRolls.reduce((sum, r) => sum + r.rollsCount, 0);

  const activeSewingPieces = state.sewingBatches
    .filter((b) => b.status === 'in_progress')
    .reduce((sum, b) => sum + Math.max(0, b.assignedPieces - b.sewnPieces), 0);

  const awaitingZavskladPieces = state.packingBatches
    .filter((b) => b.status === 'awaiting_zavsklad')
    .reduce((sum, b) => sum + b.packedPieces, 0);

  const totalWarehouseStock = state.products.reduce((sum, p) => sum + p.remaining, 0);
  const totalShippedCount = state.dispatches.reduce((sum, d) => sum + d.quantity, 0);

  const stages: {
    key: StageKey;
    step: string;
    title: string;
    subtitle: string;
    stat: string;
    group: 'admin' | 'production' | 'warehouse';
  }[] = [
    {
      key: 'models',
      step: '0',
      title: t.overview.stageTitles.models,
      subtitle: t.overview.stageTitles.modelsSub,
      stat: t.overview.stageTitles.modelsStat(state.models.length),
      group: 'admin',
    },
    {
      key: 'fabric',
      step: '1',
      title: t.overview.stageTitles.fabric,
      subtitle: t.overview.stageTitles.fabricSub,
      stat: t.overview.stageTitles.fabricStat(totalFabricKg.toFixed(1), totalRolls),
      group: 'production',
    },
    {
      key: 'cutting',
      step: '2',
      title: t.overview.stageTitles.cutting,
      subtitle: t.overview.stageTitles.cuttingSub,
      stat: t.overview.stageTitles.cuttingStat(state.cuttingBatches.length),
      group: 'production',
    },
    {
      key: 'sewing',
      step: '3',
      title: t.overview.stageTitles.sewing,
      subtitle: t.overview.stageTitles.sewingSub,
      stat: t.overview.stageTitles.sewingStat(activeSewingPieces),
      group: 'production',
    },
    {
      key: 'packing',
      step: '4',
      title: t.overview.stageTitles.packing,
      subtitle: t.overview.stageTitles.packingSub,
      stat:
        awaitingZavskladPieces > 0
          ? t.overview.stageTitles.packingStatReady(awaitingZavskladPieces)
          : t.overview.stageTitles.packingStatDone,
      group: 'production',
    },
    {
      key: 'zavsklad',
      step: '5',
      title: t.overview.stageTitles.zavsklad,
      subtitle: t.overview.stageTitles.zavskladSub,
      stat: t.overview.stageTitles.zavskladStat(totalWarehouseStock),
      group: 'warehouse',
    },
    {
      key: 'dispatch',
      step: '6',
      title: t.overview.stageTitles.dispatch,
      subtitle: t.overview.stageTitles.dispatchSub,
      stat: t.overview.stageTitles.dispatchStat(totalShippedCount),
      group: 'warehouse',
    },
  ];

  return (
    <div className="space-y-8">
      <section aria-label={t.nav.overview}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{t.overview.kpiModelsFabric}</span>
              <Layers className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {totalFabricKg.toFixed(1)} {t.common.kg}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {t.overview.kpiModelsRollsSub(state.models.length, totalRolls)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{t.overview.kpiWorkshop}</span>
              <Scissors className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {activeSewingPieces + awaitingZavskladPieces} {t.common.pieces}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {t.overview.kpiWorkshopSub(awaitingZavskladPieces)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{t.overview.kpiWarehouse}</span>
              <PackageCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold text-emerald-800 dark:text-emerald-400 tabular-nums">
              {totalWarehouseStock} {t.common.pieces}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {t.overview.kpiWarehouseSub(state.products.length)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{t.overview.kpiShipped}</span>
              <Truck className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {totalShippedCount} {t.common.pieces}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {t.overview.kpiShippedSub(state.dispatches.length)}
            </p>
          </div>
        </div>
      </section>

      {variant === 'floor' && (
        <section aria-label={t.overview.modelsTitle}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t.overview.modelsTitle}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.overview.modelsSub}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('models')}
              className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-500 transition-colors whitespace-nowrap"
            >
              {t.overview.addModelBtn}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.models.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md overflow-hidden flex flex-col"
              >
                <div className="h-44 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={m.photoUrl}
                    alt={m.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {m.modelCode}
                    </div>
                    <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {m.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {m.color} · {m.sizeRange}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => onOpenModelQr(m)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors whitespace-nowrap"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      {t.overview.qrCodeBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => onPreviewMobile(m.id)}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      {t.overview.viewBtn}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-label={t.overview.workflowTitle}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t.overview.workflowTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.overview.workflowSub}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-200 dark:bg-slate-700 border border-slate-400 dark:border-slate-500" />
              {t.overview.legendAdmin}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700" />
              {t.overview.legendProd}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700" />
              {t.overview.legendWarehouse}
            </span>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 gap-3 ${
            variant === 'floor'
              ? 'md:grid-cols-2'
              : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {stages.map((item) => {
            const isWarehouse = item.group === 'warehouse';
            const isAdmin = item.group === 'admin';
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={`group flex flex-col justify-between rounded-xl border p-5 text-left backdrop-blur-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                  isWarehouse
                    ? 'border-emerald-200/90 dark:border-emerald-800/70 bg-emerald-50/75 dark:bg-emerald-950/35 hover:bg-emerald-50 dark:hover:bg-emerald-950/55 hover:border-emerald-300'
                    : isAdmin
                    ? 'border-slate-300/90 dark:border-slate-700 bg-white/90 dark:bg-slate-900/85 hover:bg-white dark:hover:bg-slate-800/85'
                    : 'border-blue-200/85 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-50/90 dark:hover:bg-blue-950/45 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.step}. {item.title}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0" />
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                    {item.subtitle}
                  </p>
                </div>
                <p
                  className={`mt-4 pt-3 border-t font-mono text-xs font-medium tabular-nums ${
                    isWarehouse
                      ? 'border-emerald-200/70 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-400'
                      : isAdmin
                      ? 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      : 'border-blue-200/70 dark:border-blue-900/50 text-blue-900 dark:text-blue-300'
                  }`}
                >
                  {item.stat}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.overview.stockTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.overview.stockSub}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('zavsklad')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              {t.overview.goZavsklad}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('dispatch')}
              className="rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
            >
              {t.overview.goDispatch}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">{t.overview.colProduct}</th>
                <th className="px-4 py-3">{t.overview.colColorSize}</th>
                <th className="px-4 py-3">{t.overview.colBarcode}</th>
                <th className="px-4 py-3 text-right">{t.overview.colReceived}</th>
                <th className="px-4 py-3 text-right">{t.overview.colShipped}</th>
                <th className="px-4 py-3 text-right">{t.overview.colRemaining}</th>
                <th className="px-6 py-3 text-right">{t.overview.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {t.overview.emptyStock}
                  </td>
                </tr>
              ) : (
                state.products.map((product) => {
                  const isLow = product.remaining <= 50;
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {product.photoUrl && (
                            <img
                              src={product.photoUrl}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 object-cover shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {product.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {t.common.model}: {product.modelCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {product.color} · {product.sizeRange}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                        {product.barcode}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                        {product.totalReceived}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                        {product.totalShipped}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums">
                        <span
                          className={`inline-flex items-center justify-end gap-1.5 ${
                            isLow
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-emerald-800 dark:text-emerald-400'
                          }`}
                        >
                          {isLow && (
                            <AlertTriangle
                              className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"
                              aria-label={t.overview.lowStockLabel}
                            />
                          )}
                          {product.remaining} {t.common.pieces}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onQuickDispatch(product.id)}
                          disabled={product.remaining <= 0}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                        >
                          {t.overview.dispatchBtn}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {state.dispatches.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-6 py-3 text-xs text-slate-500 dark:text-slate-400">
            {t.overview.lastDispatchPrefix}:{' '}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {state.dispatches[0].clientName}
            </span>{' '}
            —{' '}
            <span className="font-mono tabular-nums">
              {state.dispatches[0].quantity} {t.common.pieces}
            </span>{' '}
            ({state.dispatches[0].productName}) · {formatDateTime(state.dispatches[0].dispatchedAt)}
          </div>
        )}
      </section>
    </div>
  );
};
