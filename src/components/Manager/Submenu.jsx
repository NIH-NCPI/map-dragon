import { Col, Row } from 'antd';

export const Submenu = ({ prop }) => {
  return (
    <Row gutter={30}>
      <Col span={24}>
        <div
          className="submenu"
          style={{
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          {prop?.resource_type}
        </div>
      </Col>
    </Row>
  );
};
