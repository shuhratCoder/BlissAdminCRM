"use client";

import { useEffect, useState } from "react";

import CompanyToolbar from "./companyToolbar";
import CompanyTable from "./companyTable";
import CompanyDialog from "./companyDialog";
import DeleteCompanyDialog from "./deleteCompanyDialog";
import DeadlineModal from "./deadlineModal";

import {
  getOwners,
  blockOwner,
  activateOwner,
} from "@/services/owner";

export default function CompaniesPage() {
  /*
  |--------------------------------------------------------------------------
  | Companies
  |--------------------------------------------------------------------------
  */

  const [owners, setOwners] =
    useState<any[]>([]);

  /*
  |--------------------------------------------------------------------------
  | Company dialog
  |--------------------------------------------------------------------------
  */

  const [open, setOpen] =
    useState(false);

  const [selectedOwner, setSelectedOwner] =
    useState<any>(null);

  /*
  |--------------------------------------------------------------------------
  | Delete dialog
  |--------------------------------------------------------------------------
  */

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [deleteOwnerData, setDeleteOwnerData] =
    useState<any>(null);

  /*
  |--------------------------------------------------------------------------
  | Deadline / License dialog
  |--------------------------------------------------------------------------
  */

  const [deadlineOpen, setDeadlineOpen] =
    useState(false);

  const [deadlineOwner, setDeadlineOwner] =
    useState<any>(null);

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      pages: 1,
    });

  const [page, setPage] =
    useState(1);

  const [limit, setLimit] =
    useState(10);

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  const [status, setStatus] =
    useState("all");

  const [search, setSearch] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Companiesni yuklash
  |--------------------------------------------------------------------------
  */

  async function load() {
    try {
      const res =
        await getOwners({
          page,
          limit,
          search,
          status,
        });

      setOwners(
        res.owners || []
      );

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

  /*
  |--------------------------------------------------------------------------
  | Filter / pagination o'zgarganda qayta yuklash
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    load();
  }, [
    page,
    limit,
    search,
    status,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Firma qo'shish
  |--------------------------------------------------------------------------
  */

  function handleAdd() {
    setSelectedOwner(null);
    setOpen(true);
  }

  /*
  |--------------------------------------------------------------------------
  | Firma tahrirlash
  |--------------------------------------------------------------------------
  */

  function handleEdit(
    owner: any
  ) {
    setSelectedOwner(owner);
    setOpen(true);
  }

  /*
  |--------------------------------------------------------------------------
  | Firma o'chirish
  |--------------------------------------------------------------------------
  */

  function handleDelete(
    owner: any
  ) {
    setDeleteOwnerData(owner);
    setDeleteOpen(true);
  }

  /*
  |--------------------------------------------------------------------------
  | Parolni almashtirish
  |--------------------------------------------------------------------------
  |
  | Hozircha mavjud funksiyani o'zgartirmaymiz.
  | Keyingi bosqichda ResetPasswordModal bilan ulaymiz.
  |
  */

  function handleResetPassword(
    owner: any
  ) {
    console.log(
      "Reset Password",
      owner
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Litsenziyani uzaytirish
  |--------------------------------------------------------------------------
  */

  function handleExtendLicense(
    owner: any
  ) {
    setDeadlineOwner(owner);
    setDeadlineOpen(true);
  }

  /*
  |--------------------------------------------------------------------------
  | Ownerni bloklash
  |--------------------------------------------------------------------------
  */

  async function handleBlock(
    owner: any
  ) {
    const confirmed =
      window.confirm(
        `"${owner.companyName}" firmasini bloklamoqchimisiz?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await blockOwner(
        owner.id
      );

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

  /*
  |--------------------------------------------------------------------------
  | Ownerni aktiv qilish
  |--------------------------------------------------------------------------
  */

  async function handleActivate(
    owner: any
  ) {
    const confirmed =
      window.confirm(
        `"${owner.companyName}" firmasini aktiv qilmoqchimisiz?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await activateOwner(
        owner.id
      );

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

  /*
  |--------------------------------------------------------------------------
  | Company dialog yopish
  |--------------------------------------------------------------------------
  */

  function handleCompanyClose() {
    setOpen(false);
    setSelectedOwner(null);
  }

  /*
  |--------------------------------------------------------------------------
  | Delete dialog yopish
  |--------------------------------------------------------------------------
  */

  function handleDeleteClose() {
    setDeleteOpen(false);
    setDeleteOwnerData(null);
  }

  /*
  |--------------------------------------------------------------------------
  | Deadline modal yopish
  |--------------------------------------------------------------------------
  */

  function handleDeadlineClose() {
    setDeadlineOpen(false);
    setDeadlineOwner(null);
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* ========================================================== */}
      {/* TOOLBAR */}
      {/* ========================================================== */}

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

      {/* ========================================================== */}
      {/* COMPANY TABLE */}
      {/* ========================================================== */}

      <CompanyTable
        owners={owners}

        onEdit={
          handleEdit
        }

        onDelete={
          handleDelete
        }

        onResetPassword={
          handleResetPassword
        }

        onExtendLicense={
          handleExtendLicense
        }

        onBlock={
          handleBlock
        }

        onActivate={
          handleActivate
        }
      />

      {/* ========================================================== */}
      {/* COMPANY CREATE / EDIT */}
      {/* ========================================================== */}

      <CompanyDialog
        open={open}
        owner={selectedOwner}
        onClose={
          handleCompanyClose
        }
        onSuccess={
          load
        }
      />

      {/* ========================================================== */}
      {/* DELETE */}
      {/* ========================================================== */}

      <DeleteCompanyDialog
        open={deleteOpen}
        owner={deleteOwnerData}
        onClose={
          handleDeleteClose
        }
        onSuccess={
          load
        }
      />

      {/* ========================================================== */}
      {/* LICENSE EXTEND */}
      {/* ========================================================== */}

      <DeadlineModal
        open={deadlineOpen}
        ownerId={
          deadlineOwner?.id || ""
        }
        companyName={
          deadlineOwner?.companyName ||
          ""
        }
        currentExpireDate={
          deadlineOwner?.license
            ?.expiresAt
        }
        onClose={
          handleDeadlineClose
        }
        onSuccess={
          load
        }
      />
    </>
  );
}