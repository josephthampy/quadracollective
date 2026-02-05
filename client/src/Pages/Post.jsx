import React, { useRef, useEffect, useState } from "react";
import { postArt } from "../Services/Art";
import { useNavigate } from "react-router-dom";
import CommonSection from "../Components/Common-section/CommonSection";
import styled from "styled-components";
import { Container, Row, Col } from "reactstrap";
import "../Assets/css/create-item.css";
import { toast } from "react-toastify";

const ProfilePic = styled.div`
  display: flex;
  justify-content: center;
  height: 180px;
`;

const Profile = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 120px;
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 120px;
  border: 3px solid #001825;
  background: #001825;
  margin-bottom: 10px;
`;

const PseudoProfile = styled.div`
  display: inline-block;
  font-size: 40px;
  line-height: 48px;
  text-align: center;
  background: #418df9;
  font-weight: 600;
  color: white;
  width: 145px;
  height: 145px;
  border: 6px solid;
  border-color: #001825;
  border-radius: 50%;
  padding-top: 40px;
`;

const Post = () => {
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const [previewImages, setPreviewImages] = useState([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [posts, setPosts] = useState({
    title: "",
    description: "",
    price: "",
    count: "",
    post: null, // will hold an array of File objects for images
  });
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    // Check if admin is logged in
    const storedPassword = localStorage.getItem("adminPassword");
    if (!storedPassword) {
      toast.error("Unauthorized access. Admin login required.");
      navigate("/");
    } else {
      setAdminPassword(storedPassword);
    }
  }, [navigate]);

  const handlePic = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.target.files || []);

    if (!newFiles.length) return;

    // Merge with already-selected files so user can add in multiple steps
    const existingFiles = Array.isArray(posts.post)
      ? posts.post
      : posts.post
      ? [posts.post]
      : [];

    const combined = [...existingFiles, ...newFiles];

    if (combined.length > 10) {
      toast.error("You can upload at most 10 images");
      return;
    }

    // Save files for upload and preserve main index if already set
    const currentMainIndex = posts.mainIndex !== undefined ? posts.mainIndex : mainIndex;
    setPosts({ ...posts, post: combined, mainIndex: currentMainIndex });
    setMainIndex(currentMainIndex);

    // Generate preview images in order
    setPreviewImages([]);
    combined.forEach((file, index) => {
      const fileReader = new FileReader();
      fileReader.onload = function (evt) {
        setPreviewImages((prev) => {
          const newPreviews = [...prev];
          newPreviews[index] = evt.target.result;
          return newPreviews.filter(Boolean); // Remove undefined entries
        });
      };
      fileReader.readAsDataURL(file);
    });
  };

  // Move image (and corresponding file) to new position
  const moveImage = (fromIndex, toIndex) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      !previewImages[fromIndex] ||
      !previewImages[toIndex]
    ) {
      return;
    }

    // Reorder preview images
    const newPreviews = [...previewImages];
    const [movedPreview] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, movedPreview);

    // Reorder file list
    const existingFiles = Array.isArray(posts.post)
      ? posts.post
      : posts.post
      ? [posts.post]
      : [];
    const newFiles = [...existingFiles];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);

    // Adjust main index if needed
    let newMainIndex = mainIndex;
    if (fromIndex === mainIndex) {
      newMainIndex = toIndex;
    } else if (fromIndex < mainIndex && toIndex >= mainIndex) {
      newMainIndex = mainIndex - 1;
    } else if (fromIndex > mainIndex && toIndex <= mainIndex) {
      newMainIndex = mainIndex + 1;
    }

    setPreviewImages(newPreviews);
    setMainIndex(newMainIndex);
    setPosts((prev) => ({
      ...prev,
      post: newFiles,
      mainIndex: newMainIndex,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!adminPassword) {
      toast.error("Admin authentication required");
      navigate("/admin/login");
      return;
    }
    
    const imagesToUpload = Array.isArray(posts.post)
      ? posts.post
      : posts.post
      ? [posts.post]
      : [];

    if (!imagesToUpload.length) {
      toast.error("Please upload at least one image");
      return;
    }

    if (imagesToUpload.length > 10) {
      toast.error("You can upload at most 10 images");
      return;
    }

    try {
      // Ensure we send the current mainIndex state value
      const formData = {
        ...posts,
        mainIndex: mainIndex, // Use current state, not stale value from posts
      };
      
      const response = await postArt(formData, adminPassword);
      if (response.data.success && response.data.message === "Posted successfully") {
        toast.success(response.data.message);
        navigate("/");
      } else {
        toast.warn(response.data.message || "Failed to post");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to post";
      if (errorMessage.includes("password") || errorMessage.includes("Unauthorized")) {
        toast.error("Invalid admin password. Please login again.");
        localStorage.removeItem("adminPassword");
        navigate("/admin/login");
      } else {
        toast.error(errorMessage);
      }
      console.log("Error details:", err.response?.data || err);
    }
  };

  return (
    <>
      <CommonSection title="Create Item" />

      <section>
        <Container>
          <Row>
            <Col lg="3" md="4" sm="6">
              <h5 className="mb-4 text-light">Post Image</h5>
              <ProfilePic>
                <Profile>
                  {previewImages.length === 0 ? (
                    <PseudoProfile
                      dangerouslySetInnerHTML={{
                        __html: "P",
                      }}
                    />
                  ) : (
                    <ProfileImage src={previewImages[mainIndex]} alt="" />
                  )}
                  <input
                    ref={fileRef}
                    hidden
                    type="file"
                    p="1.5"
                    accept="image/*"
                    name="post"
                    multiple
                    onChange={handlePic}
                  />
                  <button
                    className="bid__btn d-flex align-items-center gap-5 pad"
                    onClick={() => {
                      fileRef.current.click();
                    }}
                  >
                    <i className="ri-upload-line"></i> Upload
                  </button>
                </Profile>
              </ProfilePic>
            </Col>

            <Col lg="9" md="8" sm="6">
              <div className="create__item">
                <form>
                  {previewImages.length > 1 && (
                    <div className="form__input">
                      <label htmlFor="">Reorder & select main image</label>
                      <div className="d-flex flex-wrap gap-3 align-items-center">
                        {previewImages.map((img, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <img
                              src={img}
                              alt={`preview-${index}`}
                              style={{
                                width: "70px",
                                height: "70px",
                                objectFit: "cover",
                                cursor: "pointer",
                                border:
                                  index === mainIndex
                                    ? "2px solid #8b0000"
                                    : "1px solid #ccc",
                                borderRadius: "6px",
                              }}
                              onClick={() => {
                                setMainIndex(index);
                                setPosts((prev) => ({
                                  ...prev,
                                  mainIndex: index,
                                }));
                              }}
                            />
                            <div className="d-flex gap-1">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-light"
                                disabled={index === 0}
                                onClick={() => moveImage(index, index - 1)}
                                style={{ padding: "0 6px" }}
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-light"
                                disabled={index === previewImages.length - 1}
                                onClick={() => moveImage(index, index + 1)}
                                style={{ padding: "0 6px" }}
                              >
                                →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="form__input">
                    <label htmlFor="">Title</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter Name"
                      onChange={(e) =>
                        setPosts({ ...posts, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Description</label>
                    <textarea
                      name="description"
                      id=""
                      rows="7"
                      placeholder="Enter description"
                      className="w-100"
                      onChange={(e) =>
                        setPosts({ ...posts, description: e.target.value })
                      }
                    ></textarea>
                  </div>
                  <div className="form__input">
                    <label htmlFor="">Price (Include Delivery Charges)</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Enter Name"
                      onChange={(e) =>
                        setPosts({ ...posts, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="form__input">
                    <label htmlFor="">Count</label>
                    <input
                      type="number"
                      name="count"
                      placeholder="Enter Name"
                      onChange={(e) =>
                        setPosts({ ...posts, count: e.target.value })
                      }
                    />
                  </div>
                  <button
                    className="bid__btn d-flex align-items-center gap-5 pad"
                    onClick={handleAdd}
                  >
                    <i className="ri-add-line"></i> Post
                  </button>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Post;
