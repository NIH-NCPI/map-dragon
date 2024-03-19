import { useRef, useContext } from 'react';
import './OntologySearch.scss';
import { myContext } from '../../App';
import { useNavigate } from 'react-router-dom';

export const OntologySearch = () => {
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
              //allows the search button to be pressed on 'Enter' key
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  /* if the input field has a value (i.e. term being searched), the value is transposed into the address bar. 
                  The user is then redirected to the search page, which completes the search for the search term.
                  */
                  if (ref.current.value) {
                    navigate(`/search/${ref.current.value}`);
                  }
                }
              }}
              onChange={e => {
                // if there is no value in the input field, the search button is disabled.
                e.target.value === ''
                  ? setButtonDisabled(true)
                  : setButtonDisabled(false);
              }}
            />
          </div>
          <div className="button_container">
            <button
              className={`search_button ${buttonDisabled ? 'disabled' : ''}`} //class name dependent on whether the button is disabled
              onClick={e => {
                /* if the input field has a value (i.e. term being searched), the value is transposed into the address bar. 
                  The user is then redirected to the search page, which completes the search for the search term.
                  */
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
