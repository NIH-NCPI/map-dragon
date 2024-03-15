import { Col, Card } from 'antd';
import './AddNewCard.scss';

export const AddNewCard = setProps => {
  return (
    <Col span={6}>
      <span onClick={() => setProps(true)}>
        <Card
          hoverable
          bordered={true}
          style={{
            border: '1px solid darkgray',
            height: '42vh',
          }}
        >
          <div className="new_study_card_container">
            <div className="new_study_card">Create New Study</div>
          </div>
        </Card>
      </span>
    </Col>
  );
};
