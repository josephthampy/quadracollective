import "./App.css";
import Layout from "./Components/Layout/Layout";
// import "boxicons";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const BUILD_ID = "2026-02-10T21:05+0530";

  return (
    <>
      <Layout />
      <ToastContainer autoClose={2000} />
      <div
        style={{
          position: "fixed",
          left: 8,
          bottom: 8,
          zIndex: 999999,
          fontSize: 12,
          lineHeight: "16px",
          padding: "6px 10px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.2)",
          pointerEvents: "none",
        }}
      >
        Build: {BUILD_ID}
      </div>
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
