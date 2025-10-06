import React from 'react';

const Footer = () => (
  <footer
    style={{
      backgroundColor: "rgba(29, 138, 105, 0.8)",
      color: "white",
      padding: "50px 20px",
      width: "100vw",
      position: "relative",
      bottom: 0,
    }}
  >
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-around",
        gap: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Contact Section */}
      <div id="contact" style={{ flex: "1 1 200px", minWidth: "220px" }}>
        <h3>Contact Us</h3>
        <p>Email: readorabooks@gmail.com</p>
        <p>Phone: +91-8848114808</p>
        <p>Address: 123 Readora Street, Book City, India</p>
      </div>

      {/* About Section */}
      <div id="about" style={{ flex: "1 1 200px", minWidth: "220px" }}>
        <h3>About Us</h3>
        <p>
          Readora is your trusted online bookstore. We offer a wide range of books for all ages and interests,
          including novels, textbooks, and rare collections. Our mission is to make reading accessible and enjoyable for everyone.
        </p>
      </div>

     
      <div id="services" style={{ flex: "1 1 200px", minWidth: "220px" }}>
        <h3>Our Services</h3>
        <p>Online Bookstore with wide variety of genres</p>
        <p>Fast and reliable delivery across India</p>
        <p>Secure payment options</p>
        {/* <p>Gift options and special discounts</p> */}
      </div>

     
      <div id="social" style={{ flex: "1 1 200px", minWidth: "220px" }}>
        <h3>Follow Us</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>Facebook</a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>Twitter</a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>Instagram</a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>LinkedIn</a>
        </div>
      </div>
    </div>

 
    <div style={{ marginTop: "40px", fontSize: "14px", textAlign: "center" }}>
      &copy; 2025 Readora. All rights reserved.
    </div>
  </footer>
);

export default Footer;
