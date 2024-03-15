import { useContext, useEffect, useState } from 'react';
import './StudyStyling.scss';
import { Link, useNavigate } from 'react-router-dom';
import { myContext } from '../../../App';
import { Spinner } from '../../Manager/Spinner';
import { getAll, handlePost } from '../../Manager/FetchManager';
import { Modal, Form, Row, Col, Card, Button, Skeleton } from 'antd';
import { AddStudy } from './AddStudy';
import Background from '../../../assets/Background.png';
import { ellipsisString } from '../../Manager/Utilitiy';
const { Meta } = Card;

export const StudyList = () => {
  const [form] = Form.useForm();
  const {
    loading,
    setLoading,
    studies,
    setStudies,
    addStudy,
    setAddStudy,
    vocabUrl,
  } = useContext(myContext);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAll(vocabUrl, 'Study')
      .then(data => setStudies(data))
      .then(() => setLoading(false));
  }, []);

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
        <div className="image_container">
          <img className="background_image_results" src={Background} />
        </div>
        <div className="projects_sub_nav">
          <h2>My Studies</h2>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="cards_container">
            <Row gutter={[20, 24]}>
              <Col span={6}>
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
        )}

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
