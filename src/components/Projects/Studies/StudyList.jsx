import { useContext, useEffect, useState } from 'react';
import './StudyStyling.scss';
import '../../Manager/AddNewCard.scss';

import { Link, useNavigate } from 'react-router-dom';
import { myContext } from '../../../App';
import { Spinner } from '../../Manager/Spinner';
import { getAll, handlePost } from '../../Manager/FetchManager';
import { Form, Row, Col, Card, notification, Skeleton } from 'antd';
import { AddStudy } from './AddStudy';
import Background from '../../../assets/Background.png';
import { ellipsisString } from '../../Manager/Utilitiy';
const { Meta } = Card;

export const StudyList = () => {
  const { addStudy, setAddStudy, vocabUrl } = useContext(myContext);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // API call to fetch all studies. Sets response to 'studies' then sets loading to false
  useEffect(() => {
    setLoading(true);
    getAll(vocabUrl, 'Study')
      .then(data => setStudies(data))
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

  return (
    <>
      <div className="studies_container">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="image_container">
              {/* background image */}
              <img className="background_image_results" src={Background} />
            </div>
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
                  <span onClick={() => setAddStudy(true)}>
                    <Card
                      hoverable
                      bordered={true}
                      style={{
                        border: '1px solid darkgray',
                        height: '42vh',
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
                      <Card
                        title={study?.name ? study?.name : study?.id}
                        bordered={true}
                        style={{
                          border: '1px solid darkgray',
                          height: '42vh',
                        }}
                        // a link to the study page to view study details when the 'Edit' button is clicked
                        actions={[
                          <Link to={`/Study/${study?.id}`}>
                            <button className="manage_term_button">Edit</button>
                          </Link>,
                        ]}
                      >
                        <Skeleton loading={loading}>
                          <Meta
                            style={{
                              height: '21vh',
                              border: '1px lightgray solid',
                              borderRadius: '5px',
                              padding: '5px',
                            }}
                            // displays the study description up to 240 characters, then displays ellipsis
                            description={ellipsisString(
                              study?.description,
                              '240'
                            )}
                          />
                        </Skeleton>
                      </Card>
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
