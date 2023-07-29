import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import MainMenu from './MainMenu';
import RegisterPage from './RegisterPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/main-menu" element={<MainMenu />} />
                <Route path="/" element={<HomePage />} />
            </Routes>
        </Router>
    );
}

export default App;
