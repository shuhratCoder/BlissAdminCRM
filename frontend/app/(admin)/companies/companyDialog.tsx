"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createOwner,
  updateOwner,
} from "@/services/owner";
import { toast } from "sonner";

/*
|--------------------------------------------------------------------------
| Validation schema
|--------------------------------------------------------------------------
|
| Password bu yerda optional.
|
| Sababi:
| - yangi firma qo'shilganda password majburiyligini
|   onSubmit ichida tekshiramiz;
| - firma tahrirlanganda password kiritish shart emas.
|
*/

const schema = z.object({
  companyName: z
    .string()
    .trim()
    .min(
      2,
      "Korxona nomi kamida 2 ta belgidan iborat bo'lishi kerak"
    ),

  username: z
    .string()
    .trim()
    .min(
      3,
      "Username kamida 3 ta belgidan iborat bo'lishi kerak"
    ),

  password: z
    .string()
    .optional(),

  phone: z
    .string()
    .trim()
    .min(
      7,
      "Telefon raqami majburiy"
    ),

  address: z
    .string()
    .trim()
    .min(
      3,
      "Manzil majburiy"
    ),

  expiresAt: z
    .string()
    .min(
      1,
      "Litsenziya tugash sanasi majburiy"
    ),
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
  /*
  |--------------------------------------------------------------------------
  | Bugungi sana
  |--------------------------------------------------------------------------
  */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  /*
  |--------------------------------------------------------------------------
  | React Hook Form
  |--------------------------------------------------------------------------
  */

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormData>({
    defaultValues: {
      companyName: "",
      username: "",
      password: "",
      phone: "",
      address: "",
      expiresAt: today,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | Modal ochilganda formani to'ldirish
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    clearErrors();

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    if (owner) {
      reset({
        companyName:
          owner.companyName || "",

        username:
          owner.username || "",

        password:
          "",

        phone:
          owner.phone || "",

        address:
          owner.address || "",

        expiresAt:
          owner.license?.expiresAt
            ? owner.license.expiresAt.slice(
                0,
                10
              )
            : today,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    reset({
      companyName: "",
      username: "",
      password: "",
      phone: "",
      address: "",
      expiresAt: today,
    });
  }, [
    open,
    owner,
    reset,
    clearErrors,
    today,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Modal yopiq bo'lsa render qilmaymiz
  |--------------------------------------------------------------------------
  */

  if (!open) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  async function onSubmit(
    values: FormData
  ) {
    /*
    |--------------------------------------------------------------------------
    | Oldingi validation errorlarni tozalash
    |--------------------------------------------------------------------------
    */

    clearErrors();

    /*
    |--------------------------------------------------------------------------
    | Zod validation
    |--------------------------------------------------------------------------
    |
    | Muhim:
    | safeParse ishlatyapmiz.
    |
    | Bu yerda ZodError throw bo'lmaydi.
    | Shuning uchun development server yiqilmaydi.
    |
    */

    const validation =
      schema.safeParse(values);

    if (!validation.success) {
      for (
        const issue of validation.error
          .issues
      ) {
        const field =
          issue.path[0];

        if (
          typeof field ===
          "string"
        ) {
          setError(
            field as keyof FormData,
            {
              type: "manual",
              message:
                issue.message,
            }
          );
        }
      }

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Validated data
    |--------------------------------------------------------------------------
    */

    const data =
      validation.data;

    /*
    |--------------------------------------------------------------------------
    | Yangi firma uchun password majburiy
    |--------------------------------------------------------------------------
    */

    if (!owner) {
      if (
        !data.password ||
        data.password.trim() === ""
      ) {
        setError(
          "password",
          {
            type: "manual",
            message:
              "Parol majburiy",
          }
        );

        return;
      }

      if (
        data.password.length <
        6
      ) {
        setError(
          "password",
          {
            type: "manual",
            message:
              "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
          }
        );

        return;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | API
    |--------------------------------------------------------------------------
    */

    try {
      /*
      |--------------------------------------------------------------------------
      | CREATE
      |--------------------------------------------------------------------------
      */

      if (!owner) {
        await createOwner({
          companyName:
            data.companyName,

          username:
            data.username,

          password:
            data.password || "",

          phone:
            data.phone,

          address:
            data.address,

          expiresAt:
            data.expiresAt,
        });

        toast.success(
          "Firma muvaffaqiyatli qo'shildi."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */

      else {
        await updateOwner(
          owner.id,
          {
            companyName:
              data.companyName,

            username:
              data.username,

            phone:
              data.phone,

            address:
              data.address,
          }
        );

        toast.success(
          "Firma muvaffaqiyatli yangilandi."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Success
      |--------------------------------------------------------------------------
      */

      onSuccess();

      onClose();

      reset({
        companyName: "",
        username: "",
        password: "",
        phone: "",
        address: "",
        expiresAt: today,
      });
    } catch (error: any) {
      /*
      |--------------------------------------------------------------------------
      | API error
      |--------------------------------------------------------------------------
      */

      console.error(
        "COMPANY SAVE ERROR:",
        error
      );

      const message =
        error?.response?.data
          ?.message ||
        "Amalni bajarishda xatolik yuz berdi.";

      toast.error(message);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

        {/* Header */}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {owner
              ? "Firmani tahrirlash"
              : "Firma qo'shish"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {owner
              ? "Firma ma'lumotlarini o'zgartiring"
              : "Yangi firma ma'lumotlarini kiriting"}
          </p>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-4"
        >

          {/* ====================================================== */}
          {/* COMPANY NAME */}
          {/* ====================================================== */}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Korxona nomi{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              {...register(
                "companyName"
              )}
              placeholder="Korxona nomini kiriting"
              className={`mt-1 w-full rounded-lg border p-3 outline-none transition ${
                errors.companyName
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors.companyName
                    .message
                }
              </p>
            )}
          </div>

          {/* ====================================================== */}
          {/* USERNAME */}
          {/* ====================================================== */}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Username{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              {...register(
                "username"
              )}
              placeholder="Username kiriting"
              autoComplete="off"
              className={`mt-1 w-full rounded-lg border p-3 outline-none transition ${
                errors.username
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {errors.username && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors.username
                    .message
                }
              </p>
            )}
          </div>

          {/* ====================================================== */}
          {/* PHONE */}
          {/* ====================================================== */}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Telefon{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="tel"
              {...register(
                "phone"
              )}
              placeholder="+998901234567"
              className={`mt-1 w-full rounded-lg border p-3 outline-none transition ${
                errors.phone
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors.phone
                    .message
                }
              </p>
            )}
          </div>

          {/* ====================================================== */}
          {/* ADDRESS */}
          {/* ====================================================== */}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Manzil{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              {...register(
                "address"
              )}
              placeholder="Korxona manzilini kiriting"
              className={`mt-1 w-full rounded-lg border p-3 outline-none transition ${
                errors.address
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {errors.address && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors.address
                    .message
                }
              </p>
            )}
          </div>

          {/* ====================================================== */}
          {/* PASSWORD */}
          {/* ====================================================== */}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Parol{" "}

              {!owner && (
                <span className="text-red-500">
                  *
                </span>
              )}
            </label>

            <input
              type="password"
              {...register(
                "password"
              )}
              placeholder={
                owner
                  ? "O'zgartirish uchun yangi parol"
                  : "Parol kiriting"
              }
              autoComplete="new-password"
              className={`mt-1 w-full rounded-lg border p-3 outline-none transition ${
                errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {owner && (
              <p className="mt-1 text-xs text-gray-500">
                Parolni o'zgartirmoqchi
                bo'lmasangiz, bo'sh
                qoldiring.
              </p>
            )}

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors.password
                    .message
                }
              </p>
            )}
          </div>

          {/* ====================================================== */}
          {/* LICENSE */}
          {/* ====================================================== */}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Litsenziya tugash sanasi{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="date"
              min={today}
              {...register(
                "expiresAt"
              )}
              className={`mt-1 w-full rounded-lg border p-3 outline-none transition ${
                errors.expiresAt
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {errors.expiresAt && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors.expiresAt
                    .message
                }
              </p>
            )}
          </div>

          {/* ====================================================== */}
          {/* BUTTONS */}
          {/* ====================================================== */}

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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