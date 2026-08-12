"use client";

import { Search, Plus } from "lucide-react";

interface Props {
  search: string;
  setSearch: (value: string) => void;

  status: string;
  setStatus: (value: string) => void;

  limit: number;
  setLimit: (value: number) => void;

  onAdd: () => void;
}

export default function CompanyToolbar({
  search,
  setSearch,
  status,
  setStatus,
  limit,
  setLimit,
  onAdd,
}: Props) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Search
            className="absolute left-3 top-3 text-slate-400"
            size={18}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Firma qidirish..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3"
        >
          <option value="all">Barchasi</option>
          <option value="active">Aktiv</option>
          <option value="blocked">Bloklangan</option>
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="rounded-xl border border-slate-200 px-4 py-3"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      <button
        onClick={onAdd}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
      >
        <Plus size={18} />
        Firma qo'shish
      </button>
    </div>
  );
}