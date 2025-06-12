import { Modal } from "antd";
import type { FC } from 'react';
import type { TLogModal } from './types';

export const LogModal: FC<TLogModal> = ({title, children, open, handleCancel}) => {

    return (
        <Modal
        title={title}
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={open}
        onCancel={handleCancel}
        footer={null}
      >
      {children}
      </Modal>
    );
}