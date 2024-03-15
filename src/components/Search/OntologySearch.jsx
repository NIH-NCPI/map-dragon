import { useEffect, useRef, useState, useContext } from 'react';
import { Pagination, Spin } from 'antd';
import './OntologySearch.scss';
import { myContext } from '../../App';
import { useNavigate } from 'react-router-dom';

export const OntologySearch = () => {
  const [loading, setLoading] = useState(false);

  const { buttonDisabled, setButtonDisabled } = useContext(myContext);

  const navigate = useNavigate();
  const ref = useRef();

  return (
    <>
      <div className="search_page">
        <div className="text_above_search">Text about something...</div>
        <div className="search_field">
          <div className="text_input">
            <input
              autoFocus
              id="search_input"
              type="text"
              placeholder="Search"
              ref={ref}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (ref.current.value) {
                    navigate(`/search/${ref.current.value}`);
                  }
                }
              }}
              onChange={e => {
                e.target.value === ''
                  ? setButtonDisabled(true)
                  : setButtonDisabled(false);
              }}
            />
          </div>
          <div className="button_container">
            <button
              className={`search_button ${buttonDisabled ? 'disabled' : ''}`}
              onClick={e => {
                if (ref.current.value) {
                  navigate(`/search/${ref.current.value}`);
                }
              }}
            >
              SEARCH
            </button>
          </div>
        </div>
        <div className="text_below_search">
          More text about something else...
        </div>
      </div>
    </>
  );
};
