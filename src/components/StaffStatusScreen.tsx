import React from 'react';
import { Languages, Sun, Moon, ShieldOff, Loader2 } from 'lucide-react';
import { UiVariant } from '../types/warehouse';
import { Lang, Translations } from '../i18n/translations';

interface StaffStatusScreenProps {
  mode: 'connecting' | 'revoked' | 'invalid_qr' | 'disabled_qr';
  t: Translations;
  lang: Lang;
  variant: UiVariant;
  onChangeLang: (lang: Lang) => void;
  onChangeVariant: (variant: UiVariant) => void;
}

export const StaffStatusScreen: React.FC<StaffStatusScreenProps> = ({
  mode,
  t,
  lang,
  variant,
  onChangeLang,
  onChangeVariant,
}) => {
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
        ) : (
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-7 text-center space-y-4">
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
          </div>
        )}
      </div>
    </div>
  );
};
