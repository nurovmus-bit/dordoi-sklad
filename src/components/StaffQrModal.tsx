import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Check,
  Copy,
  Download,
  Printer,
  RefreshCw,
  Smartphone,
  X,
} from 'lucide-react';
import { StaffMember } from '../types/warehouse';
import { Translations } from '../i18n/translations';

interface StaffQrModalProps {
  open: boolean;
  member: StaffMember | null;
  t: Translations;
  onClose: () => void;
  onRegenerateQr: (member: StaffMember) => void;
  onPreviewAsStaff: (member: StaffMember) => void;
}

export const StaffQrModal: React.FC<StaffQrModalProps> = ({
  open,
  member,
  t,
  onClose,
  onRegenerateQr,
  onPreviewAsStaff,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    member && member.inviteToken && typeof window !== 'undefined'
      ? `${window.location.origin}/?staff=${encodeURIComponent(member.inviteToken)}`
      : '';

  useEffect(() => {
    if (!open || !inviteUrl) {
      setQrDataUrl('');
      return;
    }
    let active = true;
    QRCode.toDataURL(inviteUrl, {
      width: 320,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [open, inviteUrl]);

  if (!open || !member) return null;

  const stageLabel = t.staff.stageLabels[member.allowedStage];

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked
    }
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.brand.toUpperCase(), canvas.width / 2, 48);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(member.name, canvas.width / 2, 82);

    ctx.fillStyle = '#475569';
    ctx.font = '15px sans-serif';
    ctx.fillText(stageLabel, canvas.width / 2, 110);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 80, 136, 320, 320);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(member.roleNote || t.nav.employeeModeLabel, canvas.width / 2, 492);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText(t.staff.onlyOwnSectionHint, canvas.width / 2, 524);

      const link = document.createElement('a');
      link.download = `staff-qr-${member.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = qrDataUrl;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.staff.qrModalTitle}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.staff.qrModalSub}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label={t.common.close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          id="qr-print-area"
          className="my-5 flex flex-col items-center rounded-xl border border-slate-200 bg-white p-5 text-center"
        >
          <div className="text-lg font-bold text-slate-900">{member.name}</div>
          <div className="mt-0.5 text-xs font-semibold text-emerald-700">
            {stageLabel}
            {member.seamstressName ? ` · ${member.seamstressName}` : ''}
          </div>
          {member.roleNote && (
            <div className="mt-0.5 text-xs text-slate-500">{member.roleNote}</div>
          )}

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-2.5">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR ${member.name}`}
                className="h-56 w-56 object-contain"
              />
            ) : (
              <div className="h-56 w-56 flex items-center justify-center text-xs text-slate-400">
                {t.qrModal.generating}
              </div>
            )}
          </div>

          <div className="mt-3 text-[11px] leading-relaxed text-slate-500 max-w-xs">
            {t.staff.qrScanInstruction}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? t.qrModal.copied : t.qrModal.copyLink}
          </button>

          <button
            type="button"
            onClick={() => onPreviewAsStaff(member)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
          >
            <Smartphone className="h-3.5 w-3.5" />
            {t.staff.qrPreviewAsStaffBtn}
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            {t.qrModal.downloadPng}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors whitespace-nowrap"
          >
            <Printer className="h-3.5 w-3.5" />
            {t.qrModal.printBtn}
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => onRegenerateQr(member)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t.staff.qrRegenerateBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
