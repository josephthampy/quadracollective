
import React from "react";
import { Link } from "react-router-dom";
import "./card.css";

const ProductCard = (props) => {
  const productId = props.product?.id ?? props.product?._id;
  const detailsPath = productId ? `/aProduct/${productId}` : "/";

  const placeholderImg =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
        <rect width='100%' height='100%' fill='#f5e6d3'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#8b0000' font-family='Arial' font-size='24'>No Image</text>
      </svg>`
    );

  const imgSrc =
    props.product?.post ||
    (Array.isArray(props.product?.images) ? props.product.images[0] : null) ||
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
    <div className="single__nft__card product-card">
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

        <div className="creator__info-wrapper d-flex gap-3">
          <div className="creator__info w-100 d-flex align-items-center justify-content-between">
            <div>
              <h6>Description</h6>
              <p>{(props.product?.description || "").substring(0, 50)}...</p>
            </div>

            <div>
              <h6>Price</h6>
              <p>${props.product.price}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 d-flex align-items-center justify-content-between gap-2">
          <Link 
            to={detailsPath}
            className="bid__btn d-flex align-items-center gap-1"
            style={{ textDecoration: 'none', color: 'inherit' }}
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
