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