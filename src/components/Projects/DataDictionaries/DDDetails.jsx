import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Spinner } from '../../Manager/Spinner';
const { Meta } = Card;
import {
  Row,
  Col,
  Divider,
  Skeleton,
  Card,
  notification,
  Form,
  Button,
} from 'antd';
import './DDStyling.scss';
import { getById } from '../../Manager/FetchManager';
import { ellipsisString } from '../../Manager/Utilitiy';
import { SettingsDropdown } from '../../Manager/Dropdown/SettingsDropdown';
import { EditDDDetails } from './EditDDDetails';
import { UploadTable } from '../Tables/UploadTable';
import { RemoveTableDD } from './RemoveTableDD';
import { DeleteDD } from './DeleteDD';
import { Submenu } from '../../Manager/Submenu';

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
  const { studyId, DDId } = useParams();

  const [loading, setLoading] = useState(true);
  const [addTable, setAddTable] = useState(false);

  const navigate = useNavigate();
  /* Function that maps through the tables array in a DD.
  For each table, it makes a fetch call to the id of the table.
  Promise.all fulfills all of the fetch calls. The response is set to tablesDD  */
  const getDDTables = async newDD => {
    const tablePromises = newDD?.tables?.map(r =>
      getById(vocabUrl, 'Table', r.reference.split('/')[1])
    );
    const data = await Promise.all(tablePromises);
    setTablesDD(data);
    setLoading(false);
  };

  // fetches the specified DD. Sets response to 'dataDictionary'.
  // if a DD was fetched, calls the getDDTables function to fetch the tables.
  // otherwise sets loading to false.

  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'DataDictionary', DDId)
      .then(data => {
        if (data === null) {
          navigate('/404');
        } else {
          setDataDictionary(data);
          if (data) {
            getDDTables(data);
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
        }
        return error;
      });
    return () => {
      setTablesDD([]);
      setDataDictionary({});
    };
  }, []);

  return (
    <>
      {loading ? (
        // If page is loading, display loading spinner. Otherwise display code below
        <Spinner />
      ) : (
        <div className="studies_container">
          <Submenu prop={dataDictionary} />
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
                      <div className="new_study_card">Upload Table</div>
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
                      // Button to remove a table from a DD
                      <RemoveTableDD
                        DDId={DDId}
                        table={table}
                        getDDTables={getDDTables}
                      />,
                      <Link
                        to={`/Study/${studyId}/DataDictionary/${DDId}/Table/${table?.id}`}
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

      {/* Displays the edit form */}
      <EditDDDetails
        edit={edit}
        setEdit={setEdit}
        form={form}
        dataDictionary={dataDictionary}
        setDataDictionary={setDataDictionary}
      />
      <UploadTable
        addTable={addTable}
        setAddTable={setAddTable}
        setTablesDD={setTablesDD}
        tablesDD={tablesDD}
        dataDictionary={dataDictionary}
        setDataDictionary={setDataDictionary}
      />
      <DeleteDD studyId={studyId} />
    </>
  );
};
