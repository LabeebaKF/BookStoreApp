import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Landing from './components/Landing';
import Home from './components/Home';
import Register from './components/Register';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import Books from './components/Books';
import UserProfile from './components/UserProfile';
import Details from './components/Details';
import AuthorSubmissions from './components/AuthorSubmission';
import OrderPage from './components/OrderPage';

const AppContent = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Hide Navbar and Footer on landing page and admin dashboard
  const hideGlobalComponents =
    location.pathname === '/' || location.pathname === '/admindashboard';

  return (
    <>
      {!hideGlobalComponents && <Navbar />}

      <Routes>
     
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/book/:id" element={<Details />} />
        <Route path="/order/:bookId" element={<OrderPage />} />
        <Route path="/checkout/:bookId" element={<OrderPage />} />
        <Route path="/allbooks" element={<Books />} />
        <Route path="/authorsubmission" element={<AuthorSubmissions />} />
        <Route
          path="/admindashboard"
          element={
            token ? <AdminDashboard /> : <Navigate to="/login" replace />
          }
        />
      </Routes>

      {!hideGlobalComponents && <Footer />}
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
