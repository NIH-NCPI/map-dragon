import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Spinner } from '../../Manager/Spinner';
import './StudyStyling.scss';
import { getById, handleUpdate } from '../../Manager/FetchManager';
import { Row, Col, Divider, Skeleton, Card, Form, notification } from 'antd';

import { ellipsisString } from '../../Manager/Utilitiy';
import { SettingsDropdownStudy } from '../../Manager/Dropdown/SettingsDropdownStudy';
import { EditStudyDetails } from './EditStudyDetails';
import { DeleteStudy } from './DeleteStudy';
import { AddDD } from '../DataDictionaries/AddDD';
import { RemoveStudyDD } from './RemoveStudyDD';
const { Meta } = Card;

export const StudyDetails = () => {
  const [form] = Form.useForm();
  const { vocabUrl, studyDDs, setStudyDDs, edit, setEdit, study, setStudy } =
    useContext(myContext);
  const { studyId } = useParams();
  const [addDD, setAddDD] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* Function that maps through the datadictionary array in a study.
  For each DD, it makes a fetch call to the id of the DD.
  Promise.all fulfills all of the fetch calls. The response is set to studyDDs  */
  const getStudyDDs = async newStudy => {
    const dDPromises = newStudy?.datadictionary?.map(r =>
      getById(vocabUrl, 'DataDictionary', r.reference.split('/')[1])
    );
    const data = await Promise.all(dDPromises);
    setStudyDDs(data);
    setLoading(false);
  };

  // fetches the specified study. Sets response to 'study'.
  // If a study was fetched, calls the getStudyDDs function to fetch the DDs
  // otherwise, sets loading to false.
  useEffect(() => {
    getById(vocabUrl, 'Study', studyId)
      .then(data => {
        if (data === null) {
          navigate('/404');
        } else {
          setStudy(data);
          if (data) {
            getStudyDDs(data);
          } else {
            setLoading(false);
          }
        }
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
          setLoading(false);
        }
        return error;
      });
    return () => {
      setStudy({});
    };
  }, []);

  // Submit function for the modal to edit the study name, description, and url.
  // The function adds the variables and filename to the body of the PUT request to retain the complete
  // study object, since only 3 parts (captured in "values" through ant.d functionality) are being edited.

  return (
    <>
      {loading ? (
        // If page is loading, display loading spinner. Otherwise display code below
        <Spinner />
      ) : (
        <div className="studies_container">
          <Row gutter={30}>
            <div className="study_details_container">
              <Col span={15}>
                <div className="study_details">
                  <div className="study_name">
                    {/* Displays study name if there is one. If no name, displays study id */}
                    <h2>{study?.name ? study?.name : study?.id}</h2>
                  </div>
                  <div className="study_desc">{study?.title}</div>
                  <div className="study_desc">
                    {/* Displays the study description if there is one.
                    If there is no description, 'No description provided' is displayed in a gray font */}
                    {study?.description ? (
                      study?.description
                    ) : (
                      <span className="no_description">
                        No description provided.
                      </span>
                    )}
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <div className="study_details_right">
                  <div className="study_dropdown">
                    <SettingsDropdownStudy study={study} />
                  </div>
                  <div className="study_url">System: {study?.url}</div>
                </div>
              </Col>
            </div>
          </Row>
          <Divider orientation="left" orientationMargin="0" className="divider">
            <h4>Data Dictionaries</h4>
          </Divider>
          <div className="study_details_cards_container">
            <Row gutter={[20, 24]}>
              <Col span={6}>
                {/* The first column is a card that opens a modal to add a new study. It sets 'addStudy' to true on click
                and triggers the modal to open*/}
                <span onClick={() => setAddDD(true)}>
                  <Card
                    hoverable
                    bordered={true}
                    style={{
                      border: '1px solid darkgray',
                      height: '42vh',
                    }}
                  >
                    <div className="new_study_card_container">
                      <div className="new_study_card">
                        Create New Data Dictionary
                      </div>
                    </div>
                  </Card>
                </span>
              </Col>
              {/* Cards with DD information associated with the study. */}
              {studyDDs?.map((dd, index) => (
                <Col span={6} key={index}>
                  {/* Displays the name if one is available or the id if there is no name.
                  Links to view the details of the DD via the 'View/Edit' button. */}

                  <Card
                    key={index}
                    title={dd?.name ? dd?.name : dd?.id}
                    bordered={true}
                    style={{
                      border: '1px solid darkgray',
                      height: '42vh',
                    }}
                    actions={[
                      <RemoveStudyDD
                        studyId={studyId}
                        dd={dd}
                        getStudyDDs={getStudyDDs}
                      />,
                      <Link to={`/Study/${studyId}/DataDictionary/${dd?.id}`}>
                        <button className="manage_term_button">
                          View / Edit
                        </button>
                        ,
                      </Link>,
                    ]}
                  >
                    <Skeleton loading={loading}>
                      {/* Displays the description up to 180 characters, truncated with ellipsis. */}

                      <Meta
                        style={{
                          height: '15vh',
                          border: '1px lightgray solid',
                          borderRadius: '5px',
                          padding: '5px',
                        }}
                        description={ellipsisString(dd?.description, '180')}
                      />
                      {/* Displays the number of tables associated with the DD by getting the length of the tables array in the DD */}

                      <Meta
                        style={{
                          padding: '0 5px',
                          margin: '3vh 0 0 0',
                        }}
                        description={'# of Tables: ' + dd?.tables.length}
                      />
                    </Skeleton>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      )}
      {/* Modal to edit details */}
      <EditStudyDetails
        form={form}
        study={study}
        setStudy={setStudy}
        edit={edit}
        setEdit={setEdit}
      />
      <DeleteStudy />
      <AddDD addDD={addDD} setAddDD={setAddDD} study={study} />
    </>
  );
};
