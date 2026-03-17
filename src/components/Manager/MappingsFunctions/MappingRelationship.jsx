import { Select } from 'antd';
import { useContext } from 'react';
import { MappingContext } from '../../../Contexts/MappingContext';
import { ellipsisString } from '../Utility';

export const MappingRelationship = ({ mapping, variable, editSearch }) => {
  const { relationshipOptions, idsForSelect, setIdsForSelect } =
    useContext(MappingContext);

  const handleSelectChange = (code, value) => {
    setIdsForSelect(prev => ({
      ...prev,
      [code]: value
    }));
  };

  const addInfo = str => {
    const label = mapping.display ? mapping.display : mapping.code;
    //The MappingSearch window is narrower, so the character count is lower if editSearch is true
    //The count is higher for 'label' in the EditMappingsModal and in the middle for GetMappingsModal
    const totalChars =
      editSearch === true ? 64 : editSearch === 'label' ? 100 : 84;
    //Ensures both variable and mapping are truncated appropriately. If one half of the equation is less than half the totalChars
    // number, it is not truncated and the mapping is truncated at the remaining balance of totalChars
    const half = Math.floor(totalChars / 2);
    let varCount, labelCount;
    if (variable.length <= half) {
      varCount = variable.length;
      labelCount = totalChars - varCount;
    } else if (label.length <= half) {
      labelCount = label.length;
      varCount = totalChars - labelCount;
    } else {
      varCount = half + (totalChars % 2);
      labelCount = half;
    }

    const result =
      str.includes('Target') && str.includes('Source')
        ? str
            .replace('Source', ellipsisString(variable, varCount))
            .replace('Target', ellipsisString(label, labelCount))
        : ellipsisString(variable, varCount) +
          ' is ' +
          str +
          ' to ' +
          ellipsisString(label, labelCount);
    return result;
  };

  const titleHover = str => {
    const label = mapping.display ? mapping.display : mapping.code;

    const result =
      str.includes('Target') && str.includes('Source')
        ? str.replace('Source', variable).replace('Target', label)
        : variable + ' is ' + str + ' to ' + label;
    return variable?.length + label?.length > 84 && result;
  };

  const options = relationshipOptions.map(ro => {
    return {
      value: ro.code,
      label: addInfo(ro.display),
      title: titleHover(ro.display)
    };
  });

  return (
    <Select
      options={options}
      defaultValue={mapping?.mapping_relationship || undefined}
      style={{
        width: 'fit-content'
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
