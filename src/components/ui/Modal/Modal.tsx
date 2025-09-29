import { Button, Modal } from 'antd';
import type { FC } from 'react';
import type { TModalUI } from './types';
import { background } from 'storybook/internal/theming';
import { CloseOutlined } from '@ant-design/icons';

export const ModalUI: FC<TModalUI> = ({
	title,
	children,
	// open,
	handleCancel,
}) => {
	return (
		<>
			<div
				className="mw-px-400"
				style={{
					position: 'fixed',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					zIndex: '9999',
					padding: '10px 20px 20px',
					backgroundColor: '#fff',
					borderRadius: '10px',
					width: '95%',
				}}
				data-cy="modal"
			>
				<div>
					<h3
						style={{ display: 'flex', alignItems: 'center', minHeight: '64px' }}
					>
						{title}
					</h3>
					<Button
						onClick={handleCancel}
						type="default"
						data-cy="modal-button"
						style={{
							position: 'absolute',
							top: '10px',
							right: '10px',
							border: 'none',
						}}
					>
						<CloseOutlined />
					</Button>
				</div>
				<div className="d-flex align-items-center justify-content-center flex-column">
					{children}
				</div>
			</div>
			<div
				style={{
					position: 'fixed',
					top: '0',
					right: '0',
					bottom: '0',
					left: '0',
					backgroundColor: 'rgba(0, 0, 0, 0.6)',
					zIndex: '9998',
				}}
				onClick={handleCancel}
				data-cy="modal-overlay"
			/>
		</>
	);
};
