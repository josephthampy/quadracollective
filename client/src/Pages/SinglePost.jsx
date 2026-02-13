import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import Footer from "../Components/Footer/Footer";
import { getAPost } from "../Services/Art";
import "../Assets/css/singlepost.css";

function SinglePost() {
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { id } = useParams();

  const apiBaseUrl =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://quadracollective-production.up.railway.app"
      : "http://localhost:8000");

  const resolveImageUrl = (value) => {
    if (typeof value !== "string") return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("data:")) return trimmed;
    if (trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("http://")) return `https://${trimmed.slice("http://".length)}`;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    if (trimmed.startsWith("/")) return `${apiBaseUrl}${trimmed}`;

    return `${apiBaseUrl}/${trimmed}`;
  };

  useEffect(() => {
    if (!id || id === "undefined" || Number.isNaN(parseInt(id, 10))) {
      toast.error("Invalid artwork id");
      navigate("/", { replace: true });
      return;
    }

    // Get scroll position from router state
    const scrollPosition = location.state?.scrollPosition || window.scrollY || document.documentElement.scrollTop;
    sessionStorage.setItem('homeScrollPosition', scrollPosition.toString());
    console.log('SinglePost: Saved scroll position from router state:', scrollPosition);
    
    // Always start this page scrolled to the top
    window.scrollTo({ top: 0, behavior: "smooth" });

    const load = async () => {
      try {
        const data = await getAPost(id);
        const productData = data?.data?.result || {};
        setProduct(productData);
        // The main image should always be the first one in the images array
        setSelectedImageIndex(0);
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to load artwork";
        toast.error(msg);
        console.log(err);
        navigate("/", { replace: true });
      }
    };

    load();
  }, [id, location.state, navigate]);

  const handleBackToHome = () => {
    // Get saved scroll position
    const savedPosition = sessionStorage.getItem('homeScrollPosition');
    console.log('Retrieved scroll position:', savedPosition);
    
    if (savedPosition) {
      // Store position in window object for immediate access
      window.homeScrollPosition = parseInt(savedPosition);
      console.log('Set window.homeScrollPosition to:', window.homeScrollPosition);
      
      // Also store in sessionStorage as backup
      sessionStorage.setItem('restoreScrollPosition', savedPosition);
    }
    
    // Navigate to home with a slight delay to ensure position is set
    setTimeout(() => {
      navigate("/", { replace: false });
    }, 10);
  };
  const rawImages =
    (product.images && product.images.length && product.images) ||
    (product.post ? [product.post] : []);

  const mainImageUrl = resolveImageUrl(product.post);
  const normalizedImages = (Array.isArray(rawImages) ? rawImages : [])
    .map(resolveImageUrl)
    .filter(Boolean);

  let displayImages = [];
  if (mainImageUrl) {
    displayImages = [mainImageUrl, ...normalizedImages.filter((img) => img !== mainImageUrl)];
  } else {
    displayImages = normalizedImages;
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Logo Section - Now at the very top */}
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div className="singlepost-logo-section">
          <img 
            src="/images/quadralogo.png" 
            alt="QUADRA COLLECTIVE" 
            className="singlepost-logo-image"
          />
        </div>
      </div>

      <section style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(245, 230, 211, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(139, 0, 0, 0.1)', minHeight: '70vh', overflow: 'hidden', perspective: '1000px' }}>
        {/* 3D Background Elements */}
        <div className="singlepost-3d-bg">
          <div className="singlepost-bg-shape singlepost-bg-shape-1"></div>
          <div className="singlepost-bg-shape singlepost-bg-shape-2"></div>
          <div className="singlepost-bg-shape singlepost-bg-shape-3"></div>
          <div className="singlepost-bg-shape singlepost-bg-shape-4"></div>
          <div className="singlepost-bg-shape singlepost-bg-shape-5"></div>
          <div className="singlepost-bg-shape singlepost-bg-shape-6"></div>
          <div className="singlepost-bg-shape singlepost-bg-shape-7"></div>
          <div className="singlepost-bg-shape singlepost-bg-shape-8"></div>
        </div>
        
        <Container>
          <Row>
            <Col lg="6" md="6" sm="6">
              {displayImages.length > 0 && (
                <div className="single__nft-img-container">
                  <div className="main__img-wrapper position-relative">
                    <img
                      src={displayImages[selectedImageIndex]}
                      alt={product.title || "Artwork image"}
                      className="w-100 single__nft-img mb-3"
                    />
                    {displayImages.length > 1 && (
                      <>
                        <button className="nav__btn prev__btn" onClick={prevImage}>
                          <i className="ri-arrow-left-s-line"></i>
                        </button>
                        <button className="nav__btn next__btn" onClick={nextImage}>
                          <i className="ri-arrow-right-s-line"></i>
                        </button>
                      </>
                    )}
                  </div>
                  {displayImages.length > 1 && (
                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                      {displayImages.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`${product.title || "Artwork"} ${index + 1}`}
                          className={`single__nft-img-thumb ${index === selectedImageIndex ? 'active' : ''}`}
                          onClick={() => setSelectedImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Col>

            <Col lg="6" md="6" sm="6">
              <div className="single__nft__content">
                <div className="mb-3">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleBackToHome}
                    style={{ backgroundColor: '#8b0000', borderColor: '#8b0000', color: '#f5e6d3' }}
                  >
                    <i className="ri-arrow-left-line"></i> Back to Home
                  </button>
                </div>
                
                <h2 style={{ color: '#8b0000', fontWeight: '600', marginBottom: '20px' }}>{product.title}</h2>

                
                <div className="my-4">
                  <h5 style={{ color: '#8b0000', fontWeight: '600' }}>Description</h5>
                  <p style={{ color: '#5d4037', lineHeight: '1.6' }}>{product.description}</p>
                </div>
                
                <div className="my-4">
                  <h5 style={{ color: '#8b0000', fontWeight: '600' }}>Price</h5>
                  <p className="h4" style={{ color: '#8b0000', fontWeight: '700' }}>${product.price}</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      <Footer />
      {/* <LiveAuction /> */}
    </>
  );
}

export default SinglePost;
