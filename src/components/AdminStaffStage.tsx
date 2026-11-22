import React, { useState } from 'react';
import {
  UserPlus,
  QrCode,
  Power,
  Trash2,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import {
  EMPLOYEE_STAGES,
  EmployeeStageKey,
  SEAMSTRESSES,
  StaffMember,
} from '../types/warehouse';
import { formatDateTime } from '../data/initialData';
import { Translations } from '../i18n/translations';

interface AdminStaffStageProps {
  staffList: StaffMember[];
  loading: boolean;
  t: Translations;
  onRefresh: () => void;
  onCreateStaff: (payload: {
    name: string;
    roleNote?: string;
    allowedStage: EmployeeStageKey;
    seamstressName?: string;
  }) => Promise<StaffMember | null>;
  onToggleActive: (member: StaffMember) => void;
  onDeleteStaff: (member: StaffMember) => void;
  onOpenStaffQr: (member: StaffMember) => void;
  onPreviewAsStaff: (member: StaffMember) => void;
}

export const AdminStaffStage: React.FC<AdminStaffStageProps> = ({
  staffList,
  loading,
  t,
  onRefresh,
  onCreateStaff,
  onToggleActive,
  onDeleteStaff,
  onOpenStaffQr,
  onPreviewAsStaff,
}) => {
  const [name, setName] = useState('');
  const [allowedStage, setAllowedStage] = useState<EmployeeStageKey>('cutting');
  const [seamstressName, setSeamstressName] = useState('');
  const [roleNote, setRoleNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.staff.errName);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const created = await onCreateStaff({
        name: name.trim(),
        roleNote: roleNote.trim() || undefined,
        allowedStage,
        seamstressName: allowedStage === 'sewing' && seamstressName ? seamstressName : undefined,
      });
      if (!created) {
        setError(t.staff.errGeneric);
        return;
      }
      setName('');
      setRoleNote('');
      setSeamstressName('');
      onOpenStaffQr(created);
    } finally {
      setSubmitting(false);
    }
  };

  const connectedCount = staffList.filter((m) => m.active && m.connected).length;
  const disabledCount = staffList.filter((m) => !m.active).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Form: Add Employee */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md p-6 space-y-4 self-start"
      >
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.staff.formTitle}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t.staff.formSub}</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.staff.nameLabel}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.staff.namePlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.staff.stageLabel}
          </label>
          <select
            value={allowedStage}
            onChange={(e) => {
              const next = e.target.value as EmployeeStageKey;
              setAllowedStage(next);
              if (next !== 'sewing') setSeamstressName('');
            }}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
          >
            {EMPLOYEE_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {t.staff.stageLabels[stage]}
              </option>
            ))}
          </select>
        </div>

        {allowedStage === 'sewing' && (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.staff.seamstressFilterLabel}
            </label>
            <select
              value={seamstressName}
              onChange={(e) => setSeamstressName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
            >
              <option value="">{t.staff.seamstressAllOption}</option>
              {SEAMSTRESSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.staff.noteLabel}
          </label>
          <input
            type="text"
            value={roleNote}
            onChange={(e) => setRoleNote(e.target.value)}
            placeholder={t.staff.notePlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4" />
          {t.staff.submitBtn}
        </button>
      </form>

      {/* Right Table: Staff List & Live Connection Status */}
      <div className="lg:col-span-8 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.staff.listTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {t.staff.listSummary(staffList.length, connectedCount, disabledCount)}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t.staff.refreshBtn}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">{t.staff.colEmployee}</th>
                <th className="px-4 py-3">{t.staff.colDepartment}</th>
                <th className="px-4 py-3">{t.staff.colStatus}</th>
                <th className="px-6 py-3 text-right">{t.staff.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {staffList.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {t.staff.emptyList}
                  </td>
                </tr>
              ) : (
                staffList.map((member) => {
                  const isDisabled = !member.active;
                  const isConnected = member.active && member.connected;
                  return (
                    <tr
                      key={member.id}
                      className={`transition-colors ${
                        isDisabled
                          ? 'bg-slate-50/60 dark:bg-slate-900/40 opacity-75'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {member.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {member.roleNote || member.id}
                          {member.deviceInfo && isConnected ? ` · ${member.deviceInfo}` : ''}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {t.staff.stageLabels[member.allowedStage]}
                        </div>
                        {member.seamstressName && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {member.seamstressName}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${
                              isDisabled
                                ? 'bg-red-500'
                                : isConnected
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-400'
                            }`}
                          />
                          <span
                            className={
                              isDisabled
                                ? 'text-red-700 dark:text-red-400'
                                : isConnected
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-slate-600 dark:text-slate-400'
                            }
                          >
                            {isDisabled
                              ? t.staff.statusDisabled
                              : isConnected
                                ? t.staff.statusConnected
                                : t.staff.statusWaiting}
                          </span>
                        </div>
                        {member.lastSeenAt && member.active && (
                          <div className="mt-0.5 text-[11px] text-slate-400 tabular-nums">
                            {t.staff.lastActivePrefix}: {formatDateTime(member.lastSeenAt)}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenStaffQr(member)}
                            disabled={isDisabled}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            {t.staff.openQrBtn}
                          </button>

                          <button
                            type="button"
                            onClick={() => onPreviewAsStaff(member)}
                            disabled={isDisabled}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                            title={t.staff.qrPreviewAsStaffBtn}
                          >
                            <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="hidden sm:inline">{t.staff.testViewBtn}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleActive(member)}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                              isDisabled
                                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                                : 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            <Power className="h-3.5 w-3.5" />
                            {isDisabled ? t.staff.enableBtn : t.staff.disableBtn}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteStaff(member)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 transition-colors"
                            aria-label={t.common.delete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
