import React, { useState, useEffect } from "react";
import HeroSection from "../Components/HeroSection/HeroSection";
import { Container, Row, Col, Spinner, Alert } from "reactstrap";
import { getPosts } from "../Services/Art";
import ProductCard from "../Components/Cards/ProductCard";
import "../Assets/css/s.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 12;

  useEffect(() => {
    // Simple approach: check localStorage first
    const savedPosition = localStorage.getItem('lastScrollPosition') || 
                         sessionStorage.getItem('homeScrollPosition') ||
                         window.homeScrollPosition;
    
    console.log('Home: Checking for saved position:', savedPosition);
    
    if (savedPosition) {
      const position = parseInt(savedPosition);
      console.log('Home: Attempting to restore scroll to:', position);
      
      // Clear all storage
      localStorage.removeItem('lastScrollPosition');
      sessionStorage.removeItem('homeScrollPosition');
      window.homeScrollPosition = null;
      
      // Use multiple attempts to restore scroll
      const restoreScroll = () => {
        window.scrollTo(0, position);
        console.log('Home: Scrolled to position:', position, 'Current position:', window.scrollY);
        
        // If it didn't work, try again
        if (Math.abs(window.scrollY - position) > 50) {
          setTimeout(restoreScroll, 50);
        }
      };
      
      // Try immediately and after delays
      restoreScroll();
      setTimeout(restoreScroll, 100);
      setTimeout(restoreScroll, 300);
      setTimeout(restoreScroll, 500);
    }
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPosts(page, limit);
        
        if (response.data.success) {
          setProducts(response.data.result || []);
          setTotalPages(response.data.totalPage || 1);
        } else {
          setError(response.data.message || "Failed to load artwork");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load artwork. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit]);

  const pageChange = (pageNo) => {
    setPage(pageNo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <HeroSection />
      <section id="artwork" className="py-5 position-relative" style={{ 
        position: 'relative', 
        zIndex: 1, 
        backgroundColor: 'rgba(245, 230, 211, 0.85)', 
        backdropFilter: 'blur(10px)', 
        border: '1px solid rgba(139, 0, 0, 0.1)',
        overflow: 'hidden',
        perspective: '1000px'
      }}>
        {/* Enhanced 3D Animation Elements */}
        <div className="artwork-3d-bg">
          <div className="artwork-3d-shape artwork-3d-shape-1"></div>
          <div className="artwork-3d-shape artwork-3d-shape-2"></div>
          <div className="artwork-3d-shape artwork-3d-shape-3"></div>
          <div className="artwork-3d-shape artwork-3d-shape-4"></div>
          <div className="artwork-3d-shape artwork-3d-shape-5"></div>
          <div className="artwork-3d-shape artwork-3d-shape-6"></div>
          <div className="artwork-3d-shape artwork-3d-shape-7"></div>
          <div className="artwork-3d-shape artwork-3d-shape-8"></div>
        </div>
        <Container className="artwork-content-layer">
          <Row>
            <Col lg="12" className="mb-5 text-center artwork-title-section">
              <h2 style={{ color: '#8b0000', fontWeight: '600' }}>QuadraCollective</h2>
              <p style={{ color: '#5d4037' }}>Discover unique artworks</p>
            </Col>

            {/* Loading State */}
            {loading && (
              <Col lg="12" className="text-center py-5">
                <Spinner color="danger" style={{ color: '#8b0000' }} />
              </Col>
            )}

            {/* Error State */}
            {error && !loading && (
              <Col lg="12">
                <Alert color="danger" className="text-center">
                  {error}
                </Alert>
              </Col>
            )}

            {/* Products Display */}
            {!loading && !error && (
              <div className="position-relative" style={{ minHeight: '400px' }}>
                {/* 3D Background for Artwork Cards */}
                <div className="artwork-cards-3d-bg">
                  <div className="artwork-card-bg-shape artwork-card-bg-shape-1"></div>
                  <div className="artwork-card-bg-shape artwork-card-bg-shape-2"></div>
                  <div className="artwork-card-bg-shape artwork-card-bg-shape-3"></div>
                  <div className="artwork-card-bg-shape artwork-card-bg-shape-4"></div>
                  <div className="artwork-card-bg-shape artwork-card-bg-shape-5"></div>
                  <div className="artwork-card-bg-shape artwork-card-bg-shape-6"></div>
                </div>
                
                <Row className="artwork-cards-layer">
                  {products && products.length > 0 ? (
                    products.map((product, index) => (
                      <Col
                        lg="3"
                        md="4"
                        sm="6"
                        className="mb-4"
                        key={product?.id ?? product?._id ?? index}
                      >
                        <ProductCard product={product} />
                      </Col>
                    ))
                  ) : (
                    <Col lg="12">
                      <h4 className="text-center" style={{ color: '#5d4037' }}>No artwork available yet</h4>
                      <p className="text-center" style={{ color: '#5d4037' }}>
                        Check back later !
                      </p>
                    </Col>
                  )}
                </Row>
              </div>
            )}

            {!loading && totalPages > 1 && (
              <Col lg="12" className="mt-4">
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn"
                    style={{ 
                      backgroundColor: '#8b0000', 
                      color: '#f5e6d3', 
                      border: '2px solid #8b0000',
                      fontWeight: '500'
                    }}
                    onClick={() => pageChange(page - 1)}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </button>
                  <span className="d-flex align-items-center px-3" style={{ color: '#5d4037' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="btn"
                    style={{ 
                      backgroundColor: '#8b0000', 
                      color: '#f5e6d3', 
                      border: '2px solid #8b0000',
                      fontWeight: '500'
                    }}
                    onClick={() => pageChange(page + 1)}
                    disabled={page === totalPages || loading}
                  >
                    Next
                  </button>
                </div>
              </Col>
            )}
          </Row>
        </Container>
      </section>
    </>
  );
}

export default Home;
