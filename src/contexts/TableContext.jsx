import { createContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

export const TableContext = createContext();

export function TableContextRoot() {
  const [dataSource, setDataSource] = useState({});
  const [addRow, setAddRow] = useState(false);
  const [type, setType] = useState('');
  const context = {};

  return (
    <TableContext.Provider value={context}>
      <Outlet />
    </TableContext.Provider>
  );
}
