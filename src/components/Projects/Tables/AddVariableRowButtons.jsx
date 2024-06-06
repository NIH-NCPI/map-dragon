import { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { CloseOutlined, CloudUploadOutlined } from '@ant-design/icons';

export const AddVariableRowButtons = ({ dataSource, setDataSource }) => {
  const [addRow, setAddRow] = useState(false);

  const handleCancel = () => {
    setAddRow(false);
    setDataSource(dataSource);
  };

  return (
    <>
      <span className="add_row_buttons">
        <Tooltip title="Cancel">
          <Button
            shape="circle"
            size="small"
            icon={<CloseOutlined />}
            className="actions_icon"
            onClick={handleCancel}
          />
        </Tooltip>
        <Tooltip title="Save">
          <Button
            shape="circle"
            size="small"
            icon={<CloudUploadOutlined />}
            className="actions_icon"
            htmlType="submit"
          />
        </Tooltip>
      </span>
    </>
  );
};
