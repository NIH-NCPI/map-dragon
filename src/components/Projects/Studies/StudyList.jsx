import { useContext, useEffect, useState } from 'react';
import './StudyStyling.scss';
import '../../Manager/AddNewCard.scss';

import { Link, useNavigate } from 'react-router-dom';
import { myContext } from '../../../App';
import { Spinner } from '../../Manager/Spinner';
import { getAll, handlePost } from '../../Manager/FetchManager';
import { Modal, Form, Row, Col, Card, notification, Skeleton } from 'antd';
import { AddStudy } from './AddStudy';
import Background from '../../../assets/Background.png';
import { ellipsisString } from '../../Manager/Utilitiy';
const { Meta } = Card;

export const StudyList = () => {
  const [form] = Form.useForm();
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

  // Submit function for adding a new study.
  // Maps through the datadictionary (DD) array of the values being submitted (the array is an array of DD id's ).
  // For each iteration of the array, it returns a reference object with the value of "DataDictionary/"
  // and the DD id on the other side of the slash
  // The funciton to make the POST request is called with the values to put into the body of the request.
  // The user is then redirected to the new study created.
  const handleSubmit = values => {
    values.datadictionary = values.datadictionary?.map(ref => {
      return { reference: `DataDictionary/${ref}` };
    });
    handlePost(vocabUrl, 'Study', values).then(data =>
      navigate(`/study/${data?.id}`)
    );
  };

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

        {/* ant.design modal with the form to add a study */}
        {/* when the OK button is pressed, the form validates the fields to ensure required sections are completed.
        The handleSubmit function is called to POST the values to the API. 
        The modal is reset to its initial, blank state.
        addStudy is set to false to close the modal */}
        <Modal
          open={addStudy}
          width={'70%'}
          onOk={() =>
            form.validateFields().then(values => {
              handleSubmit(values);
              form.resetFields();
              setAddStudy(false);
            })
          }
          onCancel={() => {
            form.resetFields();
            setAddStudy(false);
          }}
          maskClosable={false}
        >
          <AddStudy form={form} />
        </Modal>
      </div>
    </>
  );
};
