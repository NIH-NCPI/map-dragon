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
} from 'antd';

import './DDStyling.scss';
import { Checkbox } from 'antd';
import { getAll, getById, handleUpdate } from '../../Manager/FetchManager';
import { ellipsisString } from '../../Manager/Utilitiy';

export const DDDetails = () => {
  const {
    dataDictionary,
    setDataDictionary,
    vocabUrl,
    loading,
    setLoading,
    tablesDD,
    setTablesDD,
  } = useContext(myContext);
  const { DDId } = useParams();

  const arrayOfIds = dataDictionary?.tables?.map(r => {
    return r.reference.split('/')[1];
  });

  const getDDTables = () => {
    let tablePromises = [];
    arrayOfIds?.forEach(id =>
      tablePromises.push(getById(vocabUrl, 'Table', id))
    );
    Promise.all(tablePromises).then(data => setTablesDD(data));
  };

  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'DataDictionary', DDId).then(data =>
      setDataDictionary(data)
    );
    getAll(vocabUrl, 'Table').then(data => setTablesDD(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    getDDTables();
    setLoading(false);
  }, [dataDictionary]);

  const handleMenuClick = e => {
    // message.info('Click on menu item.');
    console.log('click', e);
  };

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

  const updateTablesDD = selectedIds => {
    const dataDictionaryIds = selectedIds.filter(obj => !!obj);
    const tablesDTO = dataDictionaryIds.map(dd => {
      return { reference: `Table/${dd}` };
    });
    handleUpdate(vocabUrl, 'DataDictionary', {
      ...dataDictionary,
      tables: tablesDTO,
    }).then(data => setDataDictionary(data));
  };

  const selectedObjs = tablesDD.filter(table => {
    return arrayOfIds?.includes(table.id);
  });

  return (
    <>
      {loading ? (
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
                    <h2>
                      {dataDictionary?.name
                        ? dataDictionary?.name
                        : dataDictionary?.id}
                    </h2>
                  </div>
                  <div className="study_desc">
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
              {tablesDD?.map((table, index) => (
                <Col key={index} span={6}>
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
                      <Meta
                        style={{
                          height: '15vh',
                          border: '1px lightgray solid',
                          borderRadius: '5px',
                          padding: '5px',
                        }}
                        description={ellipsisString(table?.description, '180')}
                      />
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
