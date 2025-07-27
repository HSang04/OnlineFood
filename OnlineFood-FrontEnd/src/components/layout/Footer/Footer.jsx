import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="custom-footer text-center py-3 mt-5">
      <div>© 2025 OnlineFood. All rights reserved.</div>
      <div>
        Liên hệ: <a href="mailto:support@onlinefood.com" className="footer-link">support@onlinefood.com</a>
      </div>
    </footer>
  );
};

export default Footer;
