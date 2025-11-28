import axios from "axios";
import Cookie from "js-cookie";

const request = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    apisecretkeycheck: process.env.API_SECRET_KEY,
  },
});

request.interceptors.request.use((config: any) => {
  const token = Cookie.get("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
request.interceptors.response.use((response: any) => {
  return response;
});

export function apiRequest(base: any, query: any | null) {
  if (query === null) {
    return request(base);
  } else {
    return axios.get(base + query);
  }
}
export default request;