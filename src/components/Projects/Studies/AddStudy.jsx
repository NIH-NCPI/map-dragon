import { React, useContext, useEffect, useState } from 'react';
import { myContext } from '../../../App';
import './StudyStyling.scss';
import { getAll } from '../../Manager/FetchManager';
import { Form, Input, Select } from 'antd';

export const AddStudy = ({ form }) => {
  const { vocabUrl, studyDDs, setStudyDDs } = useContext(myContext);

  const getStudyDD = () => {
    getAll(vocabUrl, 'DataDictionary').then(data => setStudyDDs(data));
  };

  useEffect(() => {
    getStudyDD();
  }, []);

  return (
    <Form form={form} layout="vertical" name="form_in_modal">
      <h2>Create Study</h2>
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please input Study name.' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: false }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="title" label="Title" rules={[{ required: false }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="identifier_prefix"
        label="Identifier Prefix"
        rules={[
          {
            required: true,
            message: 'Please input Study identifier prefix.',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="url"
        label="URL"
        rules={[{ required: true, message: 'Please input Study URL.' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name={['datadictionary']}
        label="Data Dictionary"
        rules={[
          {
            required: true,
            message: 'Please select at least 1 Data Dictionary.',
          },
        ]}
      >
        <Select
          mode="multiple"
          allowClear
          placeholder="Select Table"
          style={{ width: '50%' }}
          options={studyDDs.map(dd => {
            return {
              value: dd.id,
              label: dd.name,
            };
          })}
        />
      </Form.Item>
    </Form>
  );
};
