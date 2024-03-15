import { Spin } from 'antd';
import './Spinner.scss';
export const Spinner = () => {
  return (
    <div className="loading_screen">
      <div className="spinner">
        <Spin />
      </div>
    </div>
  );
};

export const ModalSpinner = () => {
  return (
    <div className="loading_screen">
      <div className="modal_spinner">
        <Spin />
      </div>
    </div>
  );
};
