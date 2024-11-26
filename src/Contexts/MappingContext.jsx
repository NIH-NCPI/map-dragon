import { createContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

export const MappingContext = createContext();

export function MappingContextRoot() {
  const [editMappings, setEditMappings] = useState(false); //triggers modal to open to edit mappings
  const [getMappings, setGetMappings] = useState(false); //triggers modal to open to search to get new mappings
  const [assignMappings, setAssignMappings] = useState(false);
  const [mapping, setMapping] = useState({}); // mapped terms for an individual terminologys
  const [existingMappings, setExistingMappings] = useState([]);
  const [filteredMappings, setFilteredMappings] = useState([]);
  const [selectedMappings, setSelectedMappings] = useState([]);
  const [displaySelectedMappings, setDisplaySelectedMappings] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [relationshipOptions, setRelationshipOptions] = useState([]);
  const [idsForSelect, setIdsForSelect] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  const context = {
    editMappings,
    setEditMappings,
    getMappings,
    setGetMappings,
    mapping,
    setMapping,
    existingMappings,
    setExistingMappings,
    filteredMappings,
    setFilteredMappings,
    selectedMappings,
    setSelectedMappings,
    displaySelectedMappings,
    setDisplaySelectedMappings,
    selectedBoxes,
    setSelectedBoxes,
    assignMappings,
    setAssignMappings,
    relationshipOptions,
    setRelationshipOptions,
    idsForSelect,
    setIdsForSelect,
    showOptions,
    setShowOptions,
  };

  return (
    <MappingContext.Provider value={context}>
      <Outlet />
    </MappingContext.Provider>
  );
}
