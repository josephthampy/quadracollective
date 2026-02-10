// Simplified art service for personal portfolio
import axios from "axios";
const url =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://quadracollective-production.up.railway.app"
    : "http://localhost:8000");

export const getSomePosts = async () => {
  return await axios({
    method: "get",
    url: `${url}/getSomePosts`,
  });
};

export const getPosts = async (page, limit) => {
  return await axios({
    method: "get",
    url: `${url}/getPosts?page=${page}&limit=${limit}`,
  });
};

export const getAPost = async (id) => {
  return await axios({
    method: "get",
    url: `${url}/getAPost/${id}`,
  });
};

// Admin functions - require password
export const postArt = async (form, adminPassword, onUploadProgress) => {
  const formData = new FormData();
  
  // Append text fields first (before files)
  Object.keys(form).forEach(key => {
    if (key !== 'post' && key !== 'mainIndex') {
      formData.append(key, form[key]);
    }
  });
  
  // Append mainIndex explicitly (must be before files for proper parsing)
  const mainIndex = form.mainIndex !== undefined ? form.mainIndex : 0;
  formData.append('mainIndex', mainIndex.toString());
  
  // Append files in the exact order they appear in the array
  if (form.post) {
    // Support multiple images (1-10)
    if (Array.isArray(form.post)) {
      form.post.forEach((file) => {
        if (file) {
          formData.append("post", file);
        }
      });
    } else {
      formData.append("post", form.post);
    }
  }
  
  formData.append('adminPassword', adminPassword);
  
  return await axios({
    method: "post",
    url: `${url}/postArt`,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};

export const updatePost = async (form, adminPassword) => {
  const formData = new FormData();
  Object.keys(form).forEach(key => {
    if (key !== 'pic' && key !== 'post') {
      formData.append(key, form[key]);
    }
  });
  if (form.pic) {
    formData.append('pic', form.pic);
  }
  if (form.post) {
    formData.append('post', form.post);
  }
  formData.append('adminPassword', adminPassword);
  
  return await axios({
    method: "put",
    url: `${url}/updatePost`,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deletePost = async (id, adminPassword) => {
  return await axios({
    method: "delete",
    url: `${url}/deletePost`,
    data: { id, adminPassword },
    headers: { "Content-Type": "application/json" },
  });
};

export const getAllPosts = async (page, limit, adminPassword) => {
  return await axios({
    method: "get",
    url: `${url}/getAllPosts?page=${page}&limit=${limit}`,
    headers: { 
      "Content-Type": "application/json",
      "x-admin-password": adminPassword
    },
  });
};

// Admin authentication
export const adminLogin = async (password) => {
  return await axios({
    method: "post",
    url: `${url}/admin/login`,
    data: { password },
    headers: { "Content-Type": "application/json" },
  });
};
