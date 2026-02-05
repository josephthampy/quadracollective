import React, { useState } from "react";
import { Container, Row, Col, Form, FormGroup, Input, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../Services/Art";
import { toast } from "react-toastify";
import "../Assets/css/signuplogin.css";

function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await adminLogin(password);
      if (response.data.success) {
        // Store admin password in localStorage for future requests
        localStorage.setItem("adminPassword", password);
        toast.success("Login successful!");
        navigate("/admin");
      } else {
        toast.error("Invalid password");
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login__section">
      <Container>
        <Row>
          <Col lg="6" md="6" sm="12" className="m-auto">
            <div className="login__container">
              <h2>Admin Access</h2>
              <p className="text-muted text-center mb-3">
                Backend administration only
              </p>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FormGroup>
                <Button
                  type="submit"
                  className="buy__btn w-100"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default AdminLogin;
