import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import './TableStyling.scss';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Spinner } from '../../Manager/Spinner';
import { getById } from '../../Manager/FetchManager';
import {
  Button,
  Card,
  Col,
  Form,
  message,
  notification,
  Row,
  Table,
  Tooltip,
} from 'antd';
import {
  CaretDownOutlined,
  CaretUpOutlined,
  CloseCircleOutlined,
  DownOutlined,
  MessageOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { EditTableDetails } from './EditTableDetails';
import { DeleteTable } from './DeleteTable';
import { LoadVariables } from './LoadVariables';
import { MappingContext } from '../../../Contexts/MappingContext';
import { ExportFile } from './ExportFile';
import { EditMappingsTableModal } from './EditMappingsTableModal';
import { ClearMappings } from '../../Manager/MappingsFunctions/ClearMappings';
import { GetMappingsModal } from '../../Manager/MappingsFunctions/GetMappingsModal';
import { AddVariable } from './AddVariable';
import { ExpandedRowTable } from './ExpandedRowTable';
import { TableMenu } from './TableMenu';
import { SettingsDropdownTable } from '../../Manager/Dropdown/SettingsDropdownTable';
import { RequiredLogin } from '../../Auth/RequiredLogin';
import { FilterSelect } from '../../Manager/MappingsFunctions/FilterSelect';
import { SearchContext } from '../../../Contexts/SearchContext';
import {
  userVote,
  votesCount,
  relationshipDisplay,
  uriEncoded,
} from '../../Manager/Utility';
import { mappingVotes } from '../../Manager/MappingsFunctions/MappingVotes';
import { MappingComments } from '../../Manager/MappingsFunctions/MappingComments';

export const TableDetails = () => {
  const [form] = Form.useForm();

  const {
    vocabUrl,
    edit,
    setEdit,
    table,
    setTable,
    user,
    ucumCodes,
    setUcumCodes,
  } = useContext(myContext);
  const { setApiPreferences } = useContext(SearchContext);
  const {
    getMappings,
    setGetMappings,
    mapping,
    setMapping,
    setEditMappings,
    editMappings,
    setRelationshipOptions,
    comment,
    setComment,
  } = useContext(MappingContext);
  const { studyId, DDId, tableId } = useParams();
  const [loading, setLoading] = useState(true);
  const [load, setLoad] = useState(false);

  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem('pageSize'), 10) || 10
  );
  const handleTableChange = (current, size) => {
    setPageSize(size);
  };
  const navigate = useNavigate();

  const handleSuccess = () => {
    setLoad(true);
  };
  const login = RequiredLogin({ handleSuccess: handleSuccess });

  useEffect(() => {
    document.title = 'Table - Map Dragon';
  }, []);

  useEffect(() => {
    setDataSource(tableData(table));
    localStorage.setItem('pageSize', pageSize);
  }, [table, mapping, pageSize]);

  const updateMappings = (mapArr, mappingCode) => {
    const mappingsDTO = {
      mappings: mapArr,
      editor: user.email,
    };

    fetch(`${vocabUrl}/Table/${tableId}/mapping/${uriEncoded(mappingCode)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mappingsDTO),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => {
        setMapping(data.codes);
        setEditMappings(null);
        form.resetFields();
        message.success('Mapping removed.');
      })
      .catch(error => {
        console.log(error, 'error');

        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      });
  };

  // fetches the table and sets 'table' to the response
  useEffect(() => {
    tableApiCalls();
  }, []);

  const tableApiCalls = async () => {
    setLoading(true);
    getById(vocabUrl, 'Table', tableId)
      .then(data => {
        setTable(data);
        if (data) {
          getById(
            vocabUrl,
            'Table',
            `${tableId}/mapping?user_input=True&user=${user?.email}`
          )
            .then(data => setMapping(data.codes))
            .catch(error => {
              if (error) {
                console.log(error, 'error');

                notification.error({
                  message: 'Error',
                  description: 'An error occurred loading mappings.',
                });
              }
              return error;
            })
            .then(() =>
              getById(
                vocabUrl,
                'Terminology',
                'ftd-concept-map-relationship'
              ).then(data => setRelationshipOptions(data.codes))
            )
            .then(() =>
              fetch(`${vocabUrl}/Table/${tableId}/filter/self`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              })
            )
            .then(res => {
              if (res.ok) {
                return res.json();
              } else {
                throw new Error('An unknown error occurred.');
              }
            })
            .then(data => {
              setApiPreferences(data);
            })
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description: 'An error occurred loading the table.',
          });
          setLoading(false);
        }
        return error;
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    table && tableTypes();
  }, [table]);

  const tableTypes = () => {
    const varTypes = table?.variables?.map(tv => tv.data_type);
    if (varTypes?.includes('INTEGER' || 'QUANTITY')) {
      getById(vocabUrl, 'Terminology', 'ucum-common').then(data =>
        setUcumCodes(data.codes)
      );
    }
  };

  // sets table to an empty object on dismount
  useEffect(
    () => () => {
      setTable({});
    },
    []
  );

  // columns for the ant.design table
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 200,
    },
    { title: 'Data Type', dataIndex: 'data_type', width: 100 },
    { title: 'Enumerations', dataIndex: 'enumeration', width: 100 },
    { title: 'Mapped Terms', dataIndex: 'mapped_terms', width: 300 },
    {
      title: '',
      dataIndex: 'delete_column',
      width: 10,
      render: (_, tableData) => {
        return (
          <>
            {tableData.key !== 'newRow' && (
              // If the tableData key is not "newRow" (i.e. it is not a newly added input field to add a new row)
              // The actions/mappings menu is displayed
              <>
                {/* <div className="edit_delete_buttons"> */}
                <TableMenu
                  table={table}
                  setTable={setTable}
                  tableData={tableData}
                  form={form}
                  loading={loading}
                  setLoading={setLoading}
                  setEditMappings={setEditMappings}
                  setGetMappings={setGetMappings}
                  mapping={mapping}
                />
              </>
            )}
          </>
        );
      },
    },
  ];

  /* The table may have numerous variables. The API call to fetch the mappings returns all mappings for the table.
The variables in the mappings need to be matched up to each variable in the table.
The function maps through the mapping array. For each variable, if the mapping variable is equal to the 
variable in the table, AND the mappings array length for the variable is > 0, the mappings array is mapped through
and returns the length of the mapping array (i.e. returns the number of variables mapped to the table variable). 
It then shows the mappings as table data and alows the user to delete a mapping from the table.*/
  const noMapping = variable => {
    return (
      <div className="no_mapping_button">
        <Button
          onClick={() =>
            setGetMappings({ name: variable.name, code: variable.code })
          }
        >
          Get Mappings
        </Button>
      </div>
    );
  };

  const matchCode = variable => {
    if (!mapping?.length) {
      return noMapping(variable);
    }

    const variableMappings = mapping.find(
      item => item?.code === variable?.code
    );

    const foundDisplay = table.variables.find(
      item => item?.code === variable?.code
    );

    if (variableMappings && variableMappings.mappings?.length) {
      return variableMappings.mappings.map((code, i) => (
        <div className="mapping" key={i}>
          <span>
            <Tooltip
              title={code.user_input?.comments_count}
              mouseEnterDelay={0.75}
            >
              <MessageOutlined
                className="mapping_actions"
                onClick={() =>
                  setComment({
                    code: code.code,
                    display: code.display,
                    variableMappings: variableMappings.code,
                    variableDisplay: foundDisplay.name,
                  })
                }
              />
            </Tooltip>
          </span>
          <span className="mapping_votes">
            {userVote(code) === 'up' ? (
              <CaretUpOutlined
                className="mapping_actions user_vote_icon"
                style={{
                  color: 'blue',
                  cursor: 'not-allowed',
                  fontSize: '1rem',
                }}
              />
            ) : (
              <UpOutlined
                className="mapping_actions"
                style={{
                  color: 'blue',
                }}
                onClick={() =>
                  userVote(code) !== 'up' &&
                  mappingVotes(
                    variableMappings,
                    code,
                    user,
                    'up',
                    vocabUrl,
                    tableId,
                    notification,
                    setMapping,
                    'Table'
                  )
                }
              />
            )}
            <Tooltip
              title={`up: ${code.user_input?.votes_count.up},
                  down: ${code.user_input?.votes_count.down}`}
              mouseEnterDelay={0.75}
            >
              <span
                className={
                  (code.user_input?.votes_count.down !== 0 ||
                    code.user_input?.votes_count.up !== 0) &&
                  votesCount(code) === 0
                    ? 'red_votes_count'
                    : 'votes_count'
                }
              >
                {votesCount(code)}
              </span>
            </Tooltip>
            {userVote(code) === 'down' ? (
              <CaretDownOutlined
                className="mapping_actions user_vote_icon"
                style={{
                  color: 'green',
                  cursor: 'not-allowed',
                  fontSize: '1rem',
                }}
              />
            ) : (
              <DownOutlined
                className="mapping_actions"
                style={{
                  color: 'green',
                }}
                onClick={() =>
                  userVote(code) !== 'down' &&
                  mappingVotes(
                    variableMappings,
                    code,
                    user,
                    'down',
                    vocabUrl,
                    tableId,
                    notification,
                    setMapping,
                    'Table'
                  )
                }
              />
            )}
          </span>
          <span className="mapping-display">
            {code?.code} - {code?.display} {relationshipDisplay(code)}
          </span>
          <span
            className="mapping_actions"
            onClick={() => handleRemoveMapping(variableMappings, code)}
          >
            <CloseCircleOutlined
              className="mapping_actions"
              style={{ color: 'red' }}
            />
          </span>
        </div>
      ));
    } else {
      return noMapping(variable);
    }
  };

  const handleRemoveMapping = (variableMappings, code) => {
    const mappingToRemove = variableMappings.mappings.indexOf(code);
    //remove mapping from mappings
    {
      mappingToRemove !== -1 &&
        variableMappings.mappings.splice(mappingToRemove, 1);
    }
    updateMappings(variableMappings?.mappings, variableMappings?.code);
  };

  const findType = variable => {
    const unit = variable?.units?.split(':')[1];
    const foundType = ucumCodes.filter(item => item.code === unit);
    return foundType.length > 0 ? foundType[0].display : variable?.units;
  };
  // data for the table columns. Each table has an array of variables. Each variable has a name, description, and data type.
  // The integer and quantity data types include additional details.
  // The enumeration data type includes a reference to a terminology, which includes further codes with the capability to match the
  // terms to ontology codes. If the data type is enumeration, there is a 'view/edit' link that takes the user to specified terminology.
  const tableData = table =>
    table?.variables?.map((variable, index) => {
      return {
        key: index,
        variable,
        code: variable.code,
        name: variable.name,
        description: variable.description,
        data_type: variable.data_type,
        min: variable.min,
        max: variable.max,
        units: findType(variable),
        enumeration: variable.data_type === 'ENUMERATION' && (
          <Link
            to={`/Study/${studyId}/DataDictionary/${DDId}/Table/${tableId}/${variable.enumerations.reference}`}
          >
            View/Edit
          </Link>
        ),
        mapped_terms: matchCode(variable),
      };
    });

  const [dataSource, setDataSource] = useState(tableData);

  // In progress. Not yet used.
  // Expandable rows for integer and quantity data types to display their additional data.
  // The additional elements include min, max, and units properties.
  const expandedRowRender = record => {
    return <ExpandedRowTable record={record} />;
  };

  return (
    <>
      {loading ? (
        // If page is loading, display loading spinner. Otherwise display code below

        <Spinner />
      ) : (
        <div className="table_id_container">
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
                    <SettingsDropdownTable table={table} />
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
            {table?.variables?.length > 0 ? (
              <>
                {' '}
                <div className="add_row_buttons">
                  <FilterSelect component={table} table={table} />
                  <AddVariable
                    table={table}
                    setTable={setTable}
                    dataSource={dataSource}
                    setDataSource={setDataSource}
                    form={form}
                  />
                </div>
                <Form form={form}>
                  <Table
                    columns={columns}
                    dataSource={dataSource}
                    expandable={{
                      expandRowByClick: 'true',
                      expandedRowRender,
                      rowExpandable: record =>
                        record.data_type === 'INTEGER' ||
                        record.data_type === 'QUANTITY',
                    }}
                    pagination={{
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '30'],
                      pageSize: pageSize, // Use the stored pageSize
                      onChange: handleTableChange, // Capture pagination changes
                    }}
                  />
                </Form>
                <ExportFile table={table} />
              </>
            ) : (
              <Row gutter={[20, 24]}>
                <Col span={6}>
                  {/* The first column is a card that opens a modal to add a new study. It sets 'addTable' to true on click
                and triggers the modal to open*/}
                  <span onClick={() => (user ? setLoad(true) : login())}>
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

      {/* Displays the edit form */}
      <EditTableDetails
        table={table}
        setTable={setTable}
        edit={edit}
        setEdit={setEdit}
      />
      <DeleteTable studyId={studyId} DDId={DDId} />
      <LoadVariables load={load} setLoad={setLoad} />
      <EditMappingsTableModal
        editMappings={editMappings}
        setEditMappings={setEditMappings}
        tableId={tableId}
        setMapping={setMapping}
        table={table}
      />
      <GetMappingsModal
        component={table}
        componentString={'Table'}
        setTable={setTable}
        searchProp={getMappings?.name}
        setGetMappings={setGetMappings}
        setMapping={setMapping}
        tableId={tableId}
        mappingProp={getMappings?.code}
        table={table}
      />
      <ClearMappings propId={tableId} component={'Table'} />

      <MappingComments
        mappingCode={comment?.code}
        mappingDisplay={comment?.display}
        variableMappings={comment?.variableMappings}
        variableDisplay={comment?.variableDisplay}
        setComment={setComment}
        idProp={tableId}
        setMapping={setMapping}
        component="Table"
      />
    </>
  );
};

// const tableApiCalls = async () => {
//   const tableData = await getById(vocabUrl, 'Table', tableId);

//   if (!tableData) {
//     navigate('/404');
//   } else {
//     setTable(tableData);

//     const [tableMappings, tableFilters, mappingRelationships] =
//       await Promise.all([
//         getById(vocabUrl, 'Table', `${tableId}/mapping`),
//         fetch(`${vocabUrl}/Table/${tableId}/filter/self`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }),
//         getById(vocabUrl, 'Terminology', 'ftd-concept-map-relationship'),
//       ]);

//     if (tableMappings) {
//       setMapping(tableMappings.codes);
//     }

//     if (tableFilters.ok) {
//       setApiPreferences(tableFilters.json());
//     } else {
//       throw new Error('An unknown error occurred.');
//     }
//     if (mappingRelationships) {
//       setRelationshipOptions(mappingRelationships.codes);
//     }
//   }
//   setLoading(false);
// };
