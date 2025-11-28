import request from "@/lib/request";

export const googleSignIn = async (idToken: string) => {
  const response = await request.post("/auth/google-login", { idToken });
  return response.data;
};

export const profile = async () => {
  const response = await request.get("/user/profile");
  return response.data;
};

export const signOut = async (refreshToken: string) => {
  const response = await request.post("/auth/logout", { refreshToken });
  return response.data;
};