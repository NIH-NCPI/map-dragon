import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { Link, useParams } from 'react-router-dom';
import Background from '../../../assets/Background.png';
import { Spinner } from '../../Manager/Spinner';
import { DownOutlined } from '@ant-design/icons';
const { Meta } = Card;
import {
  Button,
  Dropdown,
  Space,
  Row,
  Col,
  Divider,
  Skeleton,
  Card,
  notification,
} from 'antd';

import './DDStyling.scss';
import { getAll, getById } from '../../Manager/FetchManager';
import { ellipsisString } from '../../Manager/Utilitiy';

export const DDDetails = () => {
  const { vocabUrl, tablesDD, setTablesDD } = useContext(myContext);
  const { DDId } = useParams();
  const initialDD = { name: '', description: '', tables: [] }; //initial state of data dictionary

  const [dataDictionary, setDataDictionary] = useState(initialDD);
  const [loading, setLoading] = useState(true);

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

  const handleMenuClick = e => {
    // message.info('Click on menu item.');
    console.log('click', e);
  };

  // Items to display in dropdown. Currently a placeholder and do not have functionality
  const items = [
    {
      label: 'Edit',
      key: '0',
    },
    {
      label: 'Delete',
      key: '2',
      danger: true,
    },
  ];

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
                </div>
              </Col>
            </div>
          </Row>
          <Divider orientation="left" orientationMargin="0" className="divider">
            <h4>Tables</h4>
          </Divider>
          <div className="study_details_cards_container">
            <Row gutter={[20, 24]}>
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
                      <Link to={`/Table/${table?.id}`}>
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
    </>
  );
};
