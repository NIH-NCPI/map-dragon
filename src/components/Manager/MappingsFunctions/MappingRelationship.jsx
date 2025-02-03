import { Select } from 'antd';
import { useContext } from 'react';
import { MappingContext } from '../../../Contexts/MappingContext';

export const MappingRelationship = ({ mapping, variable }) => {
  const { relationshipOptions, idsForSelect, setIdsForSelect } =
    useContext(MappingContext);

  const handleSelectChange = (code, value) => {
    setIdsForSelect(prev => ({
      ...prev,
      [code]: value,
    }));
  };



  console.log(mapping, 'mapping');

  const addInfo = (str) => {
    const label = mapping.display ? mapping.display : mapping.code;
    const result = (str.includes("Target") && str.includes("Source")) ? str.replace("Source", variable).replace("Target", label) : variable + ' is ' + str + ' to ' + label;
    return result;

  }

  const options = relationshipOptions.map(ro => {
    return {
      value: ro.code,
      label: addInfo(ro.display)
    };
  });


  return (
    <Select
      options={options}
      defaultValue={mapping?.mapping_relationship || undefined}
      style={{
        width: 'fit-content',
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
