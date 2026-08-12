"use client";

import { useEffect, useState } from "react";

import CompanyToolbar from "./companyToolbar";
import CompanyTable from "./companyTable";
import CompanyDialog from "./companyDialog";
import DeleteCompanyDialog from "./deleteCompanyDialog";

import { getOwners } from "@/services/owner";

export default function CompaniesPage() {
  const [owners, setOwners] = useState<any[]>([]);

  const [open, setOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

const [deleteOwnerData, setDeleteOwnerData] =
  useState<any>(null);

const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  pages: 1,
});
  const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
const [status, setStatus] = useState("all");
const [search, setSearch] = useState("");
async function load() {
  try {
    const res = await getOwners({
      page,
      limit,
      search,
      status,
    });

    setOwners(res.owners);
    setPagination(res.pagination);
  } catch (error) {
    console.error(error);
  }
}

 useEffect(() => {
  load();
}, [page, limit, search, status]);
  return (
    <>
     <CompanyToolbar
  search={search}
  setSearch={setSearch}
  status={status}
  setStatus={setStatus}
  limit={limit}
  setLimit={setLimit}
  onAdd={() => {
    setSelectedOwner(null);
    setOpen(true);
  }}
/>

      <CompanyTable
        owners={owners}
        onEdit={(owner) => {
          setSelectedOwner(owner);
          setOpen(true);
        }}
        onDelete={(owner) => {
          setDeleteOwnerData(owner);
          setDeleteOpen(true);
        }}
        onResetPassword={(owner) => {
          console.log("Reset Password", owner);
        }}
        onExtendLicense={(owner) => {
          console.log("Extend License", owner);
        }}
      />

      <CompanyDialog
        open={open}
        owner={selectedOwner}
        onClose={() => {
          setOpen(false);
          setSelectedOwner(null);
        }}
        onSuccess={load}
      />

      <DeleteCompanyDialog
        open={deleteOpen}
        owner={deleteOwnerData}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteOwnerData(null);
        }}
        onSuccess={load}
      />
    </>
  );
}