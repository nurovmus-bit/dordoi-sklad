import React, { useEffect, useState } from 'react';
import { Download, Search, Truck, RotateCcw } from 'lucide-react';
import { ClientDispatch, ProductStock } from '../types/warehouse';
import { formatDateTime } from '../data/initialData';
import { Translations } from '../i18n/translations';

interface DispatchStageProps {
  products: ProductStock[];
  dispatches: ClientDispatch[];
  preselectedProductId?: string | null;
  t: Translations;
  onDispatch: (payload: {
    productId: string;
    clientName: string;
    containerInfo: string;
    quantity: number;
    note?: string;
  }) => { ok: boolean; error?: string };
  onRevertDispatch: (dispatchId: string) => void;
}

export const DispatchStage: React.FC<DispatchStageProps> = ({
  products,
  dispatches,
  preselectedProductId,
  t,
  onDispatch,
  onRevertDispatch,
}) => {
  const availableProducts = products.filter((p) => p.remaining > 0);
  const [productId, setProductId] = useState(
    preselectedProductId || availableProducts[0]?.id || ''
  );
  const [clientName, setClientName] = useState('');
  const [containerInfo, setContainerInfo] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (preselectedProductId) {
      setProductId(preselectedProductId);
    } else if (!productId && availableProducts[0]?.id) {
      setProductId(availableProducts[0].id);
    }
  }, [preselectedProductId, availableProducts, productId]);

  const selectedProduct =
    products.find((p) => p.id === productId) ?? availableProducts[0] ?? null;

  const qtyNum = parseInt(quantity, 10);
  const validQty = !Number.isNaN(qtyNum) && qtyNum > 0;
  const previewRemaining =
    selectedProduct && validQty
      ? selectedProduct.remaining - qtyNum
      : selectedProduct?.remaining ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    if (!selectedProduct) {
      setError(t.dispatch.errSelect);
      return;
    }
    if (!clientName.trim()) {
      setError(t.dispatch.errClient);
      return;
    }
    if (!validQty) {
      setError(t.dispatch.errQty);
      return;
    }
    if (qtyNum > selectedProduct.remaining) {
      setError(t.dispatch.errInsufficient(selectedProduct.remaining, qtyNum));
      return;
    }

    const res = onDispatch({
      productId: selectedProduct.id,
      clientName: clientName.trim(),
      containerInfo: containerInfo.trim() || 'Дордой базар',
      quantity: qtyNum,
      note: note.trim() || undefined,
    });

    if (!res.ok) {
      setError(res.error ?? '');
      return;
    }

    setSuccessMsg(t.dispatch.successMsg(clientName.trim(), qtyNum, selectedProduct.name));
    setClientName('');
    setContainerInfo('');
    setQuantity('');
    setNote('');
    setError('');
  };

  const filteredDispatches = dispatches.filter((d) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      d.clientName.toLowerCase().includes(q) ||
      d.containerInfo.toLowerCase().includes(q) ||
      d.productName.toLowerCase().includes(q) ||
      d.barcode.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    const headers = t.dispatch.csvHeaders;
    const rows = dispatches.map((d) => [
      formatDateTime(d.dispatchedAt),
      d.clientName,
      d.containerInfo,
      d.productName,
      d.modelCode,
      d.barcode,
      String(d.quantity),
      String(d.balanceAfter),
      d.note ?? '',
    ]);
    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dordoi-otpravka-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-6 space-y-4 self-start"
      >
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.dispatch.formTitle}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t.dispatch.formSub}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
            {successMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.dispatch.productLabel}
          </label>
          <select
            value={selectedProduct?.id ?? ''}
            onChange={(e) => {
              setProductId(e.target.value);
              setError('');
            }}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
          >
            {products.length === 0 ? (
              <option value="">{t.dispatch.noProductOption}</option>
            ) : (
              products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.remaining <= 0}>
                  {t.dispatch.productOption(p.name, p.modelCode, p.barcode, p.remaining)}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.dispatch.clientLabel}
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder={t.dispatch.clientPlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.dispatch.containerLabel}
          </label>
          <input
            type="text"
            value={containerInfo}
            onChange={(e) => setContainerInfo(e.target.value)}
            placeholder={t.dispatch.containerPlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.dispatch.qtyLabel}
          </label>
          <input
            type="number"
            min="1"
            max={selectedProduct?.remaining ?? undefined}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="40"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 font-mono text-sm text-slate-900 dark:text-slate-100 tabular-nums focus:border-slate-900 focus:outline-none"
          />
        </div>

        {selectedProduct && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>{t.dispatch.previewCurrent}</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                {selectedProduct.remaining} {t.common.pieces}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>{t.dispatch.previewMinus}</span>
              <span className="font-mono font-medium text-red-700 dark:text-red-400 tabular-nums">
                − {validQty ? qtyNum : 0} {t.common.pieces}
              </span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 flex items-center justify-between font-semibold">
              <span className="text-slate-900 dark:text-slate-100">
                {t.dispatch.previewBalance}
              </span>
              <span
                className={`font-mono tabular-nums ${
                  previewRemaining < 0
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-emerald-800 dark:text-emerald-400'
                }`}
              >
                {previewRemaining} {t.common.pieces}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.dispatch.noteLabel}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.dispatch.notePlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedProduct || selectedProduct.remaining <= 0}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          <Truck className="h-4 w-4" />
          {t.dispatch.submitBtn}
        </button>
      </form>

      <div className="lg:col-span-8 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.dispatch.listTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.dispatch.listSub}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.dispatch.searchPlaceholder}
                className="w-44 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={dispatches.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              {t.dispatch.exportCsv}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">{t.dispatch.colClient}</th>
                <th className="px-4 py-3">{t.dispatch.colProduct}</th>
                <th className="px-4 py-3 text-right">{t.dispatch.colShipped}</th>
                <th className="px-4 py-3 text-right">{t.dispatch.colBalanceAfter}</th>
                <th className="px-4 py-3">{t.dispatch.colDate}</th>
                <th className="px-6 py-3 text-right">{t.dispatch.colRevert}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDispatches.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {t.dispatch.emptyList}
                  </td>
                </tr>
              ) : (
                filteredDispatches.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {d.clientName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {d.containerInfo}
                        {d.note ? ` · ${d.note}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-900 dark:text-slate-100">
                        {d.productName}{' '}
                        <span className="text-slate-500 dark:text-slate-400">({d.modelCode})</span>
                      </div>
                      <div className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {d.barcode}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-red-700 dark:text-red-400 tabular-nums">
                      −{d.quantity}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-emerald-800 dark:text-emerald-400 tabular-nums">
                      {d.balanceAfter} {t.common.pieces}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {formatDateTime(d.dispatchedAt)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onRevertDispatch(d.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {t.dispatch.revertBtn}
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
