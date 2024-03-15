import { useContext, useEffect, useState } from 'react';
import './TableStyling.scss';
import { Link, useNavigate } from 'react-router-dom';
import { myContext } from '../../../App';
import { Spinner } from '../../Manager/Spinner';
import { DeleteTable } from './DeleteTable';
import { getAll, handlePost } from '../../Manager/FetchManager';
import { AddTable } from './AddTable';
import { Modal, Form } from 'antd';
import { UploadTable } from './UploadTable';
import Papa from 'papaparse';

export const TableList = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const {
    loading,
    setLoading,
    vocabUrl,
    tables,
    setTables,
    table,
    setTable,
    addTable,
    setAddTable,
    loadTable,
    setLoadTable,
  } = useContext(myContext);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAll(vocabUrl, 'Table').then(data => setTables(data));
    setLoading(false);
  }, []);

  const handleSubmit = values => {
    handlePost(vocabUrl, 'Table', values).then(data =>
      navigate(`/table/${data?.id}`),
    );
  };

  const jsonParse = item => {
    Papa.parse(item, {
      header: true,
      skipEmptyLines: true,
      complete: function (result) {
        console.log(result.data);
        // handlePost(vocabUrl, 'LoadTable', tableDTO(result.data)).then(data =>
        //   navigate(`/table/${data?.id}`),
        // );
      },
    });
  };

  const handleUpload = values => {
    Papa.parse(values.csvContents.file, {
      header: true,
      skipEmptyLines: true,
      complete: function (result) {
        values.filename = values.csvContents.file.name;
        values.csvContents = result.data;
        handlePost(vocabUrl, 'LoadTable', values).then(data =>
          navigate(`/table/${data?.id}`),
        );
      },
    });
  };

  return (
    <>
      <div className="projects_sub_nav">
        <h2>Tables</h2>
        <div className="menu_buttons_container">
          <button
            className="manage_term_button"
            onClick={() => setLoadTable(true)}

            // onClick={() => navigate('/upload_table')}
          >
            Upload Table
          </button>
          <button
            className="manage_term_button"
            onClick={() => setAddTable(true)}
          >
            Create Table
          </button>
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
              {tables?.map((r, index) => {
                return (
                  <>
                    <tr key={index}>
                      <td className="project_first_cell">
                        <Link to={`/Table/${r?.id}`}>
                          {r?.name ? r?.name : r?.id}
                        </Link>
                      </td>
                      <td className="project_second_cell">{r?.description}</td>
                      <td className="delete_cell">
                        <DeleteTable table={r} setTables={setTables} />
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
        open={addTable}
        width={'70%'}
        onOk={() =>
          form.validateFields().then(values => {
            handleSubmit(values);
            form.resetFields();
            setAddTable(false);
          })
        }
        onCancel={() => {
          form.resetFields();
          setAddTable(false);
        }}
        maskClosable={false}
      >
        <AddTable form={form} />
      </Modal>
      <Modal
        open={loadTable}
        width={'70%'}
        onOk={() =>
          form.validateFields().then(values => {
            handleUpload(values);
            form.resetFields();
            setLoadTable(false);
          })
        }
        onCancel={() => {
          form.resetFields();
          setLoadTable(false);
          setFileList([]);
        }}
        maskClosable={false}
      >
        <UploadTable
          form={form}
          fileList={fileList}
          setFileList={setFileList}
        />
      </Modal>
    </>
  );
};
