import { useAuth } from '../context/AuthContext';
import ProfilePenyelenggara from './ProfilePenyelenggara';
import ProfilePendaftar from './ProfilePendaftar';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return user.role === 'penyelenggara' ? <ProfilePenyelenggara /> : <ProfilePendaftar />;
};

export default Profile;