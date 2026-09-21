import { googleLogout } from '@react-oauth/google';
import { endSession } from './SessionsManager';

export const handleLogout = () => {
  googleLogout();
  endSession(vocabUrl);
  setUser(null);
  setUserPic(null);
  setRole(null);
  setInstitutionIds(null);
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userPic');
};
