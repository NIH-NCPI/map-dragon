import './Error.scss';
import ErrorFrog from '../../assets/does_not_compute.jpg';

export const Error404 = () => {
  return (
    <div className="error_container">
      <div className="error_status_code">Not Found</div>
      <img className="error_frog" alt="Sad Locu" src={ErrorFrog} />
      <div className="sad_locu">
        Locu is very sad that they don't understand your request.
      </div>
      <div className="error_text">
        404 Not Found: The requested URL was not found on the server. If you
        entered the URL manually, please check your spelling and try again.
      </div>
    </div>
  );
};
