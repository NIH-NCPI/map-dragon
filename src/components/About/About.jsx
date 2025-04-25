import { useContext, useEffect, useState } from 'react';
import { Descriptions } from 'antd';
import { myContext } from '../../App';
import './About.scss';

export const About = () => {
  const { mapDragonVersion, version } = useContext(myContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'About - Map Dragon';
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
      <div className="about_container">
        <h2>About</h2>
        <div className="about_description">
          <Descriptions title="Version" bordered column={1} items={items} />
        </div>
      </div>
    </>
  );
};
