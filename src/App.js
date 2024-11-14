import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./Navigation";
import UserManagement from "./UserManagement";
import ProductManagement from "./ProductManagement";
import Dashboard from "./Dashboard";
import "./App.css";

const App = () => {
    const [activeUser, setActiveUser] = useState(null);
    const [products, setProducts] = useState(JSON.parse(localStorage.getItem('products')) || []);
    const isAuthenticated = Boolean(activeUser);

    const updateProducts = (newProducts) => {
        setProducts(newProducts);
        localStorage.setItem('products', JSON.stringify(newProducts));
    };

    const handleLogin = (username) => {
        setActiveUser(username);
    };

    const handleLogout = () => {
        setActiveUser(null);
    };

    return (
        <Router>
            <div>
                <h1><b>WINGS CAFE</b></h1>

                {isAuthenticated && <Navigation handleLogout={handleLogout} />}

                <div id="activeUserDisplay">
                    <h3 id="activeUsername">{activeUser ? `Logged in as: ${activeUser}` : "No active user."}</h3>
                </div>

                <Routes>
                    <Route 
                        path="/userManagement" 
                        element={<UserManagement onLogin={handleLogin} isAuthenticated={isAuthenticated} />} 
                    />
                    <Route 
                        path="/productManagement" 
                        element={isAuthenticated ? <ProductManagement products={products} updateProducts={updateProducts} /> : <Navigate to="/userManagement" />}
                    />
                    <Route 
                        path="/dashboard" 
                        element={isAuthenticated ? <Dashboard products={products} /> : <Navigate to="/userManagement" />} 
                    />
                    <Route path="/" element={<Navigate to="/userManagement" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;