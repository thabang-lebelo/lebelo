import React from "react";  // Keep this line
import { useNavigate } from "react-router-dom"; // Updated import for navigation

const Navigation = ({ handleLogout }) => {
    const navigate = useNavigate(); // Initialize useNavigate hook

    return (
        <nav id="navigation">
            <ul>
                <button onClick={() => navigate("/dashboard")}>Dashboard</button>
                <button onClick={() => navigate("/productManagement")}>Product Management</button>
                <button onClick={() => navigate("/userManagement")}>User Management</button>
                <button onClick={handleLogout}>Logout</button>
            </ul>
        </nav>
    );
};

export default Navigation;