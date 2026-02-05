import "./App.css";
import Layout from "./Components/Layout/Layout";
// import "boxicons";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Layout />
      <ToastContainer autoClose={2000} />
      {/* 3D Animated Background Elements */}
      <div className="floating-3d floating-3d-1"></div>
      <div className="floating-3d floating-3d-2"></div>
      <div className="floating-3d floating-3d-3"></div>
      <div className="floating-3d floating-3d-4"></div>
      <div className="floating-3d floating-3d-5"></div>
      <div className="floating-3d floating-3d-6"></div>
    </>
  );
}

export default App;
