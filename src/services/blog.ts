import request from "@/lib/request";

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
