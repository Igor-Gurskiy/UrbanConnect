import { Button, Form, Input, Checkbox } from "antd";
import type { FC } from 'react';
import type { TLogin } from './types';

export const Login: FC<TLogin> = ({email, password, remember, setEmail, setPassword, setRemember, handleSubmit, error}) => {

    const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
    return (
        <Form {...layout} style={{maxWidth: 600}} onFinish={handleSubmit} key="auth-form">
            {error && (
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <div style={{ color: 'red' }}>{error}</div>
        </Form.Item>
      )}
            <Form.Item label="Email" name="Email">
              <Input onChange={(e) => setEmail(e.target.value)} value={email}/>
            </Form.Item>
            <Form.Item label="Password" name="password">
              <Input.Password onChange={(e) => setPassword(e.target.value)} value={password}/>
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked" label={null}>
              <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>Remember me</Checkbox>
            </Form.Item>
            <Button htmlType='submit' type="default">
              Submit
            </Button>
          </Form>
    )
}