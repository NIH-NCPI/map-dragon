import { googleLogout } from '@react-oauth/google';
import { endSession } from './SessionsManager';

export const logout = ({
  setUser,
  setUserPic,
  setRole,
  setInstitutionIds,
  vocabUrl
}) => {
  googleLogout();
  endSession(vocabUrl);
  setUser(null);
  setUserPic(null);
  setRole(null);
  setInstitutionIds(null);
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userPic');
};
