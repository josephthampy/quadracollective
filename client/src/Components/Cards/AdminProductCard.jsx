import React, { useState } from "react";
import { Link } from "react-router-dom";
import DeletePopUp from "../PopUps/DeletePopUp";
import "./card.css";

const AdminProductCard = (props) => {
  const [showModal, setShowModal] = useState(false);
  const postId = props.posts?.id ?? props.posts?._id;

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
    resolveImageUrl(props.posts?.post) ||
    (Array.isArray(props.posts?.images)
      ? resolveImageUrl(props.posts.images[0])
      : null) ||
    placeholderImg;

  return (
    <div className="single__nft__card m-2">
      <div className="nft__img">
        <img
          src={imgSrc}
          alt={props.posts?.title || "Artwork"}
          className="w-100"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholderImg;
          }}
        />
      </div>

      <div className="nft__content">
        <h5 className="nft__title">{props.posts.title}</h5>

        <div className="creator__info-wrapper d-flex gap-3">
          <div className="creator__img">
            <img src={props.posts.createdBy.image} alt="" className="w-100" />
          </div>

          <div className="creator__info w-100 d-flex align-items-center justify-content-between">
            <div>
              <h6>Created By</h6>
              {props.posts.createdBy._id === props.userId ? (
                <Link to={`/profile`}>
                  <p>{props.posts.createdBy.name}</p>
                </Link>
              ) : (
                <Link to={`/otherUser/${props.posts.createdBy._id}`}>
                  <p>{props.posts.createdBy.name}</p>
                </Link>
              )}
            </div>

            <div>
              <h6>Price</h6>
              <p>Rs. {props.posts.price}</p>
            </div>
          </div>
        </div>
        <div className=" mt-3 d-flex align-items-center justify-content-between gap-2">
          <button
            className="bid__btn d-flex align-items-center gap-1"
            onClick={() => setShowModal(true)}
          >
            Delete
          </button>
        </div>
      </div>
      {showModal && (
        <DeletePopUp
          setShowModal={setShowModal}
          postName={props.posts.title}
          id={postId}
          userId={props.posts.createdBy?._id}
        />
      )}
    </div>
  );
};

export default AdminProductCard;
