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
  const [isPosting, setIsPosting] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(null);
  const [posts, setPosts] = useState({
    title: "",
    description: "",
    price: "",
    count: "",
    post: [],
  });
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    const storedPassword = localStorage.getItem("adminPassword");
    if (!storedPassword) {
      toast.error("Unauthorized access. Admin login required.");
      navigate("/");
    } else {
      setAdminPassword(storedPassword);
    }
  }, [navigate]);

  const handlePic = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;

    const existingFiles = Array.isArray(posts.post) ? posts.post : [];
    const combinedFiles = [...existingFiles, ...newFiles].slice(0, 10);

    setPosts({ ...posts, post: combinedFiles });

    setPreviewImages(new Array(combinedFiles.length).fill(null));

    combinedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt?.target?.result || null;
        setPreviewImages((prev) => {
          const next = Array.isArray(prev) ? [...prev] : new Array(combinedFiles.length).fill(null);
          next[index] = result;
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newFiles = [...posts.post];
    newFiles.splice(index, 1);

    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);

    let newMainIndex = mainIndex;
    if (index === mainIndex) {
      newMainIndex = 0;
    } else if (index < mainIndex) {
      newMainIndex = mainIndex - 1;
    }

    setPreviewImages(newPreviews);
    setMainIndex(newMainIndex);
    setPosts({ ...posts, post: newFiles });
  };

  const moveImage = (e, fromIndex, toIndex) => {
    e.preventDefault();
    if (fromIndex < 0 || toIndex < 0 || toIndex >= previewImages.length) return;

    const newFiles = [...posts.post];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);

    const newPreviews = [...previewImages];
    const [movedPreview] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, movedPreview);

    let newMainIndex = mainIndex;
    if (fromIndex === mainIndex) newMainIndex = toIndex;
    else if (fromIndex < mainIndex && toIndex >= mainIndex) newMainIndex = mainIndex - 1;
    else if (fromIndex > mainIndex && toIndex <= mainIndex) newMainIndex = mainIndex + 1;

    setPreviewImages(newPreviews);
    setMainIndex(newMainIndex);
    setPosts({ ...posts, post: newFiles });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isPosting) return;

    if (!posts.title || !posts.description || !posts.price || !posts.post.length) {
      toast.error("Please fill all required fields and upload images");
      return;
    }

    setIsPosting(true);
    setUploadPercent(0);

    try {
      toast.info("Posting...", { autoClose: 1200 });
      const formData = { ...posts, mainIndex };
      const response = await postArt(formData, adminPassword, (evt) => {
        const total = evt?.total;
        const loaded = evt?.loaded;
        if (typeof total === "number" && total > 0 && typeof loaded === "number") {
          const pct = Math.min(100, Math.max(0, Math.round((loaded / total) * 100)));
          setUploadPercent(pct);
        }
      });
      if (response.data.success) {
        toast.success("Posted successfully");
        navigate("/admin");
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errMessage ||
        err?.message ||
        "Failed to post artwork";
      console.error("Post failed:", err);
      toast.error(message);
    } finally {
      setIsPosting(false);
      setUploadPercent(null);
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
                    <PseudoProfile>P</PseudoProfile>
                  ) : (
                    <ProfileImage src={previewImages[mainIndex] || previewImages.find(Boolean) || ""} alt="" />
                  )}
                  <input
                    ref={fileRef}
                    hidden
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePic}
                  />
                  <button type="button" className="bid__btn d-flex align-items-center gap-2" onClick={() => fileRef.current.click()}>
                    <i className="ri-upload-line"></i> Upload
                  </button>
                </Profile>
              </ProfilePic>
            </Col>

            <Col lg="9" md="8" sm="6">
              <div className="create__item">
                <form onSubmit={handleAdd}>
                  {previewImages.length > 0 && (
                    <div className="form__input">
                      <label style={{ color: "#8b0000", fontWeight: "600", marginBottom: "10px", display: "block" }}>Reorder & select main image</label>
                      <div className="preview-grid">
                        {previewImages.map((img, index) => (
                          <div key={index} className="preview-item">
                            <button
                              type="button"
                              className="remove-btn"
                              onClick={(e) => removeImage(e, index)}
                            >
                              ×
                            </button>
                            
                            {img ? (
                              <img
                                src={img}
                                alt=""
                                onClick={() => setMainIndex(index)}
                                className={`preview-img ${index === mainIndex ? "active" : ""}`}
                                style={{ borderWidth: index === mainIndex ? "3px" : "2px" }}
                              />
                            ) : (
                              <div
                                onClick={() => setMainIndex(index)}
                                className={`preview-img ${index === mainIndex ? "active" : ""}`}
                                style={{ background: "rgba(0, 0, 0, 0.1)", borderWidth: index === mainIndex ? "3px" : "2px" }}
                              />
                            )}
                            
                            <div className="d-flex gap-1">
                              <button type="button" className="btn btn-sm btn-outline-light" style={{ padding: "0 6px", color: "#8b0000", borderColor: "#8b0000" }} disabled={index === 0} onClick={(e) => moveImage(e, index, index - 1)}>{"\u2190"}</button>
                              <button type="button" className="btn btn-sm btn-outline-light" style={{ padding: "0 6px", color: "#8b0000", borderColor: "#8b0000" }} disabled={index === previewImages.length - 1} onClick={(e) => moveImage(e, index, index + 1)}>{"\u2192"}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form__input">
                    <label>Title</label>
                    <input type="text" placeholder="Enter title" value={posts.title} onChange={(e) => setPosts({ ...posts, title: e.target.value })} />
                  </div>

                  <div className="form__input">
                    <label>Description</label>
                    <textarea rows="7" placeholder="Enter description" className="w-100" value={posts.description} onChange={(e) => setPosts({ ...posts, description: e.target.value })} />
                  </div>

                  <div className="form__input">
                    <label>Price (Include Delivery Charges)</label>
                    <input type="number" placeholder="Enter price" value={posts.price} onChange={(e) => setPosts({ ...posts, price: e.target.value })} />
                  </div>

                  <div className="form__input">
                    <label>Count</label>
                    <input type="number" placeholder="Enter count" value={posts.count} onChange={(e) => setPosts({ ...posts, count: e.target.value })} />
                  </div>

                  <button
                    type="submit"
                    className="bid__btn d-flex align-items-center gap-2"
                    onClick={handleAdd}
                    disabled={isPosting}
                    style={{ opacity: isPosting ? 0.7 : 1, cursor: isPosting ? "not-allowed" : "pointer" }}
                  >
                    <i className="ri-add-line"></i>{" "}
                    {isPosting
                      ? `Uploading${typeof uploadPercent === "number" ? ` ${uploadPercent}%` : "..."}`
                      : "Post"}
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
