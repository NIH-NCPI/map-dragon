import { Select } from 'antd';
import { useContext } from 'react';
import { MappingContext } from '../../../Contexts/MappingContext';

export const MappingRelationship = ({ mapping }) => {
  const { relationshipOptions, idsForSelect, setIdsForSelect } =
    useContext(MappingContext);

  const handleSelectChange = (obo_id, value) => {
    setIdsForSelect(prev => ({
      ...prev,
      [obo_id]: value,
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
      style={{
        width: 120,
      }}
      placeholder="Mapping Quality"
      popupMatchSelectWidth={false}
      allowClear
      value={idsForSelect[mapping.obo_id]}
      onChange={value => handleSelectChange(mapping.obo_id, value)}
    />
  );
};
