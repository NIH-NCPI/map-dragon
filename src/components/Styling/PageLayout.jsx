import { Outlet } from 'react-router-dom';
import Background from '../../assets/Background.png';

export const PageLayout = () => {
  return (
    <div
    // style={{
    //   backgroundImage: 'url("/src/assets/Background.png")',
    //   backgroundPosition: '450% -425px',
    //   backgroundRepeat: 'no-repeat',
    //   height: '100%',
    // }}
    >
      <div className="image_container">
        <img className="background_image_results" src={Background} />
      </div>
      <Outlet />
    </div>
  );
};
