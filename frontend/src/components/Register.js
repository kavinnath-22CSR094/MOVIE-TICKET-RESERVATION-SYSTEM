import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

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

const Register = () => {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        try {
            await axios.post("http://localhost:5000/api/auth/register", formData);
            alert("OTP sent to email!");
            setOtpSent(true);
        } catch (error) {
            alert("Error registering user!");
        }
    };

    const handleVerifyOTP = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
                username: formData.username,  // Include username in the request
                email: formData.email,
                password: formData.password,  // Include password in the request
                otp,
            });
            alert(response.data.message); // Show success message from server
            navigate("/login");
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong!");
        }
    };
    

    return (
        <Container>
            <Card>
                <Avatar>👤</Avatar>
                {!otpSent ? (
                    <>
                        <h2>Register</h2>
                        <Input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <Input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Button onClick={handleRegister}>Register</Button>
                    </>
                ) : (
                    <>
                        <h2>Enter OTP</h2>
                        <Input
                        type="number"
                        placeholder="OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />

                        <Button onClick={handleVerifyOTP}>Verify OTP</Button>
                    </>
                )}
            </Card>
        </Container>
    );
};

export default Register;