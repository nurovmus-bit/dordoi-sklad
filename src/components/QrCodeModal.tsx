import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, Smartphone, X, Copy, Check } from 'lucide-react';
import { CuttingBatch, GarmentModel } from '../types/warehouse';
import { Translations } from '../i18n/translations';

interface QrCodeModalProps {
  open: boolean;
  model: GarmentModel | null;
  batch?: CuttingBatch | null;
  t: Translations;
  onClose: () => void;
  onPreviewMobile: (modelId: string, batchId?: string) => void;
}

export function buildModelQrUrl(modelId: string, batchId?: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams();
  params.set('model', modelId);
  if (batchId) {
    params.set('batch', batchId);
  }
  return `${origin}/?${params.toString()}`;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  open,
  model,
  batch,
  t,
  onClose,
  onPreviewMobile,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const qrUrl = model ? buildModelQrUrl(model.id, batch?.id) : '';

  useEffect(() => {
    if (!open || !qrUrl) return;
    let cancelled = false;
    QRCode.toDataURL(qrUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [open, qrUrl]);

  if (!open || !model) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownloadSticker = async () => {
    if (!qrDataUrl) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = qrDataUrl;
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => resolve();
    });
    ctx.drawImage(qrImg, 32, 36, 250, 250);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(model.modelCode, 304, 72);

    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(model.name.slice(0, 22), 304, 108);

    ctx.fillStyle = '#475569';
    ctx.font = '16px sans-serif';
    ctx.fillText(`${t.common.color}: ${model.color}`, 304, 148);
    ctx.fillText(`${t.common.size}: ${model.sizeRange}`, 304, 178);
    ctx.fillText(`${t.common.fabric}: ${model.fabricType.slice(0, 22)}`, 304, 208);

    if (batch) {
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`${batch.cutPieces} ${t.common.pieces}`, 304, 254);
      ctx.fillStyle = '#64748B';
      ctx.font = '14px monospace';
      ctx.fillText(batch.id, 304, 280);
    }

    ctx.fillStyle = '#64748B';
    ctx.font = '14px sans-serif';
    ctx.fillText(t.qrModal.stickerHint, 34, 344);

    const link = document.createElement('a');
    link.download = `qr-${model.modelCode}${batch ? `-${batch.id}` : ''}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {batch ? t.qrModal.titleBatch : t.qrModal.titleModel}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.qrModal.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
            aria-label={t.common.close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          id="qr-print-area"
          className="my-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-5 text-slate-900"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-2">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR ${model.modelCode}`}
                  className="h-40 w-40 object-contain"
                />
              ) : (
                <div className="h-40 w-40 flex items-center justify-center text-xs text-slate-400">
                  {t.qrModal.generating}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                {model.photoUrl && (
                  <img
                    src={model.photoUrl}
                    alt={model.name}
                    referrerPolicy="no-referrer"
                    className="h-14 w-14 rounded-lg border border-slate-200 object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="font-mono text-xs font-semibold text-emerald-700">
                    {model.modelCode}
                  </div>
                  <div className="text-base font-bold text-slate-900 truncate">{model.name}</div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  {t.common.color}: <span className="font-medium text-slate-900">{model.color}</span>{' '}
                  · {t.common.size}:{' '}
                  <span className="font-medium text-slate-900">{model.sizeRange}</span>
                </div>
                <div>
                  {t.common.fabric}: {model.fabricType}
                </div>
                {batch && (
                  <div className="pt-1 font-mono font-semibold text-emerald-800 tabular-nums">
                    {t.qrModal.batchInfo(batch.cutPieces, batch.id)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
          <input
            type="text"
            readOnly
            value={qrUrl}
            className="flex-1 bg-transparent font-mono text-xs text-slate-600 dark:text-slate-300 focus:outline-none truncate"
          />
          <button
            type="button"
            onClick={handleCopyUrl}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? t.qrModal.copied : t.qrModal.copyLink}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onPreviewMobile(model.id, batch?.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors whitespace-nowrap"
          >
            <Smartphone className="h-4 w-4" />
            {t.qrModal.previewMobile}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSticker}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <Download className="h-4 w-4" />
              {t.qrModal.downloadPng}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors whitespace-nowrap"
            >
              <Printer className="h-4 w-4" />
              {t.qrModal.printBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
