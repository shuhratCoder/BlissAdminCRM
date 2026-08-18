"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";


export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  try {
    setLoading(true);
    setError("");

    const res = await api.post("/admin/login", form);

localStorage.setItem("token", res.data.token);

router.replace("/dashboard");
  } catch (err: any) {
    setError(
      err.response?.data?.message ||
      "Login yoki parol noto'g'ri."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            BLISS ADMIN
          </h1>

          <p className="text-gray-500 mt-2">
            Administrator paneliga kirish
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block mb-2 text-sm font-medium">
              Username
            </label>

            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 text-red-600 p-3 text-sm">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Kirilmoqda..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}