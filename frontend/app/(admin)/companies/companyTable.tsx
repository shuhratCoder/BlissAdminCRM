"use client";

import CompanyRow from "./companyRow";

interface Props {
  owners: any[];
  onEdit: (owner: any) => void;
  onDelete: (owner: any) => void;
  onResetPassword: (owner: any) => void;
  onExtendLicense: (owner: any) => void;
}

export default function CompanyTable({
  owners,
  onEdit,
  onDelete,
  onResetPassword,
  onExtendLicense,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-4 text-left">Korxona</th>
            <th>Username</th>
            <th>Telefon</th>
            <th>Muddat</th>
            <th>Status</th>
            <th className="w-[220px]">Amallar</th>
          </tr>
        </thead>

        <tbody>
  {owners.map((owner) => (
    <CompanyRow
      key={owner.id}
      owner={owner}
      onEdit={onEdit}
      onDelete={onDelete}
      onResetPassword={onResetPassword}
      onExtendLicense={onExtendLicense}
    />
  ))}
</tbody>
      </table>
    </div>
  );
}