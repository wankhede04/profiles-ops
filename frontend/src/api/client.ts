import axios from "axios";

const client = axios.create({ baseURL: "/api" });

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail =
      err.response?.data?.detail ??
      JSON.stringify(err.response?.data) ??
      err.message;
    return Promise.reject(new Error(detail));
  }
);

export default client;
