import { api } from "./api";
import { getProfile as fetchProfile } from "./profileService";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await api.post(
    "/auth/register",
    {
      name,
      email,
      password,
    }
  );

  return response.data;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const response = await api.post(
    "/auth/login",
    {
      email,
      password,
    }
  );

  return response.data;
};

export const getProfile = fetchProfile;
