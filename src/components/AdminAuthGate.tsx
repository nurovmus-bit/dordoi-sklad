import React, { useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  Languages,
  Sun,
  Moon,
  Lock,
  ShieldOff,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { UiVariant } from '../types/warehouse';
import { Lang, Translations } from '../i18n/translations';

interface AdminAuthGateProps {
  mode: 'setup' | 'login' | 'connecting' | 'revoked' | 'invalid_qr' | 'disabled_qr';
  t: Translations;
  lang: Lang;
  variant: UiVariant;
  onChangeLang: (lang: Lang) => void;
  onChangeVariant: (variant: UiVariant) => void;
  onAdminAuthenticated: (token: string) => void;
  onResetToLogin: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  mode,
  t,
  lang,
  variant,
  onChangeLang,
  onChangeVariant,
  onAdminAuthenticated,
  onResetToLogin,
}) => {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = passcode.trim();
    if (trimmed.length < 4) {
      setError(t.auth.errShort);
      return;
    }
    if (mode === 'setup' && trimmed !== confirmPasscode.trim()) {
      setError(t.auth.errMismatch);
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === 'setup' ? '/api/admin/claim' : '/api/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: trimmed }),
      });
      const data = (await res.json().catch(() => null)) as {
        token?: string;
        error?: string;
      } | null;

      if (!res.ok || !data?.token) {
        if (data?.error === 'PASSCODE_TOO_SHORT') {
          setError(t.auth.errShort);
        } else {
          setError(t.auth.errInvalid);
        }
        return;
      }

      setPasscode('');
      setConfirmPasscode('');
      onAdminAuthenticated(data.token);
    } catch {
      setError(t.auth.errNetwork);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200 ${
        variant === 'floor'
          ? 'bg-warehouse-dark text-slate-100'
          : 'bg-warehouse-light text-slate-900'
      }`}
    >
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t.brand}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 p-0.5">
              <button
                type="button"
                onClick={() => onChangeLang('ky')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === 'ky'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Languages className="h-3 w-3" />
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
            <button
              type="button"
              onClick={() => onChangeVariant(variant === 'floor' ? 'classic' : 'floor')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label={variant === 'floor' ? t.nav.variant1 : t.nav.variant2}
            >
              {variant === 'floor' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mode === 'connecting' ? (
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t.auth.connectingTitle}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t.auth.connectingSub}
              </p>
            </div>
          </div>
        ) : mode === 'revoked' || mode === 'invalid_qr' || mode === 'disabled_qr' ? (
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-7 text-center space-y-5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
              <ShieldOff className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {mode === 'revoked'
                  ? t.auth.revokedTitle
                  : mode === 'disabled_qr'
                    ? t.auth.disabledQrTitle
                    : t.auth.invalidQrTitle}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {mode === 'revoked'
                  ? t.auth.revokedSub
                  : mode === 'disabled_qr'
                    ? t.auth.disabledQrSub
                    : t.auth.invalidQrSub}
              </p>
            </div>
            <button
              type="button"
              onClick={onResetToLogin}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors"
            >
              {t.auth.returnHomeBtn}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-6 sm:p-7 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 dark:bg-emerald-600 text-white">
                {mode === 'setup' ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : (
                  <Lock className="h-5 w-5" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {mode === 'setup' ? t.auth.setupTitle : t.auth.loginTitle}
                </h1>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {mode === 'setup' ? t.auth.setupSub : t.auth.loginSub}
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.passcodeLabel}
                </label>
                <input
                  type="password"
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder={
                    mode === 'setup' ? t.auth.setupPasscodePlaceholder : t.auth.passcodePlaceholder
                  }
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {mode === 'setup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.auth.confirmLabel}
                  </label>
                  <input
                    type="password"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder={t.auth.confirmPlaceholder}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50 transition-colors"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'setup' ? t.auth.setupBtn : t.auth.loginBtn}
              </button>
            </form>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                <QrCode className="h-4 w-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {t.auth.employeeHintTitle}
                </div>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                  {t.auth.employeeHintDesc}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
