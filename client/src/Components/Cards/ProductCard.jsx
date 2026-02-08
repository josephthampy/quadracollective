
import React from "react";
import { Link } from "react-router-dom";
import "./card.css";

const ProductCard = (props) => {
  const productId = props.product?.id ?? props.product?._id;
  const detailsPath = productId ? `/aProduct/${productId}` : "/";

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
        <img src={props.product.post} alt={props.product.title} className="w-100" />
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
              <p>{props.product.description.substring(0, 50)}...</p>
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
