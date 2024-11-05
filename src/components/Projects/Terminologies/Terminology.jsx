import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { myContext } from '../../../App';
import './Terminology.scss';
import { Spinner } from '../../Manager/Spinner';
import { getById } from '../../Manager/FetchManager';
import { Button, Col, Form, notification, Row, Table, Tooltip } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { EditMappingsModal } from './EditMappingModal';
import { EditTerminologyDetails } from './EditTerminologyDetails';
import { SettingsDropdownTerminology } from '../../Manager/Dropdown/SettingsDropdownTerminology';
import { ClearMappings } from '../../Manager/MappingsFunctions/ClearMappings';
import { AddCode } from './AddCode';
import { MappingContext } from '../../../Contexts/MappingContext';
import { GetMappingsModal } from '../../Manager/MappingsFunctions/GetMappingsModal';
import { TerminologyMenu } from './TerminologyMenu';
import { Submenu } from '../../Manager/Submenu';
import { LoadCodes } from './LoadCodes';
import { PreferredTerminology } from './PreferredTerminology';
import { SearchContext } from '../../../Contexts/SearchContext';
import { FilterSelect } from '../../Manager/MappingsFunctions/FilterSelect';
import { cleanedName } from '../../Manager/Utilitiy';

export const Terminology = () => {
  const [form] = Form.useForm();

  const { terminologyId, tableId } = useParams();
  const { vocabUrl, user } = useContext(myContext);
  const {
    setPrefTerminologies,
    prefTerminologies,
    setApiPreferencesTerm,
    apiPreferencesTerm,
  } = useContext(SearchContext);
  const {
    editMappings,
    setEditMappings,
    getMappings,
    setGetMappings,
    mapping,
    setMapping,
  } = useContext(MappingContext);

  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem('pageSize'), 10) || 10
  );
  const handleTableChange = (current, size) => {
    setPageSize(size);
  };
  useEffect(() => {
    localStorage.setItem('pageSize', pageSize);
  }, [pageSize]);

  useEffect(
    () => () => {
      setApiPreferencesTerm(undefined);
    },
    []
  );

  const [loading, setLoading] = useState(true);
  const initialTerminology = { url: '', description: '', name: '', codes: [] }; //initial state of terminology
  const [terminology, setTerminology] = useState(initialTerminology);
  const navigate = useNavigate();

  const updateMappings = (mapArr, mappingCode) => {
    // setLoading(true);
    const mappingsDTO = {
      mappings: mapArr,
      editor: user.email,
    };

    fetch(`${vocabUrl}/Terminology/${terminologyId}/mapping/${mappingCode}`, {
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
        notification.success({ description: 'Mapping removed.' });
      })
      .catch(error => {
        console.log(error, 'error');

        if (error) {
          console.log(error, 'error');

          notification.error({
            message: 'Error',
            description: 'An error occurred. Please try again.',
          });
        }
        return error;
      })
      .finally(() => setLoading(false));
  };

  /* The terminology may have numerous codes. The API call to fetch the mappings returns all mappings for the terminology.
The codes in the mappings need to be matched up to each code in the terminology.
The function maps through the mapping array. For each code, if the mapping code is equal to the 
code in the terminology, AND the mappings array length for the code is > 0, the mappings array is mapped through
and returns the length of the mapping array (i.e. returns the number of codes mapped to the terminology code). 
It then shows the mappings as table data and alows the user to delete a mapping from the table.*/

  const noMapping = variable => {
    return (
      <Button
        onClick={() =>
          setGetMappings({ name: variable.name, code: variable.code })
        }
      >
        Get Mappings
      </Button>
    );
  };

  const matchCode = variable => {
    if (!mapping?.length) {
      return noMapping(variable);
    }

    const variableMappings = mapping.find(
      item => item?.code === variable?.code
    );

    if (variableMappings && variableMappings.mappings?.length) {
      return variableMappings.mappings.map(code => (
        <div className="mapping" key={code.display}>
          <span className="mapping-display">
            <Tooltip title={code.code}>{code.display}</Tooltip>
          </span>
          <span
            className="remove-mapping"
            onClick={() => handleRemoveMapping(variableMappings, code)}
          >
            <CloseCircleOutlined style={{ color: 'red' }} />
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

  // data for each column in the table.
  // Map through the codes in the terminology and display the code, display, number of mapped terms,
  // and an edit or get mappings button depending on the condition.
  const tableData = terminology =>
    terminology?.codes?.map((item, index) => {
      return {
        key: index,
        item,
        code: item.code,
        display: item.display,
        description: item.description,
        mapped_terms: matchCode(item),
      };
    });

  const [dataSource, setDataSource] = useState(tableData);

  useEffect(() => {
    setDataSource(tableData(terminology));
  }, [terminology, mapping]);

  // Fetches the terminology using the terminologyId param and sets 'terminology' to the response.
  // Fetches the mappings for the terminology and sets the response to 'mapping'
  // Sets loading to false
  useEffect(() => {
    setLoading(true);
    getById(vocabUrl, 'Terminology', terminologyId, navigate)
      .then(data => {
        if (data === null) {
          navigate('/404');
        } else {
          setTerminology(data);
          if (data) {
            cleanedName(data?.name);
            fetch(
              `${vocabUrl}/Terminology/${data?.id}/filter/${cleanedName(
                data?.name
              )}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            )
              .then(res => {
                if (res.ok) {
                  return res.json();
                } else {
                  throw new Error('An unknown error occurred.');
                }
              })
              .then(data => {
                setApiPreferencesTerm(data);
              });
            getById(vocabUrl, 'Terminology', `${terminologyId}/mapping`)
              .then(data => setMapping(data.codes))
              .catch(error => {
                if (error) {
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
                  `${terminologyId}/preferred_terminology`
                )
                  .then(data => setPrefTerminologies(data?.references))
                  .catch(error => {
                    if (error) {
                      notification.error({
                        message: 'Error',
                        description:
                          'An error occurred loading preferred terminologies.',
                      });
                    }
                    return error;
                  })
              );
          } else {
            setLoading(false);
          }
        }
      })
      .catch(error => {
        if (error) {
          notification.error({
            message: 'Error',
            description:
              'An error occurred loading the the ontology preferences.',
          });
        }
        return error;
      })

      .finally(() => setLoading(false));
  }, []);

  // columns for the ant.design table
  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      width: 180,
    },
    {
      title: 'Display',
      dataIndex: 'display',
      width: 180,
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    { title: 'Mapped Terms', dataIndex: 'mapped_terms', width: 90 },
    {
      title: '',
      dataIndex: 'delete_column',
      width: 10,
      render: (_, tableData) => {
        return (
          <>
            {tableData.key !== 'newRow' && (
              // If the tableData key is not "newRow" (i.e. it is not a newly added input field to add a new row)
              // The code and delete buttons are displayed with edit/delete functionality
              <>
                <TerminologyMenu
                  terminology={terminology}
                  setTerminology={setTerminology}
                  tableData={tableData}
                  form={form}
                  loading={loading}
                  setLoading={setLoading}
                  setEditMappings={setEditMappings}
                  setGetMappings={setGetMappings}
                  mapping={mapping}
                  prefTerminologies={prefTerminologies}
                />
              </>
            )}
          </>
        );
      },
    },
  ];

  return (
    <>
      {/* If page is still loading, display loading spinner. */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="terminology_container">
          <Submenu prop={terminology} />
          <Row gutter={30}>
            <div className="study_details_container">
              <Col span={15}>
                <div className="study_details">
                  <div className="study_name">
                    {/* Displays table name if there is one. If no name, displays DD id */}

                    <h2>
                      {terminology?.name ? terminology?.name : terminology?.id}
                    </h2>
                  </div>
                  <div className="terminology_url">{terminology?.url}</div>

                  <div className="terminology_desc">
                    {/* Displays the DD description if there is one.
                    If there is no description, 'No description provided' is displayed in a gray font */}
                    {terminology?.description ? (
                      terminology?.description
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
                    <SettingsDropdownTerminology codes={terminology.codes} />
                  </div>
                </div>
              </Col>
            </div>
          </Row>
          <div className="table_container">
            <div className="add_row_buttons">
              <FilterSelect component={terminology} terminology={terminology} />

              <PreferredTerminology
                terminology={terminology}
                setTerminology={setTerminology}
              />
              <AddCode
                terminology={terminology}
                setTerminology={setTerminology}
              />
            </div>
            {/* ant.design table with columns */}
            {loading ? (
              <Spinner />
            ) : (
              <Form form={form}>
                <Table
                  columns={columns}
                  dataSource={dataSource}
                  pagination={{
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '30'],
                    pageSize: pageSize, // Use the stored pageSize
                    onChange: handleTableChange, // Capture pagination changes
                  }}
                />
              </Form>
            )}
          </div>
          {/* The modals to edit and get mappings with data being passed. */}
          <EditMappingsModal
            editMappings={editMappings}
            setEditMappings={setEditMappings}
            terminologyId={terminologyId}
            setMapping={setMapping}
            mappingDesc={
              editMappings?.description
                ? editMappings?.description
                : 'No Description'
            }
            terminology={terminology}
          />
          <GetMappingsModal
            componentString={'Terminology'}
            component={terminology}
            terminology={terminology}
            setTerminology={setTerminology}
            searchProp={
              getMappings?.display ? getMappings.display : getMappings?.code
            }
            setGetMappings={setGetMappings}
            setMapping={setMapping}
            terminologyId={terminologyId}
            mappingProp={getMappings?.code}
            mappingDesc={
              getMappings?.description
                ? getMappings?.description
                : 'No Description'
            }
          />

          {/* Displays the edit form */}
          <EditTerminologyDetails
            form={form}
            terminology={terminology}
            setTerminology={setTerminology}
          />
          <ClearMappings propId={terminologyId} component={'Terminology'} />
          <LoadCodes
            terminology={terminology}
            setTerminology={setTerminology}
          />
        </div>
      )}
    </>
  );
};
