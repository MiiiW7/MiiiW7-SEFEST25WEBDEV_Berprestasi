/* eslint-disable react-hooks/exhaustive-deps */
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showJenjang, setshowJenjang] = useState(false);
  const [categoryTimeout, setCategoryTimeout] = useState(null);
  const [jenjangTimeout, setJenjangTimeout] = useState(null);
  const { user, logout, checkAuth, token } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUnreadNotificationsCount = async () => {
    if (!user || !token) return;

    try {
      const response = await axios.get(
        "http://localhost:9000/user/notifications", 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Pastikan properti unreadCount sesuai dengan response dari backend
      setUnreadNotifications(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Gagal mengambil jumlah notifikasi yang belum dibaca", error);
    }
  };

  // Ambil jumlah notifikasi yang belum dibaca saat komponen dimount dan user login
  useEffect(() => {
    fetchUnreadNotificationsCount();
  }, [user, token]);

  const categories = [
    "Akademik",
    "Non-Akademik",
    "Seni",
    "Olahraga",
    "Teknologi",
    "Bahasa",
    "Sains",
    "Matematika",
  ];

  const jenjangs = ["SD", "SMP", "SMA", "SMK", "Mahasiswa", "Umum"];

  const handleMouseEnterCategories = () => {
    if (categoryTimeout) {
      clearTimeout(categoryTimeout);
    }
    setShowCategories(true);
  };

  const handleMouseLeaveCategories = () => {
    setCategoryTimeout(
      setTimeout(() => {
        setShowCategories(false);
      }, 200)
    ); // 200 ms delay before hiding
  };

  const handleMouseEnterJenjang = () => {
    if (jenjangTimeout) {
      clearTimeout(jenjangTimeout);
    }
    setshowJenjang(true);
  };

  const handleMouseLeaveJenjang = () => {
    setJenjangTimeout(
      setTimeout(() => {
        setshowJenjang(false);
      }, 200)
    ); // 200 ms delay before hiding
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Tambahkan useEffect untuk memanggil checkAuth saat komponen dimount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="bg-white sticky top-0 left-0 w-full z-50 shadow-md">
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
            {/* Kategori Dropdown */}
            <li
              className="relative"
              onMouseEnter={handleMouseEnterCategories}
              onMouseLeave={handleMouseLeaveCategories}
            >
              <button className="hover:text-yellow-600 focus:outline-none">
                Kategori
              </button>
              {showCategories && (
                <div
                  className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  onMouseEnter={handleMouseEnterCategories} // Tetap buka saat hover di dropdown
                  onMouseLeave={handleMouseLeaveCategories} // Tutup saat keluar dari dropdown
                >
                  <div className="py-1" role="menu">
                    {categories.map((category) => (
                      <Link
                        key={category}
                        to={`/kategori/${category}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100"
                        role="menuitem"
                        onClick={() => setShowCategories(false)}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>

            {/* Jenjang Dropdown */}
            <li
              className="relative"
              onMouseEnter={handleMouseEnterJenjang}
              onMouseLeave={handleMouseLeaveJenjang}
            >
              <button className="hover:text-yellow-600 focus:outline-none">
                Jenjang
              </button>
              {showJenjang && (
                <div
                  className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  onMouseEnter={handleMouseEnterJenjang} // Tetap buka saat hover di dropdown
                  onMouseLeave={handleMouseLeaveJenjang} // Tutup saat keluar dari dropdown
                >
                  <div className="py-1" role="menu">
                    {jenjangs.map((jenjang) => (
                      <Link
                        key={jenjang}
                        to={`/jenjang/${jenjang}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100"
                        role="menuitem"
                        onClick={() => setshowJenjang(false)}
                      >
                        {jenjang}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
            <li className="">
              <Link to="/Lomba" className="hover:text-yellow-600">
                Lomba
              </Link>
            </li>
            <li className="">
              {/* Tambahkan link ke halaman notifikasi */}
        {user && (
          <Link 
            to="/notifications" 
            className="relative p-2 rounded-full hover:bg-gray-100"
          >
            Pemberitahuan
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                {unreadNotifications}
              </span>
            )}
          </Link>
        )}
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
              <button
                onClick={logout}
                className="hidden md:inline-block bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600"
              >
                Logout
              </button>
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
            <div className="w-80">
              <button
                className="bg-yellow-300 w-full py-2 rounded-full"
                onClick={() => setShowCategories(!showCategories)}
              >
                Kategori
              </button>
              {showCategories && (
                <div className="mt-2 bg-white rounded-md shadow-lg">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      to={`/kategori/${category}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100"
                      onClick={() => {
                        setShowCategories(false);
                        setIsOpen(false);
                      }}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="w-80">
              <button
                className="bg-yellow-300 w-full py-2 rounded-full"
                onClick={() => setshowJenjang(!showJenjang)}
              >
                Jenjang
              </button>
              {showJenjang && (
                <div className="mt-2 bg-white rounded-md shadow-lg">
                  {jenjangs.map((jenjang) => (
                    <Link
                      key={jenjang}
                      to={`/kategori/${jenjang}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100"
                      onClick={() => {
                        setshowJenjang(false);
                        setIsOpen(false);
                      }}
                    >
                      {jenjang}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
                {user.role === "penyelenggara" && (
                  <Link to="/create-post" className="w-80">
                    <button className="bg-yellow-300 w-full py-2 rounded-full ">
                      Buat Lomba
                    </button>
                  </Link>
                )}
                <Link to="/profile" className="w-80">
                  <button className="bg-yellow-300 w-full py-2 rounded-full">
                    Profile
                  </button>
                </Link>
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
