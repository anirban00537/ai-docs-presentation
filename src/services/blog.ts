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


export const getPostsSSR = async (params: any) => {
  
  try {
    const { data: response } = await axios.get(`${API_URL}/blog/posts`, {
      params,
      headers: {
        "Content-Type": "application/json",
        "apisecretkeycheck": API_SECRET || ""
      }
    });
    // ResponseModel: { success, message, data: { posts, total } }
    return response;
  } catch (error: any) {
    console.error("[getPostsSSR] ERROR:", error?.response?.status, error?.message);
    console.error("[getPostsSSR] Response data:", error?.response?.data);
    return null;
  }
};

export const getPostSSR = async (slug: string) => {
  
  try {
    const { data: response } = await axios.get(`${API_URL}/blog/posts/${slug}`, {
      headers: {
        "Content-Type": "application/json",
        "apisecretkeycheck": API_SECRET || ""
      }
    });
    // ResponseModel: { success, message, data: post }
    if (response?.success && response?.data) {
      return response.data;
    }
    return null;
  } catch (error: any) {
    console.error("[getPostSSR] ERROR:", error?.response?.status, error?.message);
    console.error("[getPostSSR] Response data:", error?.response?.data);
    return null;
  }
};
