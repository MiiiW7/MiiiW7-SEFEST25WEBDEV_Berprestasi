import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, checkAuth } = useAuth(); // Tambahkan checkAuth di sini

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Tambahkan useEffect untuk memanggil checkAuth saat komponen dimount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="bg-white sticky top-0 left-0 w-full z-50">
      <nav className="flex justify-between items-center w-[92%] mx-auto">
        <div className="flex items-center">
          <img src={logo} alt="Logo" width="60" className="mr-4" />
        </div>
        <div className="fixed md:static md:min-h-fit min-h-[60vh] left-0 top-[-100%] md:w-auto w-full flex items-center px-5">
          <ul className="flex md:flex-row flex-col md:items-center md:gap-[4vw] gap-8 ">
            <li className="">
              <Link to="/" className="hover:text-yellow-600">
                Home
              </Link>
            </li>
            <li className="">
              <Link to="/Kategori" className="hover:text-yellow-600">
                Kategori
              </Link>
            </li>
            <li className="">
              <Link to="/Lomba" className="hover:text-yellow-600">
                Lomba
              </Link>
            </li>
            <li className="">
              <Link to="/Pemberitahuan" className="hover:text-yellow-600">
                Pemberitahuan
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "penyelenggara" && (
                <Link
                  to="/create-post"
                  className="bg-yellow-200 text-yellow-500 px-5 py-2 rounded-full hover:bg-yellow-300"
                >
                  Buat Lomba
                </Link>
              )}
              <Link
                to="/profile"
                className="bg-yellow-200 text-yellow-500 px-5 py-2 rounded-full hover:bg-yellow-300"
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-yellow-200 text-yellow-500 px-5 py-2 rounded-full hover:bg-yellow-300 inline-block text-center transition duration-300"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-yellow-400 text-white px-5 py-2 rounded-full hover:bg-yellow-200 inline-block text-center transition duration-300"
              >
                Sign Up
              </Link>
            </>
          )}
          <button onClick={toggleMenu} className="text-yellow-600 md:hidden">
            {isOpen ? "✖" : "☰"}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="py-4">
          <div className="flex flex-col gap-6 items-center">
            <Link to="/" className="w-80">
              <button className="bg-yellow-300 w-full py-2 rounded-full">
                Home
              </button>
            </Link>
            <Link to="/kategori" className="w-80">
              <button className="bg-yellow-300 w-full py-2 rounded-full">
                Kategori
              </button>
            </Link>
            <Link to="/lomba" className="w-80">
              <button className="bg-yellow-300 w-full py-2 rounded-full">
                Lomba
              </button>
            </Link>
            <Link to="/notif" className="w-80">
              <button className="bg-yellow-300 w-full py-2 rounded-full">
                Pemberitahuan
              </button>
            </Link>
            {user && (
              <>
                
                
                <button
                  onClick={logout}
                  className="bg-red-500 text-white w-80 py-2 rounded-full"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
