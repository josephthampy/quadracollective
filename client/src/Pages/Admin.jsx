import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { getAllPosts, deletePost } from "../Services/Art";
import { toast } from "react-toastify";
import ProductCard from "../Components/Cards/ProductCard";
import CommonSection from "../Components/Common-section/CommonSection";
import "../Assets/css/allProduct.css";

function Admin() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedPassword = localStorage.getItem("adminPassword");
    if (!storedPassword) {
      toast.error("Unauthorized access. Admin login required.");
      navigate("/");
      return;
    }
    
    const fetchPosts = async () => {
      try {
        const response = await getAllPosts(1, 100, storedPassword);
        if (response.data.success) {
          setProducts(response.data.result || []);
        } else {
          toast.error(response.data.message || "Failed to load posts");
          if (response.data.message?.includes("password") || response.data.message?.includes("Unauthorized")) {
            localStorage.removeItem("adminPassword");
            navigate("/admin/login");
          }
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Failed to load posts";
        toast.error(errorMsg);
        if (errorMsg.includes("password") || errorMsg.includes("Unauthorized")) {
          localStorage.removeItem("adminPassword");
          navigate("/admin/login");
        }
        console.log(err);
      }
    };
    
    fetchPosts();
  }, [navigate]);

  const loadPosts = async () => {
    const storedPassword = localStorage.getItem("adminPassword");
    if (!storedPassword) {
      navigate("/admin/login");
      return;
    }
    
    try {
      const response = await getAllPosts(1, 100, storedPassword);
      if (response.data.success) {
        setProducts(response.data.result || []);
      } else {
        toast.error(response.data.message || "Failed to load posts");
        if (response.data.message?.includes("password") || response.data.message?.includes("Unauthorized")) {
          localStorage.removeItem("adminPassword");
          navigate("/admin/login");
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load posts";
      toast.error(errorMsg);
      if (errorMsg.includes("password") || errorMsg.includes("Unauthorized")) {
        localStorage.removeItem("adminPassword");
        navigate("/admin/login");
      }
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    const storedPassword = localStorage.getItem("adminPassword");
    if (!storedPassword) {
      toast.error("Admin access required");
      navigate("/admin/login");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this artwork?")) {
      try {
        const response = await deletePost(id, storedPassword);
        if (response.data.success) {
          toast.success("Artwork deleted successfully");
          loadPosts();
        } else {
          toast.error(response.data.message || "Failed to delete");
          if (response.data.message?.includes("password") || response.data.message?.includes("Unauthorized")) {
            localStorage.removeItem("adminPassword");
            navigate("/admin/login");
          }
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Failed to delete artwork";
        toast.error(errorMsg);
        if (errorMsg.includes("password") || errorMsg.includes("Unauthorized")) {
          localStorage.removeItem("adminPassword");
          navigate("/admin/login");
        }
        console.log(err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminPassword");
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <>
      <CommonSection title="Admin Panel" />
      <section style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(245, 230, 211, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(139, 0, 0, 0.1)', minHeight: '70vh' }}>
        <Container>
          <Row>
            <Col lg="12" className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <h3>Manage Artwork</h3>
                <div className="d-flex gap-2">
                  <Button
                    color="primary"
                    onClick={() => navigate("/post")}
                  >
                    <i className="ri-add-line"></i> Add New Artwork
                  </Button>
                  <Button
                    color="secondary"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </Col>

            {products && products.length > 0 ? (
              products.map((product) => (
                <Col lg="3" md="4" sm="6" className="mb-4" key={product.id ?? product._id}>
                  <div className="position-relative">
                    <ProductCard product={product} />
                    <div className="mt-2 d-flex gap-2">
                      <Button
                        color="warning"
                        size="sm"
                        onClick={() => navigate(`/updatePost/${product.id ?? product._id}`)}
                      >
                        <i className="ri-edit-line"></i> Edit
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(product.id ?? product._id)}
                      >
                        <i className="ri-delete-bin-line"></i> Delete
                      </Button>
                    </div>
                  </div>
                </Col>
              ))
            ) : (
              <Col lg="12">
                <h4 className="text-center">No artwork found</h4>
                <div className="text-center mt-3">
                  <Button
                    color="primary"
                    onClick={() => navigate("/post")}
                  >
                    Add Your First Artwork
                  </Button>
                </div>
              </Col>
            )}
          </Row>
        </Container>
      </section>
    </>
  );
}

export default Admin;
