import React, { useState, useEffect } from "react";
import { getPosts } from "../Services/Art";
import ProductCard from "../Components/Cards/ProductCard";
import CommonSection from "../Components/Common-section/CommonSection";
import { Container, Row, Col } from "reactstrap";
import "../Assets/css/allProduct.css";
import Pagination from "../Components/Pagination/Pagination";
import styled from "styled-components";

const Page = styled.div``;

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  let limit = 12;
  const pageChange = (pageNo) => {
    setPage(pageNo);
  };

  useEffect(() => {
    try {
      getPosts(page, limit).then((data) => {
        setProducts(data.data.result || []);
        setTotalPages(data.data.totalPage || 1);
      });
    } catch (err) {
      console.log(err);
    }
  }, [page, limit]);

  return (
    <>
      <CommonSection title="Art Gallery" />
      <section style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(245, 230, 211, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(139, 0, 0, 0.1)', minHeight: '60vh' }}>
        <Container>
          <Row>
            <Col lg="12" className="mb-5">
              <div className="live__auction__top d-flex align-items-center justify-content-between ">
                <h3>All Artwork</h3>
              </div>
            </Col>

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
                <h2 className="text-center">No artwork available</h2>
              </Col>
            )}
            <Col lg="12">
            <Page>
              <Pagination
                pageChange={pageChange}
                totalPages={totalPages}
                page={page}
              />
            </Page>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}

export default AllProducts;
