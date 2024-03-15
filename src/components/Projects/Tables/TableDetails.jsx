import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import './TableStyling.scss';
import { Link, useParams } from 'react-router-dom';
import Background from '../../../assets/Background.png';
import { Spinner } from '../../Manager/Spinner';
import { getById } from '../../Manager/FetchManager';
import { Table, Dropdown, Button, Space, Row, Col } from 'antd';
import { DownOutlined } from '@ant-design/icons';

export const TableDetails = () => {
  const { table, setTable, vocabUrl } = useContext(myContext);
  const { tableId } = useParams();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'Table', tableId)
      .then(data => setTable(data))
      .then(() => setLoading(false));
  }, []);

  useEffect(
    () => () => {
      setTable({});
    },
    []
  );

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

  const handleMenuClick = e => {
    // message.info('Click on menu item.');
    console.log('click', e);
  };
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Description', dataIndex: 'description' },
    { title: 'Data Type', dataIndex: 'data_type' },
    { title: 'Enumerations', dataIndex: 'enumeration' },
  ];

  const dataSource = table?.variables?.map((v, index) => {
    return {
      key: index,
      name: v.name,
      description: v.description,
      data_type: v.data_type,
      enumeration:
        v.data_type === 'ENUMERATION' ? (
          <Link to={`/${v.enumerations.reference}`}>View/Edit</Link>
        ) : (
          ''
        ),
    };
  });

  const expandedRowRender = record => {
    const columns = [
      {
        title: 'Min',
        dataIndex: 'min',
        key: 'min',
      },
      {
        title: 'Max',
        dataIndex: 'max',
        key: 'max',
      },
      {
        title: 'Units',
        dataIndex: 'units',
        key: 'units',
      },
    ];
    const data = {
      min: record.min,
      max: record.max,
      units: record.units,
    };
    return <Table columns={columns} dataSource={data} pagination={false} />;
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="table_id_container">
          <div className="image_container">
            <img className="background_image_results" src={Background} />
          </div>

          <Row gutter={30}>
            <div className="study_details_container">
              <Col span={15}>
                <div className="study_details">
                  <div className="study_name">
                    <h2>{table?.name ? table?.name : table?.id}</h2>
                  </div>
                  <div className="study_desc">
                    {table?.description ? (
                      table?.description
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
          {table?.filename ? (
            <>
              <div className="terminology_details terminology_desc">
                File name: {table?.filename}
              </div>
            </>
          ) : (
            ''
          )}
          <div className="terminology_details">{table?.url}</div>
          <div className="terminology_details terminology_desc"></div>
          <div className="table_container">
            <Table
              columns={columns}
              dataSource={dataSource}
              expandable={{
                expandedRowRender: record => (
                  <p
                    style={{
                      marginLeft: 50,
                    }}
                  >
                    min: {record.min} max: {record.max} units:{record.units}
                  </p>
                ),
                rowExpandable: record =>
                  record.data_type === 'INTEGER' ||
                  record.data_type === 'QUANTITY',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
