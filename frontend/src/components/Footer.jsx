/* eslint-disable no-unused-vars */
// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        <p className="mb-2">&copy; {new Date().getFullYear()} Nama Perusahaan. Semua hak dilindungi.</p>
        <div className="flex justify-center space-x-4 mb-2">
          <Link to="/privacy-policy" className="hover:underline">
            Kebijakan Privasi
          </Link>
          <Link to="/terms-and-conditions" className="hover:underline">
            Syarat dan Ketentuan
          </Link>
        </div>
        <div className="flex justify-center space-x-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;