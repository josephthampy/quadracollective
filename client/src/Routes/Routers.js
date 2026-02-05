import { Routes, Route } from "react-router-dom";
import Home from "../Pages/Home";
import Post from "../Pages/Post";
import AllProducts from "../Pages/AllProduct";
import SinglePost from "../Pages/SinglePost";
import UpdatePost from "../Pages/UpdatePost";
import Admin from "../Pages/Admin";
import AdminLogin from "../Pages/AdminLogin";
import Error404 from "../Pages/Error";

function Routers() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/market" element={<AllProducts />} />
        <Route path="/aProduct/:id" element={<SinglePost />} />
        <Route path="/post" element={<Post />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/updatePost/:id" element={<UpdatePost />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
  );
}

export default Routers;
