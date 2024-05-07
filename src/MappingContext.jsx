import { createContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

export const MappingContext = createContext();

export function MappingContextRoot() {
  const [editMappings, setEditMappings] = useState(false); //triggers modal to open to edit mappings
  const [getMappings, setGetMappings] = useState(false); //triggers modal to open to search to get new mappings
  const [mapping, setMapping] = useState({}); // mapped terms for an individual terminologys

  const context = {
    editMappings,
    setEditMappings,
    getMappings,
    setGetMappings,
    mapping,
    setMapping,
  };

  return (
    <MappingContext.Provider value={context}>
      <Outlet />
    </MappingContext.Provider>
  );
}
