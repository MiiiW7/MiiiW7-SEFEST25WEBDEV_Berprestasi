/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePendaftar = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    nomor: user?.nomor || '',
  });

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profil Pendaftar</h1>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="mb-6">
          {/* ... (form fields) ... */}
        </form>
      ) : (
        <div className="mb-6">
          <p><strong>Nama:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Nomor Telepon:</strong> {user?.nomor}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Edit Profil
          </button>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Daftar Lomba yang Diikuti</h2>
      <p>Fitur ini belum tersedia untuk pendaftar.</p>
      {/* Tambahkan logika untuk menampilkan lomba yang diikuti oleh pendaftar di sini */}
    </div>
  );
};

export default ProfilePendaftar;