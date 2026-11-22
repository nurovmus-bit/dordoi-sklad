import React, { useState } from 'react';
import {
  Barcode,
  Download,
  Plus,
  Printer,
  Search,
  CheckCircle2,
  X,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { GarmentModel, PackingBatch, ProductStock } from '../types/warehouse';
import { formatDateTime, generateBarcode } from '../data/initialData';
import { BarcodeSvg, downloadBarcodeLabelPng } from './BarcodeSvg';
import { Translations } from '../i18n/translations';

interface ZavskladStageProps {
  models: GarmentModel[];
  products: ProductStock[];
  awaitingBatches: PackingBatch[];
  t: Translations;
  onAcceptPackingBatch: (params: {
    packingId: string;
    modelId?: string;
    photoUrl?: string;
    name: string;
    modelCode: string;
    color: string;
    sizeRange: string;
    barcode: string;
    quantity: number;
  }) => void;
  onAddDirectProduct: (params: {
    modelId?: string;
    photoUrl?: string;
    name: string;
    modelCode: string;
    color: string;
    sizeRange: string;
    barcode: string;
    quantity: number;
  }) => void;
  onAddStockToExisting: (productId: string, addQty: number) => void;
  onDeleteProduct: (productId: string) => void;
  onGoToDispatch?: (productId?: string) => void;
}

export const ZavskladStage: React.FC<ZavskladStageProps> = ({
  models,
  products,
  awaitingBatches,
  t,
  onAcceptPackingBatch,
  onAddDirectProduct,
  onAddStockToExisting,
  onDeleteProduct,
  onGoToDispatch,
}) => {
  const [search, setSearch] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [name, setName] = useState('');
  const [modelCode, setModelCode] = useState('');
  const [color, setColor] = useState('');
  const [sizeRange, setSizeRange] = useState('S–XL');
  const [barcode, setBarcode] = useState(() => generateBarcode());
  const [quantity, setQuantity] = useState('');
  const [acceptingPackingId, setAcceptingPackingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [restockProductId, setRestockProductId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [barcodeProduct, setBarcodeProduct] = useState<ProductStock | null>(null);

  const handleSelectModelTemplate = (id: string) => {
    setSelectedModelId(id);
    const m = models.find((item) => item.id === id);
    if (m) {
      setName(m.name);
      setModelCode(m.modelCode);
      setColor(m.color);
      setSizeRange(m.sizeRange);
    }
  };

  const handleStartAccept = (batch: PackingBatch) => {
    setAcceptingPackingId(batch.id);
    const matchedModel = models.find(
      (m) =>
        batch.modelName.toLowerCase().includes(m.modelCode.toLowerCase()) ||
        batch.modelName.toLowerCase().includes(m.name.toLowerCase())
    );
    if (matchedModel) {
      setSelectedModelId(matchedModel.id);
      setName(matchedModel.name);
      setModelCode(matchedModel.modelCode);
      setColor(matchedModel.color);
      setSizeRange(matchedModel.sizeRange);
    } else {
      setSelectedModelId('');
      setName(batch.modelName);
      setModelCode(batch.modelName.split(' ').pop() || 'M-100');
      setColor(batch.color);
      setSizeRange('S–XL');
    }
    setBarcode(generateBarcode());
    setQuantity(String(batch.packedPieces));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!name.trim() || !modelCode.trim()) {
      setError(t.zavsklad.errNameCode);
      return;
    }
    if (Number.isNaN(qty) || qty <= 0) {
      setError(t.zavsklad.errQty);
      return;
    }

    const finalBarcode = barcode.trim().toUpperCase() || generateBarcode();
    const matchedModel = models.find((m) => m.id === selectedModelId);

    if (acceptingPackingId) {
      onAcceptPackingBatch({
        packingId: acceptingPackingId,
        modelId: matchedModel?.id,
        photoUrl: matchedModel?.photoUrl,
        name: name.trim(),
        modelCode: modelCode.trim(),
        color: color.trim() || 'Аралаш',
        sizeRange: sizeRange.trim() || 'Стандарт',
        barcode: finalBarcode,
        quantity: qty,
      });
    } else {
      onAddDirectProduct({
        modelId: matchedModel?.id,
        photoUrl: matchedModel?.photoUrl,
        name: name.trim(),
        modelCode: modelCode.trim(),
        color: color.trim() || 'Аралаш',
        sizeRange: sizeRange.trim() || 'Стандарт',
        barcode: finalBarcode,
        quantity: qty,
      });
    }

    setAcceptingPackingId(null);
    setSelectedModelId('');
    setName('');
    setModelCode('');
    setColor('');
    setSizeRange('S–XL');
    setBarcode(generateBarcode());
    setQuantity('');
    setError('');
  };

  const handleConfirmRestock = (productId: string) => {
    const qty = parseInt(restockQty, 10);
    if (Number.isNaN(qty) || qty <= 0) return;
    onAddStockToExisting(productId, qty);
    setRestockProductId(null);
    setRestockQty('');
  };

  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.modelCode.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q)
    );
  });

  const totalRemaining = products.reduce((s, p) => s + p.remaining, 0);

  return (
    <div className="space-y-6">
      {awaitingBatches.length > 0 && (
        <section className="rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/80 dark:bg-emerald-950/35 backdrop-blur-md p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
                {t.zavsklad.incomingTitle(awaitingBatches.length)}
              </h2>
              <p className="text-xs text-emerald-800 dark:text-emerald-400">
                {t.zavsklad.incomingSub}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {awaitingBatches.map((batch) => (
              <div
                key={batch.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 px-4 py-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {batch.modelName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {batch.color} · {t.zavsklad.countedByIzat}:{' '}
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {batch.packedPieces} {t.common.pieces}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartAccept(batch)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t.zavsklad.acceptQrBtn}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-6 space-y-4 self-start"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {acceptingPackingId ? t.zavsklad.formTitleAccept : t.zavsklad.formTitleDirect}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {t.zavsklad.formSub}
              </p>
            </div>
            {acceptingPackingId && (
              <button
                type="button"
                onClick={() => {
                  setAcceptingPackingId(null);
                  setName('');
                  setModelCode('');
                  setQuantity('');
                }}
                className="text-xs text-slate-500 dark:text-slate-400 hover:underline"
              >
                {t.common.clear}
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {models.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.zavsklad.templateLabel}
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => handleSelectModelTemplate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
              >
                <option value="">{t.zavsklad.templateManual}</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.modelCode} — {m.name} ({m.color})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.zavsklad.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.zavsklad.namePlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.zavsklad.codeLabel}
              </label>
              <input
                type="text"
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
                placeholder="M-204"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.zavsklad.colorLabel}
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Кара / Ак"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.zavsklad.sizeLabel}
              </label>
              <input
                type="text"
                value={sizeRange}
                onChange={(e) => setSizeRange(e.target.value)}
                placeholder="S–XL (4 шт)"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.zavsklad.qtyLabel}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 font-mono text-sm text-slate-900 dark:text-slate-100 tabular-nums focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.zavsklad.barcodeLabel}
              </label>
              <button
                type="button"
                onClick={() => setBarcode(generateBarcode())}
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {t.zavsklad.regenBarcode}
              </button>
            </div>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 font-mono text-sm text-slate-900 dark:text-slate-100 tabular-nums focus:border-slate-900 focus:outline-none"
            />
            <div className="mt-3 flex justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-3">
              <BarcodeSvg value={barcode} height={38} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            {acceptingPackingId ? t.zavsklad.submitAccept : t.zavsklad.submitDirect}
          </button>
        </form>

        <div className="lg:col-span-8 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.zavsklad.listTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {t.zavsklad.summary(totalRemaining, products.length)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.zavsklad.searchPlaceholder}
                  className="w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>
              {onGoToDispatch && (
                <button
                  type="button"
                  onClick={() => onGoToDispatch()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
                >
                  {t.zavsklad.goDispatchBtn}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-xs font-medium text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3">{t.zavsklad.colProduct}</th>
                  <th className="px-4 py-3">{t.zavsklad.colBarcode}</th>
                  <th className="px-4 py-3 text-right">{t.zavsklad.colReceived}</th>
                  <th className="px-4 py-3 text-right">{t.zavsklad.colShipped}</th>
                  <th className="px-4 py-3 text-right">{t.zavsklad.colRemaining}</th>
                  <th className="px-6 py-3 text-right">{t.zavsklad.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      {t.zavsklad.emptyList}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.photoUrl && (
                            <img
                              src={p.photoUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 object-cover shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {p.name}{' '}
                              <span className="text-slate-500 dark:text-slate-400">
                                ({p.modelCode})
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {p.color} · {p.sizeRange} · {formatDateTime(p.updatedAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => setBarcodeProduct(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors tabular-nums whitespace-nowrap"
                        >
                          <Barcode className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                          {p.barcode}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                        {p.totalReceived}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                        {p.totalShipped}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-800 dark:text-emerald-400 tabular-nums">
                        {p.remaining} {t.common.pieces}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {restockProductId === p.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              value={restockQty}
                              onChange={(e) => setRestockQty(e.target.value)}
                              placeholder={`+${t.common.pieces}`}
                              className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-2 py-1 font-mono text-xs tabular-nums"
                            />
                            <button
                              type="button"
                              onClick={() => handleConfirmRestock(p.id)}
                              className="rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-800 whitespace-nowrap"
                            >
                              {t.common.add}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRestockProductId(null)}
                              className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs text-slate-600 dark:text-slate-300"
                            >
                              {t.common.no}
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setRestockProductId(p.id);
                                setRestockQty('');
                              }}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap"
                            >
                              {t.zavsklad.restockBtn}
                            </button>
                            {onGoToDispatch && (
                              <button
                                type="button"
                                onClick={() => onGoToDispatch(p.id)}
                                disabled={p.remaining <= 0}
                                className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 disabled:opacity-40 whitespace-nowrap"
                              >
                                {t.zavsklad.dispatchBtn}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeleteProduct(p.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 transition-colors"
                              aria-label={t.common.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {barcodeProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.zavsklad.barcodeModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setBarcodeProduct(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
                aria-label={t.common.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              id="barcode-print-area"
              className="my-5 flex flex-col items-center rounded-xl border border-slate-200 bg-white p-6 text-center"
            >
              <div className="text-base font-bold text-slate-900">
                {barcodeProduct.name} ({barcodeProduct.modelCode})
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {t.zavsklad.barcodeMeta(barcodeProduct.color, barcodeProduct.sizeRange)}
              </div>
              <div className="mt-4">
                <BarcodeSvg value={barcodeProduct.barcode} height={64} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  downloadBarcodeLabelPng({
                    barcode: barcodeProduct.barcode,
                    name: barcodeProduct.name,
                    modelCode: barcodeProduct.modelCode,
                    color: barcodeProduct.color,
                    sizeRange: barcodeProduct.sizeRange,
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                {t.zavsklad.downloadPng}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Printer className="h-4 w-4" />
                {t.zavsklad.printBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
