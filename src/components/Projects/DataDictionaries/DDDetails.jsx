import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Link, useParams } from 'react-router-dom';
import Background from '../../../assets/Background.png';
import { Spinner } from '../../Manager/Spinner';
import Papa from 'papaparse';

const { Meta } = Card;
import {
  Modal,
  Row,
  Col,
  Divider,
  Skeleton,
  Card,
  notification,
  Form,
  message,
  Button,
} from 'antd';

import './DDStyling.scss';
import { getAll, getById, handleUpdate } from '../../Manager/FetchManager';
import { ellipsisString } from '../../Manager/Utilitiy';
import { SettingsDropdown } from '../../Manager/Dropdown/SettingsDropdown';
import { EditDDDetails } from './EditDDDetails';
import { UploadTable } from '../Tables/UploadTable';

export const DDDetails = () => {
  const [form] = Form.useForm();
  const {
    vocabUrl,
    tablesDD,
    setTablesDD,
    edit,
    setEdit,
    dataDictionary,
    setDataDictionary,
  } = useContext(myContext);
  const { DDId } = useParams();

  const [loading, setLoading] = useState(true);
  const [addTable, setAddTable] = useState(false);

  /* function that maps through the tables array inside the given data dictionary (DD) and splits the 'reference' value at the '/'
for each table to get an array of table ids*/
  const arrayOfIds = dataDictionary?.tables?.map(r => {
    return r.reference.split('/')[1];
  });

  /* Function that maps through the arrayOfIds function above.
  For each table, it pushes an API GET request to get that table to the tablePromises array.
  Promise.all fulfills all of the fetch calls. The response is set to tablesDD  */
  const getDDTables = () => {
    let tablePromises = [];
    arrayOfIds?.forEach(id =>
      tablePromises.push(getById(vocabUrl, 'Table', id))
    );
    Promise.all(tablePromises).then(data => setTablesDD(data));
  };

  // fetches the specified DD. Sets response to 'dataDictionary' and loading to false.

  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'DataDictionary', DDId)
      .then(data => setDataDictionary(data))
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
    getAll(vocabUrl, 'Table')
      .then(data => setTablesDD(data))
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

  // calls the getDDTables function and sets loading to false

  useEffect(() => {
    setLoading(true);
    getDDTables();
    setLoading(false);
  }, [dataDictionary]);

  // Submit function for the modal to edit the study name, description, and url.
  // The function adds the variables and filename to the body of the PUT request to retain the complete
  // study object, since only 3 parts (captured in "values" through ant.d functionality) are being edited.
  const handleSubmit = values => {
    handleUpdate(vocabUrl, 'DataDictionary', dataDictionary, {
      ...values,
      tables: dataDictionary?.tables,
    })
      .then(data => {
        setDataDictionary(data);
        message.success('Changes saved successfully.');
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred editing the Data Dictionary. Please try again.',
          });
        }
        return error;
      });
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
                    {/* Displays DD name if there is one. If no name, displays DD id */}

                    <h2>
                      {dataDictionary?.name
                        ? dataDictionary?.name
                        : dataDictionary?.id}
                    </h2>
                  </div>
                  <div className="study_desc">
                    {/* Displays the DD description if there is one.
                    If there is no description, 'No description provided' is displayed in a gray font */}
                    {dataDictionary?.description ? (
                      dataDictionary?.description
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
                    <SettingsDropdown dataDictionary={dataDictionary} />
                  </div>
                </div>
              </Col>
            </div>
          </Row>
          <Divider orientation="left" orientationMargin="0" className="divider">
            <h4>Tables</h4>
          </Divider>
          <div className="study_details_cards_container">
            <Row gutter={[20, 24]}>
              <Col span={6}>
                {/* The first column is a card that opens a modal to add a new study. It sets 'addTable' to true on click
                and triggers the modal to open*/}
                <span onClick={() => setAddTable(true)}>
                  <Card
                    hoverable
                    bordered={true}
                    style={{
                      border: '1px solid darkgray',
                      height: '42vh',
                    }}
                  >
                    <div className="new_study_card_container">
                      <div className="new_study_card">Create New Table</div>
                    </div>
                  </Card>
                </span>
              </Col>
              {/* Cards with table information associated with the DD. */}
              {tablesDD?.map((table, index) => (
                <Col key={index} span={6}>
                  {/* Displays the name if one is available or the id if there is no name.
                  Links to view the details of the table via the 'View/Edit' button. */}
                  <Card
                    key={index}
                    title={table?.name ? table?.name : table?.id}
                    bordered={true}
                    style={{
                      border: '1px solid darkgray',
                      height: '42vh',
                    }}
                    actions={[
                      <Link
                        state={{ propDD: dataDictionary.id }}
                        to={`/Table/${table?.id}`}
                      >
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
                        description={ellipsisString(table?.description, '180')}
                      />
                      {/* Displays the number of variables associated with the table
                       by getting the length of the variables array in the table */}
                      <Meta
                        style={{
                          padding: '0 5px',
                          margin: '3vh 0 0 0',
                        }}
                        description={
                          '# of variables: ' + table?.variables.length
                        }
                      />
                    </Skeleton>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      )}
      <Modal
        open={edit}
        width={'51%'}
        onOk={() =>
          form.validateFields().then(values => {
            form.resetFields();
            setEdit(false);
            // console.log(values);
            handleSubmit(values);
          })
        }
        onCancel={() => {
          form.resetFields();
          setEdit(false);
        }}
        maskClosable={false}
        closeIcon={false}
        destroyOnClose={true}
      >
        {/* Displays the edit form */}
        <EditDDDetails form={form} dataDictionary={dataDictionary} />
      </Modal>
      <UploadTable
        addTable={addTable}
        setAddTable={setAddTable}
        setTablesDD={setTablesDD}
      />
    </>
  );
};
