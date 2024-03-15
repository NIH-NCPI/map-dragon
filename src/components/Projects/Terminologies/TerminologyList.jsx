import { useContext, useEffect, useState } from 'react';
import '../Projects.scss';
import { Link, useNavigate } from 'react-router-dom';
import { myContext } from '../../../App';
import { Spinner } from '../../Manager/Spinner';
import { DeleteTerminology } from './DeleteTerminology';
import { getAll, handlePost } from '../../Manager/FetchManager';
import { Modal, Form } from 'antd';
import { AddTerminology } from './AddTerminology';

export const TerminologyList = () => {
  const [form] = Form.useForm();

  const {
    loading,
    setLoading,
    vocabUrl,
    terminologies,
    setTerminologies,
    setAddTerm,
    addTerm,
  } = useContext(myContext);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAll(vocabUrl, 'Terminology').then(data => setTerminologies(data));
    setLoading(false);
  }, []);

  const handleSubmit = values => {
    handlePost(vocabUrl, 'Terminology', values).then(data =>
      navigate(`/terminology/${data?.id}`),
    );
  };

  return (
    <>
      <div className="projects_sub_nav">
        <h2>Terminologies</h2>
        <div className="menu_buttons_container">
          <button
            className="manage_term_button"
            onClick={() => setAddTerm(true)}
          >
            Create Terminology
          </button>{' '}
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="table_container">
          <table className="table">
            <thead className="header">
              <tr className="header_row">
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {terminologies?.map((r, index) => {
                return (
                  <>
                    <tr key={index}>
                      <td className="project_first_cell">
                        <Link to={`/Terminology/${r?.id}`}>
                          {r?.name ? r?.name : r?.id}
                        </Link>
                      </td>
                      <td className="project_second_cell">{r?.description}</td>
                      <td className="delete_cell">
                        <DeleteTerminology
                          terminology={r}
                          setTerminologies={setTerminologies}
                        />
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={addTerm}
        width={'70%'}
        onOk={() =>
          form.validateFields().then(values => {
            handleSubmit(values);
            form.resetFields();
            setAddTerm(false);
          })
        }
        onCancel={() => {
          form.resetFields();
          setAddTerm(false);
        }}
        maskClosable={false}
      >
        <AddTerminology form={form} />
      </Modal>
    </>
  );
};
