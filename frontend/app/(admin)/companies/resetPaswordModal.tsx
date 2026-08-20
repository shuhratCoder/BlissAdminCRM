"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { resetPassword } from "@/services/owner";

interface Props {
  open: boolean;
  ownerId: string;
  companyName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ResetPasswordModal({
  open,
  ownerId,
  companyName,
  onClose,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  if (!open) {
    return null;
  }

  function handleClose() {
    if (loading) {
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);

    onClose();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const value = password.trim();

    if (!value) {
      toast.error("Yangi parolni kiriting.");
      return;
    }

    if (value.length < 6) {
      toast.error(
        "Parol kamida 6 ta belgidan iborat bo'lishi kerak."
      );
      return;
    }

    if (value !== confirmPassword) {
      toast.error("Parollar bir xil emas.");
      return;
    }

    if (!ownerId) {
      toast.error("Firma aniqlanmadi.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(
        ownerId,
        value
      );

      toast.success(
        "Parol muvaffaqiyatli yangilandi."
      );

      setPassword("");
      setConfirmPassword("");

      setShowPassword(false);
      setShowConfirmPassword(false);

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Parolni almashtirishda xatolik yuz berdi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-slate-100 p-5">

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Parolni almashtirish
            </h2>

            {companyName && (
              <p className="mt-1 text-sm text-slate-500">
                {companyName}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>

        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          <div className="space-y-4 p-6">

            {/* NEW PASSWORD */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Yangi parol
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Yangi parol"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 pr-11 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Kamida 6 ta belgi.
              </p>

            </div>

            {/* CONFIRM PASSWORD */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Parolni tasdiqlang
              </label>

              <div className="relative">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Parolni qayta kiriting"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 pr-11 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="flex justify-end gap-3 border-t border-slate-100 p-5">

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saqlanmoqda..."
                : "Saqlash"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}