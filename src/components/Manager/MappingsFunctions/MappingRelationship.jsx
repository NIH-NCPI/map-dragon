import { Select } from 'antd';
import { useContext } from 'react';
import { MappingContext } from '../../../Contexts/MappingContext';

export const MappingRelationship = ({ mapping }) => {
  const { relationshipOptions, idsForSelect, setIdsForSelect } =
    useContext(MappingContext);

  const handleSelectChange = (code, value) => {
    setIdsForSelect(prev => ({
      ...prev,
      [code]: value,
    }));
  };

  const options = relationshipOptions.map(ro => {
    return {
      value: ro.code,
      label: ro.display,
    };
  });

  return (
    <Select
      options={options}
      defaultValue={mapping?.mapping_relationship || undefined}
      style={{
        width: 120,
      }}
      placeholder="Relationship"
      popupMatchSelectWidth={false}
      allowClear
      value={idsForSelect[mapping.code || mapping.code]}
      onChange={value =>
        handleSelectChange(mapping.code || mapping.code, value)
      }
      onClick={e => e.preventDefault()}
    />
  );
};
