import { Checkbox, Modal, Form, Button } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import { ModalSpinner } from '../../Manager/Spinner';
import { MappingSearch } from './MappingSearch';
import { handleDelete } from '../../Manager/FetchManager';

export const EditMappingsModal = ({
  editMappings,
  setEditMappings,
  terminologyId,
  setMapping,
  mapping,
}) => {
  const [form] = Form.useForm();
  const [termMappings, setTermMappings] = useState([]);
  const [options, setOptions] = useState([]);
  const { vocabUrl, terminology } = useContext(myContext);
  const [loading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [mappingsForSearch, setMappingsForSearch] = useState([]);

  useEffect(() => {
    fetchMappings();
  }, [editMappings, mapping]);

  const clearData = () => {
    setTermMappings([]);
    setOptions([]);
  };

  const fetchMappings = () => {
    if (editMappings) {
      setLoading(true);
      return fetch(
        `${vocabUrl}/Terminology/${terminologyId}/mapping/${editMappings.code}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('An unknown error occurred.');
          }
        })
        .then(data => {
          if (data.mappings.length < 1) {
            return undefined;
          }
          const mappings = [];
          const options = [];

          data.mappings.forEach((m, index) => {
            const val = JSON.stringify({
              code: m.code,
              display: m.display,
              // description: d.description[0],
              system: m?.system,
            });
            mappings.push(val);
            options.push({ value: val, label: editMappingsLabel(m, index) });
          });
          setMappingsForSearch(data.mappings);
          setTermMappings(mappings);
          setOptions(options);
        })
        .then(() => setLoading(false));
    }
  };

  // console.log('mappingsForSearch', mappingsForSearch);

  const updateMappings = values => {
    const mappingsDTO = () => {
      let mappings = [];
      values?.mappings?.forEach(v => mappings.push(JSON.parse(v)));
      return { mappings: mappings };
    };
    fetch(
      `${vocabUrl}/Terminology/${terminologyId}/mapping/${editMappings.code}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingsDTO()),
      },
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(data => setMapping(data.codes));
  };

  const handleDelete = evt => {
    return fetch(
      `${vocabUrl}/Terminology/${terminologyId}/mapping/${editMappings.code}`,
      {
        method: 'DELETE',
      },
    )
      .then(response => response.json())
      .then(() => {
        return fetch(`${vocabUrl}/Terminology/${terminologyId}/mapping`);
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('An unknown error occurred.');
        }
      })
      .then(() => setReset(true));
  };

  // console.log('MAPPINGS', termMappings);
  // console.log('options', options);

  const editMappingsLabel = (item, index) => {
    return (
      <>
        <div key={index} className="modal_search_result">
          <div>
            <div className="modal_term_ontology">
              <div>
                <b>{item?.display}</b>
              </div>
              <div>
                {/* <a href={item.iri} target="_blank"> */}
                {item?.code}
                {/* </a> */}
              </div>
            </div>
            {/* <div>{ellipsisString(item?.description[0], '100')}</div> */}
          </div>
        </div>
      </>
    );
  };

  return (
    <Modal
      open={!!editMappings}
      width={'51%'}
      styles={{ body: { height: '60vh', overflowY: 'auto' } }}
      okText="Save"
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            console.log('VALUEUUEUS', values);
            updateMappings(values);
            clearData();
            form.resetFields();
            setEditMappings(null);
            setReset(false);
          })
          .then(data => setMapping(data));
      }}
      onCancel={() => {
        clearData();
        form.resetFields();
        setEditMappings(null);
        setReset(false);
      }}
      maskClosable={true}
      destroyOnClose={true}
      footer={(_, { OkBtn /*CancelBtn*/ }) => (
        <>
          <div className="footer_buttons">
            <Button
              danger
              onClick={evt => {
                // setReset(true);
                handleDelete(evt);
              }}
            >
              Reset
            </Button>
            {/* <CancelBtn /> */}
            <OkBtn />
          </div>
        </>
      )}
    >
      {loading ? (
        <ModalSpinner />
      ) : !reset ? (
        <>
          <div className="modal_search_results_header">
            <h3>Mappings for: {editMappings?.code}</h3>
          </div>
          <Form form={form} layout="vertical" preserve={false}>
            <Form.Item
              name={['mappings']}
              valuePropName="value"
              // rules={[{ required: true, message: 'Please make a selection.' }]}
              initialValue={termMappings}
            >
              <Checkbox.Group className="mappings_checkbox" options={options} />
            </Form.Item>
          </Form>
        </>
      ) : (
        <MappingSearch
          terminologyId={terminologyId}
          editMappings={editMappings}
          setEditMappings={setEditMappings}
          setMapping={setMapping}
          mappingsForSearch={mappingsForSearch}
          options={options}
          form={form}
        />
      )}
    </Modal>
  );
};
