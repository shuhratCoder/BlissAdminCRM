"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOwner,updateOwner       } from "@/services/owner";
import { toast } from "sonner";

const schema = z.object({
  companyName: z.string().min(2, "Korxona nomi majburiy"),
  username: z.string().min(3, "Username majburiy"),
  password: z.string().min(6, "Kamida 6 ta belgi"),
  phone: z.string().optional(),
  expiresAt: z.string().min(1, "Litsenziya tugash sanasi majburiy"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  owner?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompanyDialog({
  open,
  owner,
  onClose,
  onSuccess,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      expiresAt: today,
    },
  });

 useEffect(() => {
  if (!open) return;

  if (owner) {
    reset({
      companyName: owner.companyName || "",
      username: owner.username || "",
      password: "",
      phone: owner.phone || "",
      expiresAt: owner.license?.expiresAt
        ? owner.license.expiresAt.slice(0, 10)
        : today,
    });
  } else {
    reset({
      companyName: "",
      username: "",
      password: "",
      phone: "",
      expiresAt: today,
    });
  }
}, [open, owner, reset, today]);

  if (!open) return null;

async function onSubmit(values: FormData) {
  try {
    if (owner) {
      await updateOwner(owner.id, {
        companyName: values.companyName,
        username: values.username,
        phone: values.phone,
      });

      toast.success("Firma muvaffaqiyatli yangilandi.");
    } else {
      await createOwner(values);

      toast.success("Firma muvaffaqiyatli qo'shildi.");
    }

    onSuccess();
    onClose();

    reset({
      companyName: "",
      username: "",
      password: "",
      phone: "",
      expiresAt: today,
    });
  } catch (err: any) {
    toast.error(
      err?.response?.data?.message ||
        "Amalni bajarishda xatolik yuz berdi."
    );
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6">
       <h2 className="mb-6 text-2xl font-bold">
  {owner ? "Firmani tahrirlash" : "Firma qo'shish"}
</h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <label>Korxona nomi</label>

            <input
              {...register("companyName")}
              className="mt-1 w-full rounded-lg border p-3"
            />

            <p className="mt-1 text-sm text-red-500">
              {errors.companyName?.message}
            </p>
          </div>

          <div>
            <label>Username</label>

            <input
              {...register("username")}
              className="mt-1 w-full rounded-lg border p-3"
            />

            <p className="mt-1 text-sm text-red-500">
              {errors.username?.message}
            </p>
          </div>

          <div>
            <label>Telefon</label>

            <input
              {...register("phone")}
              className="mt-1 w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label>Parol</label>

            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-lg border p-3"
            />

            <p className="mt-1 text-sm text-red-500">
              {errors.password?.message}
            </p>
          </div>

          <div>
            <label>Litsenziya tugash sanasi</label>

            <input
              type="date"
              min={today}
              {...register("expiresAt")}
              className="mt-1 w-full rounded-lg border p-3"
            />

            <p className="mt-1 text-sm text-red-500">
              {errors.expiresAt?.message}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-2"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
            >
              {isSubmitting
                ? "Saqlanmoqda..."
                : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}