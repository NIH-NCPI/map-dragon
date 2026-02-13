import { useContext, useEffect, useState } from 'react';
import './StudyStyling.scss';
import '../../Manager/AddNewCard.scss';

import { Link, useNavigate } from 'react-router-dom';
import { myContext } from '../../../App';
import { Spinner } from '../../Manager/Spinner';
import { getAll } from '../../Manager/FetchManager';
import { Row, Col, Card, notification } from 'antd';
import { AddStudy } from './AddStudy';
import { RequiredLogin } from '../../Auth/RequiredLogin';
const { Meta } = Card;

export const StudyList = () => {
  const { addStudy, setAddStudy, vocabUrl, user } = useContext(myContext);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleSuccess = () => {
    setAddStudy(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });
  // API call to fetch all studies. Sets response to 'studies' then sets loading to false
  useEffect(() => {
    document.title = 'Studies - Map Dragon';
    setLoading(true);
    getAll(vocabUrl, 'Study', navigate)
      .then(data => setStudies(data))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred loading studies.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="studies_container">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="projects_sub_nav">
              <h2>My Studies</h2>
            </div>
            {/* if the data from the API is still loading, the loading spinner is displayed. Otherwise the code below is displayed */}

            <div className="cards_container">
              {/* grid layout with rows and columns from the ant.design library
            row gutter creates horizontal and vertical spaces between the column elements */}
              <Row gutter={[20, 24]}>
                {/* the columns span a total of 24 units per row. A span of 6 means 4 columns can be displayed per row.
              Each column has a card with study information.*/}
                <Col span={6}>
                  {/* The first column is a card that opens a modal to add a new study. It sets 'addStudy' to true on click
                and triggers the modal to open*/}
                  <span
                    onClick={() => {
                      if (user) {
                        setAddStudy(true);
                      } else {
                        login();
                      }
                    }}
                  >
                    <Card
                      hoverable
                      style={{
                        border: '1px solid darkgray',
                        height: '350px',
                      }}
                    >
                      <div className="new_study_card_container">
                        <div className="new_study_card">Create New Study</div>
                      </div>
                    </Card>
                  </span>
                </Col>
                {/* The studies is array is mapped through and a card with study information is displayed for each study*/}
                {studies?.map((study, index) => {
                  return (
                    <Col span={6} key={index}>
                      <Link to={`/Study/${study?.id}`}>
                        <Card
                          hoverable
                          title={study?.name ? study?.name : study?.id}
                          style={{
                            border: '1px solid darkgray',
                            height: '350px',
                          }}
                        >
                          <Meta
                            style={{
                              height: '185px',
                              border: '1px lightgray solid',
                              borderRadius: '5px',
                              padding: '5px',
                            }}
                            // displays the study description up to 240 characters, then displays ellipsis
                            description={
                              <div
                                style={{ height: '175px', overflowY: 'auto' }}
                              >
                                {study?.description}
                              </div>
                            }
                          />
                        </Card>
                      </Link>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </>
        )}
      </div>
      <AddStudy addStudy={addStudy} setAddStudy={setAddStudy} />
    </>
  );
};
