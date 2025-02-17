import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import AdminLogin from "./components/AdminLogin";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import MovieBooking from "./components/MovieBooking";   
import TheaterSelection from "./components/TheaterSelection";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/moviebooking" element={<MovieBooking />} />
                <Route path="/theaterselection" element={<TheaterSelection />} />   
            </Routes>
        </Router>
    );
}

export default App;