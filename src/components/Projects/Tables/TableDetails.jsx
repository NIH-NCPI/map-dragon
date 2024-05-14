import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import './TableStyling.scss';
import { Link, useLocation, useParams } from 'react-router-dom';
import Background from '../../../assets/Background.png';
import { Spinner } from '../../Manager/Spinner';
import { getById, handleUpdate } from '../../Manager/FetchManager';
import {
  Table,
  Row,
  Col,
  Modal,
  Form,
  message,
  notification,
  Card,
} from 'antd';
import { EditTableDetails } from './EditTableDetails';
import { SettingsDropdown } from '../../Manager/Dropdown/SettingsDropdown';
import { DeleteTable } from './DeleteTable';
import { LoadVariables } from './LoadVariables';
import { GetMappingsTableModal } from './GetMappingsTableModal';
import { MappingContext } from '../../../MappingContext';
import { ExportFile } from './ExportFile';
import { DeleteVariable } from './DeleteVariable';

export const TableDetails = () => {
  const [form] = Form.useForm();

  const { vocabUrl, edit, setEdit, table, setTable } = useContext(myContext);
  const { getMappings, setGetMappings, mapping, setMapping } =
    useContext(MappingContext);
  const { DDId, tableId } = useParams();
  const [loading, setLoading] = useState(true);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    setDataSource(tableData(table));
  }, [table]);

  // fetches the table and sets 'table' to the response
  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'Table', tableId)
      .then(data => setTable(data))
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      })
      // getById(vocabUrl, 'Table', `${tableId}/mapping`)
      //   .then(data => setMapping(data.codes))
      //   .catch(error => {
      //     if (error) {
      //       notification.error({
      //         message: 'Error',
      //         description:
      //           'An error occurred loading mappings. Please try again.',
      //       });
      //     }
      //     return error;
      //   })
      .finally(() => setLoading(false));
  }, []);

  // sets table to an empty object on dismount
  useEffect(
    () => () => {
      setTable({});
    },
    []
  );

  // Submit function for the modal to edit the table name, description, and url.
  // The function adds the variables and filename to the body of the PUT request to retain the complete
  // table object, since only 3 parts (captured in "values" through ant.d functionality) are being edited.
  const handleSubmit = values => {
    handleUpdate(vocabUrl, 'Table', table, {
      ...values,
      filename: table.filename,
      variables: table?.variables,
    })
      .then(data => setTable(data))
      // Displays a self-closing message that the udpates have been successfully saved.
      .then(() => message.success('Changes saved successfully.'));
  };

  // columns for the ant.design table
  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Description', dataIndex: 'description' },
    { title: 'Data Type', dataIndex: 'data_type' },
    { title: 'Enumerations', dataIndex: 'enumeration' },
    // { title: 'Mapped Terms', dataIndex: 'mapped_terms' },
    // { title: '', dataIndex: 'get_mappings', width: 164 },
    {
      title: '',
      dataIndex: 'delete_column',
      render: (_, tableData) => {
        return (
          <>
            <div className="edit_delete_buttons">
              <DeleteVariable
                tableData={tableData}
                table={table}
                setTable={setTable}
              />
            </div>
          </>
        );
      },
    },
  ];

  /* The table may have numerous codes. The API call to fetch the mappings returns all mappings for the table.
The codes in the mappings need to be matched up to each code in the table.
The function maps through the mapping array. For each code, if the mapping code is equal to the 
code in the table, AND the mappings array length for the code is > 0, the mappings array is mapped through
and returns the length of the mapping array (i.e. returns the number of codes mapped to the table code). 
There is then a tooltip that displays the codes on hover.*/
  const matchCode = code =>
    mapping?.length > 0
      ? mapping?.map((item, index) =>
          item.code === code.code && item?.mappings?.length > 0 ? (
            <Tooltip
              title={item.mappings.map(code => {
                return <div key={index}>{code.code}</div>;
              })}
              key={index}
            >
              {item.mappings.length}
            </Tooltip>
          ) : (
            ''
          )
        )
      : '';

  // data for the table columns. Each table has an array of variables. Each variable has a name, description, and data type.
  // The integer and quantity data types include additional details.
  // The enumeration data type includes a reference to a terminology, which includes further codes with the capability to match the
  // terms to ontology codes. If the data type is enumeration, there is a 'view/edit' link that takes the user to specified terminology.
  const tableData = table =>
    table?.variables?.map((variable, index) => {
      return {
        key: index,
        name: variable.name,
        description: variable.description,
        data_type: variable.data_type,
        enumeration: variable.data_type === 'ENUMERATION' && (
          <Link to={`/${variable.enumerations.reference}`}>View/Edit</Link>
        ),
        mapped_terms: 'placeholder' /*matchCode(variable)*/,
        get_mappings: (
          //       /* If the mapping array length is greather than 0, we check if there is a matching mapped code
          // to the terminology code.
          //               If there is a match for the terminology code in the mapping codes AND if the mappings array for
          //       that code is > 0, the Edit Mappings button is displayed. On click, a modal with mapping details is opened
          //     and the terminology code is passed.*/

          //       mapping?.length > 0 ? (
          //         mapping.some(m => m.code === code.code && m?.mappings?.length > 0) ? (
          //           <button
          //             key={code.code}
          //             className="manage_term_button"
          //             onClick={() => setEditMappings(code)}
          //           >
          //             Edit Mappings
          //           </button>
          //         ) : (
          //           /* If there is NOT a match for the terminology code in the mapping codes, the Get Mappings button
          //              is displayed. On click, a modal opens that automatically performs a search in OLS for the terminology
          //              code and the terminology code is passed.*/
          <button
            className="manage_term_button"
            onClick={() => setGetMappings(variable)}
          >
            Get Mappings
          </button>
        ),
        //         )
        //       ) : (
        //         /* If the mapping array length is not greater than 0, the Get Mappings button
        //              is displayed. On click, a modal opens that automatically performs a search in OLS for the terminology
        //              code and the terminology code is passed.*/
        //         <button
        //           className="manage_term_button"
        //           onClick={() => setGetMappings(code)}
        //         >
        //           Get Mappings
        //         </button>
        //       ),
      };
    });

  const [dataSource, setDataSource] = useState(tableData);

  // In progress. Not yet used.
  // Expandable rows for integer and quantity data types to display their additional data.
  // The additional elements include min, max, and units properties.
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
        // If page is loading, display loading spinner. Otherwise display code below

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
                    {/* Displays table name if there is one. If no name, displays DD id */}

                    <h2>{table?.name ? table?.name : table?.id}</h2>
                  </div>
                  <div className="study_desc">
                    {/* Displays the DD description if there is one.
                    If there is no description, 'No description provided' is displayed in a gray font */}
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
                    {/* ant.design dropdown for edit. */}
                    <SettingsDropdown />
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
            {/* ant.design table displaying the pre-defined columns and data, with expandable rows. 
            The expandable rows currently show the min, max, and units properties with no styling. */}
            {table.variables.length > 0 ? (
              <>
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

                <ExportFile table={table} />
              </>
            ) : (
              <Row gutter={[20, 24]}>
                <Col span={6}>
                  {/* The first column is a card that opens a modal to add a new study. It sets 'addTable' to true on click
                and triggers the modal to open*/}
                  <span onClick={() => setLoad(true)}>
                    <Card
                      hoverable
                      bordered={true}
                      style={{
                        border: '1px solid darkgray',
                        height: '42vh',
                      }}
                    >
                      <div className="new_study_card_container">
                        <div className="new_study_card">
                          Upload Variables (CSV)
                        </div>
                      </div>
                    </Card>
                  </span>
                </Col>
              </Row>
            )}
          </div>
        </div>
      )}

      {/* Modal to edit details */}
      <Modal
        open={edit}
        width={'51%'}
        onOk={() =>
          form.validateFields().then(values => {
            form.resetFields();
            setEdit(false);
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
        <EditTableDetails form={form} table={table} />
      </Modal>
      <DeleteTable DDId={DDId} />
      <LoadVariables load={load} setLoad={setLoad} />
      <GetMappingsTableModal
        table={table}
        setTable={setTable}
        getMappings={getMappings}
        setGetMappings={setGetMappings}
        setMapping={setMapping}
        tableId={tableId}
      />
    </>
  );
};
