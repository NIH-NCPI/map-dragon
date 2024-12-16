import { useContext, useEffect, useState } from 'react';
import { Descriptions, notification, Spin } from 'antd';
import { getAll } from '../Manager/FetchManager';
import { myContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../Manager/Spinner';
import './About.scss';

export const About = () => {
  const { vocabUrl, mapDragonVersion } = useContext(myContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState({});

  useEffect(() => {
    document.title = 'About - Map Dragon';
    setLoading(true);
    getAll(vocabUrl, 'version', navigate)
      .then(data => setVersion(data))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  }, []);

  const items = [
    {
      key: '1',
      label: 'Locutus version',
      children: `${version?.version}`,
      labelStyle: { width: '120px' },
      contentStyle: { width: '170px' },
    },
  ];

  if (mapDragonVersion) {
    items.push({
      key: '2',
      label: 'Map Dragon version',
      children: `${mapDragonVersion}`,
      labelStyle: { width: '120px' },
      contentStyle: { width: '170px' },
    });
  }

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="about_container">
          <h2>About</h2>
          <div className="about_description">
            <Descriptions title="Version" bordered column={1} items={items} />
          </div>
        </div>
      )}
    </>
  );
};
