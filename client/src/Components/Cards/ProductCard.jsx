import React from "react";
import { Link } from "react-router-dom";
import "./card.css";

const ProductCard = (props) => {
  const productId = props.product?.id ?? props.product?._id;
  const detailsPath = productId ? `/aProduct/${productId}` : "/";

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

  const placeholderImg =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
        <rect width='100%' height='100%' fill='#f5e6d3'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#8b0000' font-family='Arial' font-size='24'>No Image</text>
      </svg>`
    );

  const imgSrc =
    resolveImageUrl(props.product?.post) ||
    (Array.isArray(props.product?.images) ? resolveImageUrl(props.product.images[0]) : null) ||
    placeholderImg;

  const handleCardClick = (e) => {
    // Save scroll position when clicking on artwork
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    console.log('ProductCard: Saved scroll position:', scrollPosition);
    
    // Store in localStorage (more persistent)
    localStorage.setItem('lastScrollPosition', scrollPosition.toString());
    
    // Also try sessionStorage
    sessionStorage.setItem('homeScrollPosition', scrollPosition.toString());
  };

  return (
    <div className="single__nft__card">
      {/* 3D Background Elements */}
      <div className="product-card-bg-shape product-card-bg-shape-1"></div>
      <div className="product-card-bg-shape product-card-bg-shape-2"></div>
      <div className="product-card-bg-shape product-card-bg-shape-3"></div>
      <div className="product-card-bg-shape product-card-bg-shape-4"></div>
      <div className="product-card-bg-shape product-card-bg-shape-5"></div>
      <div className="product-card-bg-shape product-card-bg-shape-6"></div>

      <div className="nft__img">
        <img
          src={imgSrc}
          alt={props.product?.title || "Artwork"}
          className="w-100"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholderImg;
          }}
        />
      </div>

      <div className="nft__content">
        <h5 className="nft__title">
          <Link 
            to={detailsPath}
            onClick={handleCardClick}
          >
            {props.product.title}
          </Link>
        </h5>

        <div className="creator__info-wrapper">
          <div className="creator__info">
            <div>
              <h6>Description</h6>
              <p className="product-card-description">{props.product?.description || ""}</p>
            </div>

            <div>
              <h6>Price</h6>
              <p>₹{props.product.price}</p>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link 
            to={detailsPath}
            className="bid__btn"
            onClick={handleCardClick}
          >
            <i className="ri-eye-line"></i> View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
