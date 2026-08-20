"use client";

import { useEffect, useState } from "react";

import CompanyToolbar from "./companyToolbar";
import CompanyTable from "./companyTable";
import CompanyDialog from "./companyDialog";
import DeleteCompanyDialog from "./deleteCompanyDialog";
import DeadlineModal from "./deadlineModal";
import ResetPasswordModal from "./resetPaswordModal";

import {
  getOwners,
  blockOwner,
  activateOwner,
} from "@/services/owner";

export default function CompaniesPage() {
  // ==========================================================
  // COMPANIES
  // ==========================================================

  const [owners, setOwners] = useState<any[]>([]);

  // ==========================================================
  // COMPANY CREATE / EDIT
  // ==========================================================

  const [open, setOpen] = useState(false);

  const [selectedOwner, setSelectedOwner] =
    useState<any>(null);

  // ==========================================================
  // DELETE
  // ==========================================================

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [deleteOwnerData, setDeleteOwnerData] =
    useState<any>(null);

  // ==========================================================
  // LICENSE / DEADLINE
  // ==========================================================

  const [deadlineOpen, setDeadlineOpen] =
    useState(false);

  const [deadlineOwner, setDeadlineOwner] =
    useState<any>(null);

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  const [resetPasswordOpen, setResetPasswordOpen] =
    useState(false);

  const [resetPasswordOwner, setResetPasswordOwner] =
    useState<any>(null);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [status, setStatus] = useState("all");

  const [search, setSearch] = useState("");

  // ==========================================================
  // LOAD COMPANIES
  // ==========================================================

  async function load() {
    try {
      const res = await getOwners({
        page,
        limit,
        search,
        status,
      });

      setOwners(res.owners || []);

      setPagination(
        res.pagination || {
          page,
          limit,
          total: 0,
          pages: 1,
        }
      );
    } catch (error) {
      console.error(
        "COMPANIES LOAD ERROR:",
        error
      );
    }
  }

  // ==========================================================
  // RELOAD
  // ==========================================================

  useEffect(() => {
    load();
  }, [
    page,
    limit,
    search,
    status,
  ]);

  // ==========================================================
  // ADD COMPANY
  // ==========================================================

  function handleAdd() {
    setSelectedOwner(null);
    setOpen(true);
  }

  // ==========================================================
  // EDIT COMPANY
  // ==========================================================

  function handleEdit(owner: any) {
    setSelectedOwner(owner);
    setOpen(true);
  }

  // ==========================================================
  // DELETE COMPANY
  // ==========================================================

  function handleDelete(owner: any) {
    setDeleteOwnerData(owner);
    setDeleteOpen(true);
  }

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  function handleResetPassword(owner: any) {
    setResetPasswordOwner(owner);
    setResetPasswordOpen(true);
  }

  // ==========================================================
  // CLOSE RESET PASSWORD
  // ==========================================================

  function handleResetPasswordClose() {
    setResetPasswordOpen(false);
    setResetPasswordOwner(null);
  }

  // ==========================================================
  // EXTEND LICENSE
  // ==========================================================

  function handleExtendLicense(owner: any) {
    setDeadlineOwner(owner);
    setDeadlineOpen(true);
  }

  // ==========================================================
  // BLOCK OWNER
  // ==========================================================

  async function handleBlock(owner: any) {
    const confirmed = window.confirm(
      `"${owner.companyName}" firmasini bloklamoqchimisiz?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await blockOwner(owner.id);

      await load();
    } catch (error: any) {
      console.error(
        "BLOCK OWNER ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Ownerni bloklashda xatolik yuz berdi."
      );
    }
  }

  // ==========================================================
  // ACTIVATE OWNER
  // ==========================================================

  async function handleActivate(owner: any) {
    const confirmed = window.confirm(
      `"${owner.companyName}" firmasini aktiv qilmoqchimisiz?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await activateOwner(owner.id);

      await load();
    } catch (error: any) {
      console.error(
        "ACTIVATE OWNER ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Ownerni aktiv qilishda xatolik yuz berdi."
      );
    }
  }

  // ==========================================================
  // CLOSE COMPANY DIALOG
  // ==========================================================

  function handleCompanyClose() {
    setOpen(false);
    setSelectedOwner(null);
  }

  // ==========================================================
  // CLOSE DELETE DIALOG
  // ==========================================================

  function handleDeleteClose() {
    setDeleteOpen(false);
    setDeleteOwnerData(null);
  }

  // ==========================================================
  // CLOSE DEADLINE MODAL
  // ==========================================================

  function handleDeadlineClose() {
    setDeadlineOpen(false);
    setDeadlineOwner(null);
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ====================================================== */}
      {/* TOOLBAR */}
      {/* ====================================================== */}

      <CompanyToolbar
        search={search}
        setSearch={(value) => {
          setSearch(value);

          if (page !== 1) {
            setPage(1);
          }
        }}
        status={status}
        setStatus={(value) => {
          setStatus(value);

          if (page !== 1) {
            setPage(1);
          }
        }}
        limit={limit}
        setLimit={(value) => {
          setLimit(value);

          if (page !== 1) {
            setPage(1);
          }
        }}
        onAdd={handleAdd}
      />

      {/* ====================================================== */}
      {/* COMPANY TABLE */}
      {/* ====================================================== */}

      <CompanyTable
        owners={owners}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
        onExtendLicense={handleExtendLicense}
        onBlock={handleBlock}
        onActivate={handleActivate}
      />

      {/* ====================================================== */}
      {/* COMPANY CREATE / EDIT */}
      {/* ====================================================== */}

      <CompanyDialog
        open={open}
        owner={selectedOwner}
        onClose={handleCompanyClose}
        onSuccess={load}
      />

      {/* ====================================================== */}
      {/* DELETE */}
      {/* ====================================================== */}

      <DeleteCompanyDialog
        open={deleteOpen}
        owner={deleteOwnerData}
        onClose={handleDeleteClose}
        onSuccess={load}
      />

      {/* ====================================================== */}
      {/* LICENSE EXTEND */}
      {/* ====================================================== */}

      <DeadlineModal
        open={deadlineOpen}
        ownerId={
          deadlineOwner?.id || ""
        }
        companyName={
          deadlineOwner?.companyName || ""
        }
        currentExpireDate={
          deadlineOwner?.license?.expiresAt
        }
        onClose={handleDeadlineClose}
        onSuccess={load}
      />

      {/* ====================================================== */}
      {/* RESET PASSWORD */}
      {/* ====================================================== */}

      <ResetPasswordModal
        open={resetPasswordOpen}
        ownerId={
          resetPasswordOwner?.id || ""
        }
        companyName={
          resetPasswordOwner?.companyName || ""
        }
        onClose={
          handleResetPasswordClose
        }
        onSuccess={load}
      />
    </>
  );
}