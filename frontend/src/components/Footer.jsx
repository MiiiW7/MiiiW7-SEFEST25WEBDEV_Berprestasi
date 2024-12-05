/* eslint-disable no-unused-vars */
// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-zinc-100 text-black py-4 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <div className="flex flex-col md:flex-row items-center">
          <h1 className="text-lg font-bold mr-4">Berprestasi</h1>
          <div className="hidden md:block border-l border-gray-700 h-6 mx-4"></div>
          <nav className="flex space-x-4 text-sm">
            <a href="#" className="hover:underline">
              About
            </a>
            <a href="#" className="hover:underline">
              Benefits
            </a>
            <a href="#" className="hover:underline">
              Career
            </a>
            <a href="#" className="hover:underline">
              Support
            </a>
          </nav>
        </div>
        <div className="flex flex-col md:flex-row items-center mt-4 md:mt-0">
          <div className="flex space-x-4 text-sm mb-2 md:mb-0">
            <a href="#" className="hover:text-gray-400">
              <i className="fab fa-pinterest"></i>
            </a>
            <a href="#" className="hover:text-gray-400">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="hover:text-gray-400">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="#" className="hover:text-gray-400">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
          <div className="text-sm text-gray-400 md:ml-4">
            <p>©2024 Hilmi & Mulki. All right reserved.</p>
            <p>Support: mhilmifadlan@gmail.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
