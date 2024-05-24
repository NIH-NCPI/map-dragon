import { Outlet } from 'react-router-dom';
import Background from '../../assets/Background.png';

export const PageLayout = () => {
  return (
    <div>
      <div className="image_container">
        <img className="background_image_results" src={Background} />
      </div>
      <Outlet />
    </div>
  );
};
