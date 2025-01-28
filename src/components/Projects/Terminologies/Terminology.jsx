import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { myContext } from '../../../App';
import './Terminology.scss';
import { Spinner } from '../../Manager/Spinner';
import { getById } from '../../Manager/FetchManager';
import {
  Button,
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
import { EditMappingsModal } from './EditMappingModal';
import { EditTerminologyDetails } from './EditTerminologyDetails';
import { SettingsDropdownTerminology } from '../../Manager/Dropdown/SettingsDropdownTerminology';
import { ClearMappings } from '../../Manager/MappingsFunctions/ClearMappings';
import { AddCode } from './AddCode';
import { MappingContext } from '../../../Contexts/MappingContext';
import { GetMappingsModal } from '../../Manager/MappingsFunctions/GetMappingsModal';
import { TerminologyMenu } from './TerminologyMenu';
import { LoadCodes } from './LoadCodes';
import { PreferredTerminology } from './PreferredTerminology';
import { SearchContext } from '../../../Contexts/SearchContext';
import { FilterSelect } from '../../Manager/MappingsFunctions/FilterSelect';
import { AssignMappingsViaButton } from './AssignMappingsViaButton';
import { relationshipDisplay, uriEncoded } from '../../Manager/Utility';
import { mappingVotes } from '../../Manager/MappingsFunctions/MappingVotes';
import { MappingComments } from '../../Manager/MappingsFunctions/MappingComments';

export const Terminology = () => {
  const [form] = Form.useForm();

  const { terminologyId, tableId } = useParams();
  const { vocabUrl, user } = useContext(myContext);
  const { setPrefTerminologies, prefTerminologies, setApiPreferencesTerm } =
    useContext(SearchContext);
  const {
    editMappings,
    setEditMappings,
    getMappings,
    setGetMappings,
    mapping,
    setMapping,
    setRelationshipOptions,
    comment,
    setComment,
  } = useContext(MappingContext);

  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem('pageSize'), 10) || 10
  );
  const [assignMappingsViaButton, setAssignMappingsViaButton] = useState(false);
  const handleTableChange = (current, size) => {
    setPageSize(size);
  };

  useEffect(() => {
    document.title = 'Terminology - Map Dragon';
  }, []);

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
    const mappingsDTO = {
      mappings: mapArr,
      editor: user?.email,
    };

    fetch(
      `${vocabUrl}/Terminology/${terminologyId}/mapping/${uriEncoded(
        mappingCode
      )}?user_input=true&user=${user?.email}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingsDTO),
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
        setMapping(data.codes);
        setEditMappings(null);
        form.resetFields();
        message.success('Mapping removed.');
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
      });
  };

  /* The terminology may have numerous codes. The API call to fetch the mappings returns all mappings for the terminology.
The codes in the mappings need to be matched up to each code in the terminology.
The function maps through the mapping array. For each code, if the mapping code is equal to the 
code in the terminology, AND the mappings array length for the code is > 0, the mappings array is mapped through
and returns the length of the mapping array (i.e. returns the number of codes mapped to the terminology code). 
It then shows the mappings as table data and alows the user to delete a mapping from the table.*/

  const noMapping = variable => (
    <div className="no_mapping_button">
      <Button
        onClick={() => {
          prefTerminologies.length > 0
            ? setAssignMappingsViaButton({
                display: variable.display,
                code: variable.code,
              })
            : setGetMappings({
                display: variable.display,
                code: variable.code,
              });
        }}
      >
        {prefTerminologies?.length > 0 ? 'Assign Mappings' : 'Get Mappings'}
      </Button>
    </div>
  );

  const votesCount = code => {
    const calculatedCount =
      code.user_input?.votes_count.up - code.user_input?.votes_count.down;
    return calculatedCount;
  };

  const userVote = code => {
    const foundVote = code.user_input?.users_vote;
    return foundVote;
  };

  const matchCode = variable => {
    if (!mapping?.length) {
      return noMapping(variable);
    }

    const variableMappings = mapping.find(
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
                    terminologyId,
                    notification,
                    setMapping
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
                    terminologyId,
                    notification,
                    setMapping
                  )
                }
              />
            )}
          </span>
          <span className="mapping-display">
            {code?.code} {code?.display && `- ${code?.display}`}{' '}
            {relationshipDisplay(code)}
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
  }, [terminology, mapping, prefTerminologies]);

  // Fetches the terminology using the terminologyId param and sets 'terminology' to the response.
  // Fetches the mappings for the terminology and sets the response to 'mapping'
  // Sets loading to false
  useEffect(() => {
    termApiCalls();
  }, []);

  // If the tableId param exists (i.e. terminology is accessed via a table), fetches the table's ontology filters to inherit in the terminology
  // If the tableId param is undefined (i.e. terminology accessed from terminology index page), does not inherit a table's ontology filters
  const optionalTableParam =
    tableId !== undefined ? `?table_id=${tableId}` : '';

  const termApiCalls = async () => {
    setLoading(true);
    try {
      const terminologyData = await getById(
        vocabUrl,
        'Terminology',
        terminologyId,
        navigate
      );
      setTerminology(terminologyData);

      if (terminologyData) {
        const filterResponse = await fetch(
          `${vocabUrl}/Terminology/${terminologyData?.id}/filter${optionalTableParam}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!filterResponse.ok) {
          throw new Error('An unknown error occurred.');
        }

        const filterData = await filterResponse.json();
        setApiPreferencesTerm(filterData);

        const mappingsData = await getById(
          vocabUrl,
          'Terminology',
          `${terminologyId}/mapping?user_input=True&user=${user?.email}`
        );
        setMapping(mappingsData.codes);

        const relationshipData = await getById(
          vocabUrl,
          'Terminology',
          'ftd-concept-map-relationship'
        );
        setRelationshipOptions(relationshipData.codes);

        const prefTerminologyData = await getById(
          vocabUrl,
          'Terminology',
          `${terminologyId}/preferred_terminology`
        );
        setPrefTerminologies(prefTerminologyData?.references);
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message || 'An error occurred loading data.',
      });
    } finally {
      setLoading(false);
    }
  };

  // columns for the ant.design table
  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      width: 100,
    },
    {
      title: 'Display',
      dataIndex: 'display',
      width: 100,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 200,
    },
    { title: 'Mapped Terms', dataIndex: 'mapped_terms', width: 350 },
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
          <AssignMappingsViaButton
            assignMappingsViaButton={assignMappingsViaButton}
            setAssignMappingsViaButton={setAssignMappingsViaButton}
            terminology={terminology}
          />

          <MappingComments
            mappingCode={comment?.code}
            mappingDisplay={comment?.display}
            variableMappings={comment?.variableMappings}
            setComment={setComment}
            idProp={terminologyId}
            setMapping={setMapping}
          />
        </div>
      )}
    </>
  );
};
