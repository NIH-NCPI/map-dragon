import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Link, useParams } from 'react-router-dom';
import Background from '../../../assets/Background.png';
import { Spinner } from '../../Manager/Spinner';
import './StudyStyling.scss';
import { getById } from '../../Manager/FetchManager';
import { DownOutlined } from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Space,
  Row,
  Col,
  Divider,
  Skeleton,
  Card,
} from 'antd';

import { ellipsisString } from '../../Manager/Utilitiy';
const { Meta } = Card;

export const StudyDetails = () => {
  const {
    study,
    setStudy,
    vocabUrl,
    studyDDs,
    setStudyDDs,
    loading,
    setLoading,
  } = useContext(myContext);
  const { studyId } = useParams();

  /* function that maps through the datadictionary (DD) array inside the given study and splits the 'reference' value at the '/'
for each DD to get an array of DD ids*/
  const arrayOfIds = study?.datadictionary?.map(r => {
    return r.reference.split('/')[1];
  });

  /* Function that maps through the arrayOfIds function above.
  For each DD, it pushes an API GET request to get that DD to the dDPromises array.
  Promise.all fulfills all of the fetch calls. The response is set to studyDDs  */
  const getStudyDDs = () => {
    let dDPromises = [];
    arrayOfIds?.forEach(id =>
      dDPromises.push(getById(vocabUrl, 'DataDictionary', id))
    );
    Promise.all(dDPromises).then(data => setStudyDDs(data));
  };

  // fetches the specified study. Sets response to 'study' and loading to false.
  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'Study', studyId)
      .then(data => setStudy(data))
      .then(() => setLoading(false));
  }, []);

  // calls the getStudyDDs function and sets loading to false
  useEffect(() => {
    setLoading(true);
    getStudyDDs();

    setLoading(false);
  }, [study]);

  // resets the study to an empty object on dismount
  // ensures the state is blank and the study data from the previous study is not displayed on load
  useEffect(
    () => () => {
      setStudy({});
    },
    []
  );

  const handleMenuClick = e => {
    console.log('click', e);
  };

  // Items to display in dropdown. Currently a placeholder and do not have functionality
  const items = [
    {
      label: 'Edit',
      key: '0',
    },
    {
      label: 'Invite collaborators',
      key: '1',
    },
    {
      label: 'Delete',
      key: '2',
      danger: true,
    },
  ];

  // Props for dropdown
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };
  return (
    <>
      {loading ? (
        // If page is loading, display loading spinner. Otherwise display code below
        <Spinner />
      ) : (
        <div className="studies_container">
          <div className="image_container">
            <img className="background_image_results" src={Background} />
          </div>
          <Row gutter={30}>
            <div className="study_details_container">
              <Col span={15}>
                <div className="study_details">
                  <div className="study_name">
                    {/* Displays study name if there is one. If no name, displays study id */}
                    <h2>{study?.name ? study?.name : study?.id}</h2>
                  </div>
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
                    {/* ant.design dropdown with placeholder values. */}
                    <Dropdown menu={menuProps} style={{ width: '30vw' }}>
                      <Button>
                        <Space
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: 100,
                          }}
                        >
                          Settings
                          <DownOutlined />
                        </Space>
                      </Button>
                    </Dropdown>
                  </div>
                  <div className="study_url">URL: {study.url}</div>
                </div>
              </Col>
            </div>
          </Row>
          <Divider orientation="left" orientationMargin="0" className="divider">
            <h4>Data Dictionaries</h4>
          </Divider>
          <div className="study_details_cards_container">
            <Row gutter={[20, 24]}>
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
                      <Link to={`/DataDictionary/${dd?.id}`}>
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
    </>
  );
};
