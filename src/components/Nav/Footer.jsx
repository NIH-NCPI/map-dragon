import { notification } from 'antd';
import { useContext, useEffect } from 'react';
import './NavBar.scss';
import { myContext } from '../../App';
import { getAll } from '../Manager/FetchManager';

export const Footer = () => {
  const { version, setVersion, mapDragonVersion, vocabUrl } =
    useContext(myContext);

  useEffect(() => {
    getAll(vocabUrl, 'version', null)
      .then(data => setVersion(data))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred loading the version.',
          });
        }
        return error;
      });
  }, []);

  return (
    <footer className="footer">
      <div className="footer_content_wrapper">
        <div className="footer_content">
          Locutus version: {version?.version}
        </div>
        <div className="footer_content">
          Map Dragon version: {mapDragonVersion}
        </div>
      </div>
    </footer>
  );
};
