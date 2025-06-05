// import React from 'react';
import { Modal, Button, Form, Input, Checkbox } from "antd";
import type { FC } from 'react';
import type { TLogModal } from './types';
export const LogModal: FC<TLogModal> = ({title, onCancel, isModalOpen}) => {
    const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

    return (
        <Modal
        title={title}
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onCancel={onCancel}
        footer={[
          <Form {...layout} style={{maxWidth: 600}}>
            {title === 'Sign up' &&
            <Form.Item label="Username" name="username">
              <Input />
            </Form.Item>}
            <Form.Item label="Email" name="Email">
              <Input />
            </Form.Item>
            <Form.Item label="Password" name="password">
              <Input.Password />
            </Form.Item>
            {title === 'Log in' &&
            <Form.Item name="remember" valuePropName="checked" label={null}>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>}
            <Button key="submit" type="default">
              Submit
            </Button>
          </Form>
        ]}
      >
      </Modal>
    );
}