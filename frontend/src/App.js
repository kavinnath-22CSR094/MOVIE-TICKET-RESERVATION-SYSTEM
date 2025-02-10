import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const API_URL = "http://localhost:5000";

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #1a1a2e;
`;

const Card = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: 350px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  background: #ccc;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background: #007bff;
  color: white;
  border: none;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

function Register() {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const registerUser = async () => {
        try {
            await axios.post(`${API_URL}/register`, formData);
            alert("OTP sent to email!");
            setOtpSent(true);
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        }
    };

    const verifyOTP = async () => {
        try {
            await axios.post(`${API_URL}/verify-otp`, { email: formData.email, otp });
            alert("OTP Verified! Redirecting to login...");
            navigate("/login");
        } catch (error) {
            alert("Invalid or expired OTP!");
        }
    };

    return (
        <Container>
            <Card>
                <Avatar>👤</Avatar>
                {!otpSent ? (
                    <>
                        <h2>Register</h2>
                        <Input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                        <Input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                        <Input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                        <Button onClick={registerUser}>Get OTP</Button>
                    </>
                ) : (
                    <>
                        <h2>Enter OTP</h2>
                        <Input type="text" placeholder="OTP" onChange={(e) => setOtp(e.target.value)} required />
                        <Button onClick={verifyOTP}>Verify OTP</Button>
                    </>
                )}
            </Card>
        </Container>
    );
}

function Login() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const loginUser = async () => {
        try {
            await axios.post(`${API_URL}/login`, formData);
            alert("Login successful!");
            navigate("/dashboard");
        } catch (error) {
            alert("Invalid username or password!");
        }
    };

    return (
        <Container>
            <Card>
                <Avatar>🔑</Avatar>
                <h2>Login</h2>
                <Input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                <Input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <Button onClick={loginUser}>Login</Button>
            </Card>
        </Container>
    );
}

function Dashboard() {
    const navigate = useNavigate();
    return (
        <Container>
            <Card>
                <h2>Welcome to Dashboard 🎬</h2>
                <Button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>Logout</Button>
            </Card>
        </Container>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
