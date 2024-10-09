// Loading spinner
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

// Loading spinner for modal with slightly different styling
export const ModalSpinner = () => {
  return (
    <div className="loading_screen_modal">
      <div className="modal_spinner">
        <Spin />
      </div>
    </div>
  );
};

export const SearchSpinner = () => {
  return (
    <div className="search_screen">
      <div className="spinner">
        <Spin />
      </div>
    </div>
  );
};

export const SmallSpinner = () => {
  return (
    <div className="small_spinner_container">
      <div className="small_spinner">
        <Spin />
      </div>
    </div>
  );
};

export const OntologySpinner = () => {
  return (
    <div className="ontology_spinner_container">
      <div className="ontology_spinner">
        <Spin />
      </div>
    </div>
  );
};
