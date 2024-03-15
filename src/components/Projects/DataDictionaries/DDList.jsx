import { useContext, useEffect, useState } from 'react';
import './DDStyling.scss';
import { Link, useNavigate } from 'react-router-dom';
import { myContext } from '../../../App';
import { Spinner } from '../../Manager/Spinner';
import { DeleteDD } from './DeleteDD';
import { getAll, handlePost } from '../../Manager/FetchManager';
import { Modal, Form } from 'antd';
import { AddDD } from './AddDD';

export const DDList = () => {
  const [form] = Form.useForm();
  const {
    loading,
    setLoading,
    vocabUrl,
    dataDictionaries,
    setDataDictionaries,
    addDD,
    setAddDD,
  } = useContext(myContext);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAll(vocabUrl, 'DataDictionary').then(data => setDataDictionaries(data));
    setLoading(false);
  }, []);

  const handleSubmit = values => {
    values.tables = values.tables?.map(ref => {
      return { reference: `Table/${ref}` };
    });
    handlePost(vocabUrl, 'DataDictionary', values).then(data =>
      navigate(`/DataDictionary/${data?.id}`),
    );
  };

  return (
    <>
      <div className="projects_sub_nav">
        <h2>Data Dictionaries</h2>
        <div className="menu_buttons_container">
          <button
            className="manage_term_button"
            // onClick={() => navigate('/add_DD')}
            onClick={() => setAddDD(true)}
          >
            Create Data Dictionary
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
              {dataDictionaries?.map((r, index) => {
                return (
                  <>
                    <tr key={index}>
                      <td className="project_first_cell">
                        <Link to={`/DataDictionary/${r?.id}`}>
                          {r?.name ? r?.name : r?.id}
                        </Link>
                      </td>
                      <td className="project_second_cell">{r?.description}</td>
                      <td className="delete_cell">
                        <DeleteDD
                          dataDictionary={r}
                          setDataDictionaries={setDataDictionaries}
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
        open={addDD}
        width={'70%'}
        onOk={() =>
          form.validateFields().then(values => {
            handleSubmit(values);
            form.resetFields();
            setAddDD(false);
          })
        }
        onCancel={() => {
          form.resetFields();
          setAddDD(false);
        }}
        maskClosable={false}
      >
        <AddDD form={form} />
      </Modal>
    </>
  );
};
