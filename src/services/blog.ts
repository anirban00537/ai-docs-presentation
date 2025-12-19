import request from "@/lib/request";
import axios from "axios";

export const getPosts = async (params: any) => {
  const response = await request.get("/blog/posts", { params });
  return response.data;
};

export const getPost = async (slug: string) => {
  const response = await request.get(`/blog/posts/${slug}`);
  return response.data;
};

export const getBlogCategories = async () => {
  const response = await request.get("/blog/categories");
  return response.data;
};

// SSR Functions (Bypass request interceptors that use js-cookie)
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET; // Fixed: was NEXT_PUBLIC_API_SECRET_KEY

console.log("[SSR Blog] API_URL:", API_URL);
console.log("[SSR Blog] API_SECRET exists:", !!API_SECRET);

export const getPostsSSR = async (params: any) => {
  console.log("[getPostsSSR] Called with params:", params);
  console.log("[getPostsSSR] Full URL:", `${API_URL}/blog/posts`);
  
  try {
    const { data: response } = await axios.get(`${API_URL}/blog/posts`, {
      params,
      headers: {
        "Content-Type": "application/json",
        "apisecretkeycheck": API_SECRET || ""
      }
    });
    console.log("[getPostsSSR] Response success:", response?.success);
    console.log("[getPostsSSR] Posts count:", response?.data?.posts?.length);
    // ResponseModel: { success, message, data: { posts, total } }
    return response;
  } catch (error: any) {
    console.error("[getPostsSSR] ERROR:", error?.response?.status, error?.message);
    console.error("[getPostsSSR] Response data:", error?.response?.data);
    return null;
  }
};

export const getPostSSR = async (slug: string) => {
  console.log("[getPostSSR] Called with slug:", slug);
  console.log("[getPostSSR] Full URL:", `${API_URL}/blog/posts/${slug}`);
  
  try {
    const { data: response } = await axios.get(`${API_URL}/blog/posts/${slug}`, {
      headers: {
        "Content-Type": "application/json",
        "apisecretkeycheck": API_SECRET || ""
      }
    });
    console.log("[getPostSSR] Response success:", response?.success);
    console.log("[getPostSSR] Post title:", response?.data?.title);
    // ResponseModel: { success, message, data: post }
    if (response?.success && response?.data) {
      return response.data;
    }
    console.log("[getPostSSR] No data in response");
    return null;
  } catch (error: any) {
    console.error("[getPostSSR] ERROR:", error?.response?.status, error?.message);
    console.error("[getPostSSR] Response data:", error?.response?.data);
    return null;
  }
};
