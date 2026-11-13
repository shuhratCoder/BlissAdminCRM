import api from "./api";

export async function getOwners({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
}) {
  const { data } = await api.get("/admin", {
    params: {
      page,
      limit,
      search,
      status,
    },
  });

  return data;
}

export const createOwner = async (body: any) => {
  const { data } = await api.post(
    "/admin/createOwner",
    body
  );

  return data;
};

export const deleteOwner = async (
  id: string
) => {
  const { data } = await api.delete(
    `/admin/${id}`
  );

  return data;
};

export const blockOwner = async (
  id: string
) => {
  const { data } = await api.patch(
    `/admin/${id}/block`
  );

  return data;
};

export const activateOwner = async (
  id: string
) => {
  const { data } = await api.patch(
    `/admin/${id}/activate`
  );

  return data;
};

export const resetPassword = async (
  id: string,
  password: string
) => {
  const { data } = await api.patch(
    `/admin/${id}/reset-password`,
    {
      password,
    }
  );

  return data;
};

export const extendLicense = (
  id: string,
  data: { expiresAt: string }
) => {
  return api.patch(
    `/admin/${id}/extend-license`,
    data
  );
};

export const updateOwner = (
  id: string,
  data: {
    companyName: string;
    username: string;
    phone?: string;
    address?: string;
  }
) => {
  return api.put(
    `/admin/${id}`,
    data
  );
};

/*
|--------------------------------------------------------------------------
| Zaxira nusxalar (desktop dasturdan yuborilgan ma'lumotlar)
|--------------------------------------------------------------------------
*/

export const getOwnerBackups = async (
  id: string
) => {
  const { data } = await api.get(
    `/admin/${id}/backups`
  );

  return data;
};

export const downloadOwnerBackup = async (
  id: string,
  backupId: string
): Promise<{ blob: Blob; fileName: string }> => {
  const response = await api.get(
    `/admin/${id}/backups/${backupId}/download`,
    {
      responseType: "blob",
    }
  );

  const fileName =
    response.headers["x-backup-file-name"] ||
    `bliss-zaxira-${backupId}.blissbak`;

  return {
    blob: response.data,
    fileName,
  };
};
