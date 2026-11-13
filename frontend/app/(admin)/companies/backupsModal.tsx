"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
  DatabaseBackup,
  Building2,
  Download,
  RefreshCw,
  Users,
  ShoppingCart,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import {
  getOwnerBackups,
  downloadOwnerBackup,
} from "@/services/owner";

interface Props {
  open: boolean;
  ownerId: string;
  companyName?: string;
  onClose: () => void;
}

interface BackupItem {
  id: string;
  createdAt: string;
  sizeBytes: number;
  clientsCount: number;
  ordersCount: number;
}

function formatSize(bytes: number) {
  const value = Number(bytes) || 0;

  if (value < 1024) return `${value} B`;

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BackupsModal({
  open,
  ownerId,
  companyName,
  onClose,
}: Props) {
  const [backups, setBackups] = useState<BackupItem[]>([]);

  const [keepVersions, setKeepVersions] = useState(2);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Ro'yxatni yuklash
  |--------------------------------------------------------------------------
  */

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getOwnerBackups(ownerId);

      setBackups(data.backups || []);
      setKeepVersions(data.keepVersions || 2);
    } catch (err: any) {
      console.error("GET BACKUPS ERROR:", err);

      setError(
        err?.response?.data?.message ||
          "Zaxira nusxalarni olishda xatolik yuz berdi."
      );
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  if (!open) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Yuklab olish
  |--------------------------------------------------------------------------
  */

  async function handleDownload(backup: BackupItem) {
    try {
      setDownloadingId(backup.id);

      const { blob, fileName } = await downloadOwnerBackup(
        ownerId,
        backup.id
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      toast.success("Zaxira nusxa yuklab olindi.");
    } catch (err: any) {
      console.error("DOWNLOAD BACKUP ERROR:", err);

      toast.error("Zaxira nusxani yuklab olishda xatolik yuz berdi.");
    } finally {
      setDownloadingId(null);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 text-left">
      <div className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <DatabaseBackup size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Zaxira nusxalar
              </h2>

              <p className="mt-0.5 text-sm text-slate-400">
                Dasturdan serverga yuborilgan ma&apos;lumotlar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Yopish"
          >
            <X size={19} />
          </button>
        </div>

        {/* ====================================================== */}
        {/* BODY */}
        {/* ====================================================== */}

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {/* Company */}

          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                <Building2 size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-400">Korxona</p>

                <p className="truncate font-semibold text-slate-800">
                  {companyName || "Noma'lum korxona"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-blue-600 disabled:opacity-50"
              title="Yangilash"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>

          {/* List */}

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : loading && backups.length === 0 ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ) : backups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-600">
                Zaxira nusxa hali yo&apos;q
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Dastur yangilanib, internetga ulangach, nusxa avtomatik
                yuboriladi.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup, index) => (
                <div
                  key={backup.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800">
                          {formatDateTime(backup.createdAt)}
                        </p>

                        {index === 0 && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                            Oxirgi
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Users size={13} />
                          {backup.clientsCount} mijoz
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <ShoppingCart size={13} />
                          {backup.ordersCount} buyurtma
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <HardDrive size={13} />
                          {formatSize(backup.sizeBytes)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(backup)}
                      disabled={downloadingId !== null}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Download size={15} />

                      {downloadingId === backup.id
                        ? "Yuklanmoqda..."
                        : "Yuklab olish"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs leading-5 text-slate-400">
            Har bir korxona uchun oxirgi {keepVersions} ta nusxa saqlanadi:
            bugungi va undan oldingi kunniki. Yangi kunning nusxasi
            saqlangandan keyingina eng eskisi o&apos;chiriladi. Yuklab
            olingan faylni dasturda &laquo;Захира нусха → Файлдан
            тиклаш&raquo; orqali tiklash mumkin.
          </p>
        </div>

        {/* ====================================================== */}
        {/* FOOTER */}
        {/* ====================================================== */}

        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
