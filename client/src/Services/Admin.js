// const axios = require("axios").default;
import axios from "axios";
// const url = "https://art-selling-website.onrender.com"
const url = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const getAllUser = async (page,limit) => {
  return await axios({
    method: "get",
    url: `${url}/users?page=${page}&limit=${limit}`,
  });
};

export const getSomeUser = async () => {
  return await axios({
    method: "get",
    url: `${url}/someUsers`,
  });
};

export const suspend = async (form) => {
  return await axios({
    method: "post",
    url: `${url}/suspend`,
    data: form,
    headers: { "Content-Type": "application/json" },
  });
};
