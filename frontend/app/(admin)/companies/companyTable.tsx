"use client";

import CompanyRow from "./companyRow";

interface Props {
  owners: any[];
  onEdit: (owner: any) => void;
  onDelete: (owner: any) => void;
  onResetPassword: (owner: any) => void;
  onExtendLicense: (owner: any) => void;
  onBlock: (owner: any) => void;
  onActivate: (owner: any) => void;
}

export default function CompanyTable({
  owners,
  onEdit,
  onDelete,
  onResetPassword,
  onExtendLicense,
  onBlock,
  onActivate,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Korxona
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Username
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Telefon
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Manzil
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Muddat
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amallar
              </th>
            </tr>
          </thead>

          <tbody>
            {owners.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <span className="text-xl">
                        🏢
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-700">
                      Firma topilmadi
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Hozircha kompaniyalar mavjud emas
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              owners.map((owner) => (
                <CompanyRow
                  key={owner.id}
                  owner={owner}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onResetPassword={onResetPassword}
                  onExtendLicense={onExtendLicense}
                  onBlock={onBlock}
                  onActivate={onActivate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}