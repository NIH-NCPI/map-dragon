import { useContext, useEffect, useState } from 'react';
import { Descriptions, notification, Spin } from 'antd';
import { getAll } from '../Manager/FetchManager';
import { myContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../Manager/Spinner';
import './About.scss';

export const About = () => {
  const { vocabUrl } = useContext(myContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState({});

  useEffect(() => {
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
      label: 'Version',
      children: `${version?.version}`,
      labelStyle: { width: '150px' },
      contentStyle: { width: '150px' },
    },
  ];

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="studies_container">
          <h2>About</h2>
          <div className="about_description">
            <Descriptions title="Version" bordered items={items} />
          </div>
        </div>
      )}
    </>
  );
};
