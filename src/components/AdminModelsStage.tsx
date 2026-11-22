import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Camera,
  Upload,
  Plus,
  QrCode,
  Smartphone,
  Trash2,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { GarmentModel } from '../types/warehouse';
import { formatDateTime } from '../data/initialData';
import { buildModelQrUrl } from './QrCodeModal';
import { Translations } from '../i18n/translations';

interface AdminModelsStageProps {
  models: GarmentModel[];
  t: Translations;
  onCreateModel: (model: {
    name: string;
    modelCode: string;
    color: string;
    sizeRange: string;
    fabricType: string;
    photoUrl: string;
    sewingNotes: string;
  }) => GarmentModel;
  onDeleteModel: (id: string) => void;
  onOpenQr: (model: GarmentModel) => void;
  onPreviewMobile: (modelId: string) => void;
}

function compressImageToDataUrl(imgSource: HTMLImageElement | HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  const rawW =
    imgSource instanceof HTMLVideoElement ? imgSource.videoWidth : imgSource.naturalWidth;
  const rawH =
    imgSource instanceof HTMLVideoElement ? imgSource.videoHeight : imgSource.naturalHeight;

  const maxDim = 800;
  let targetW = rawW || 640;
  let targetH = rawH || 480;
  if (targetW > maxDim || targetH > maxDim) {
    if (targetW >= targetH) {
      targetH = Math.round((targetH * maxDim) / targetW);
      targetW = maxDim;
    } else {
      targetW = Math.round((targetW * maxDim) / targetH);
      targetH = maxDim;
    }
  }

  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(imgSource, 0, 0, targetW, targetH);
  return canvas.toDataURL('image/jpeg', 0.78);
}

const MiniQrThumb: React.FC<{ modelId: string }> = ({ modelId }) => {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(buildModelQrUrl(modelId), {
      width: 112,
      margin: 1,
      errorCorrectionLevel: 'M',
    })
      .then((u) => {
        if (active) setSrc(u);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [modelId]);

  if (!src) return null;
  return (
    <img
      src={src}
      alt="QR"
      className="h-14 w-14 rounded-md border border-slate-200 bg-white p-0.5 shrink-0"
    />
  );
};

export const AdminModelsStage: React.FC<AdminModelsStageProps> = ({
  models,
  t,
  onCreateModel,
  onDeleteModel,
  onOpenQr,
  onPreviewMobile,
}) => {
  const [name, setName] = useState('');
  const [modelCode, setModelCode] = useState('');
  const [color, setColor] = useState('');
  const [sizeRange, setSizeRange] = useState('S–XL (линейка 4 шт)');
  const [fabricType, setFabricType] = useState('');
  const [sewingNotes, setSewingNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
      }
    };
  }, []);

  const handleOpenCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      fileInputRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 60);
    } catch {
      setCameraError(t.models.errCamera);
      fileInputRef.current?.click();
    }
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const dataUrl = compressImageToDataUrl(videoRef.current);
    if (dataUrl) {
      setPhotoUrl(dataUrl);
    }
    stopCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const compressed = compressImageToDataUrl(img);
        if (compressed) {
          setPhotoUrl(compressed);
          setError('');
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !modelCode.trim()) {
      setError(t.models.errNameCode);
      return;
    }
    if (!photoUrl) {
      setError(t.models.errNoPhoto);
      return;
    }

    const created = onCreateModel({
      name: name.trim(),
      modelCode: modelCode.trim().toUpperCase(),
      color: color.trim() || 'Кара',
      sizeRange: sizeRange.trim() || 'S–XL',
      fabricType: fabricType.trim() || 'Футер 2-нитка',
      photoUrl,
      sewingNotes: sewingNotes.trim() || '',
    });

    setName('');
    setModelCode('');
    setColor('');
    setFabricType('');
    setSewingNotes('');
    setPhotoUrl('');
    setError('');
    onOpenQr(created);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-6 space-y-4 self-start"
      >
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.models.formTitle}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t.models.formSub}</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        {cameraError && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            {cameraError}
          </div>
        )}

        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-4">
          {photoUrl ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <img src={photoUrl} alt={t.models.nameLabel} className="h-48 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute right-2 top-2 rounded-lg bg-slate-900/75 p-1.5 text-white hover:bg-slate-900"
                  aria-label={t.models.removePhotoAria}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <span>{t.models.photoReady}</span>
                <button
                  type="button"
                  onClick={handleOpenCamera}
                  className="text-slate-600 dark:text-slate-300 hover:underline"
                >
                  {t.models.retakePhoto}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-400 mb-3">
                <ImageIcon className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {t.models.photoPrompt}
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                {t.models.photoHint}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenCamera}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors whitespace-nowrap"
                >
                  <Camera className="h-4 w-4" />
                  {t.models.takePhotoBtn}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  <Upload className="h-4 w-4" />
                  {t.models.chooseFileBtn}
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.models.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.models.namePlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.models.codeLabel}
            </label>
            <input
              type="text"
              value={modelCode}
              onChange={(e) => setModelCode(e.target.value)}
              placeholder={t.models.codePlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 font-mono text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.models.fabricLabel}
            </label>
            <input
              type="text"
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              placeholder={t.models.fabricPlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.models.colorLabel}
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder={t.models.colorPlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.models.sizeLabel}
          </label>
          <input
            type="text"
            value={sizeRange}
            onChange={(e) => setSizeRange(e.target.value)}
            placeholder={t.models.sizePlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.models.notesLabel}
          </label>
          <textarea
            rows={2}
            value={sewingNotes}
            onChange={(e) => setSewingNotes(e.target.value)}
            placeholder={t.models.notesPlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          {t.models.submitBtn}
        </button>
      </form>

      <div className="lg:col-span-7 space-y-4">
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.models.listTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.models.listSub}</p>
          </div>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {t.models.countLabel(models.length)}
          </span>
        </div>

        {models.length === 0 ? (
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-12 text-center text-sm text-slate-500 dark:text-slate-400">
            {t.models.emptyList}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {models.map((m) => (
              <div
                key={m.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md overflow-hidden"
              >
                <div className="relative h-44 bg-slate-100 dark:bg-slate-800">
                  {m.photoUrl ? (
                    <img
                      src={m.photoUrl}
                      alt={m.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {m.modelCode}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {m.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {m.color} · {m.sizeRange}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{m.fabricType}</p>
                    </div>
                    <MiniQrThumb modelId={m.id} />
                  </div>

                  {m.sewingNotes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2.5 line-clamp-2">
                      {m.sewingNotes}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenQr(m)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors whitespace-nowrap"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        {t.models.qrStickerBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => onPreviewMobile(m.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        {t.models.openMobileBtn}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteModel(m.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 transition-colors"
                      aria-label={t.common.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400 tabular-nums">
                    {t.models.addedAt}: {formatDateTime(m.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cameraOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{t.models.cameraModalTitle}</h3>
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-hidden rounded-xl bg-black aspect-[4/3]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSnapPhoto}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <Camera className="h-4 w-4" />
                {t.models.snapBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
