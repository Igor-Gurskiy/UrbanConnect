import { type FC, memo } from 'react';
import { LogModal } from '../ui/Modal/LogModal';
import { useNavigate } from 'react-router-dom';
import type { TModal } from './types';

export const Modal: FC<TModal> = memo(({ type, children }) => {
	const navigate = useNavigate();
	const handleCancel = () => navigate(-1);

	return (
		<LogModal title={type} handleCancel={handleCancel} open={true}>
			{children}
		</LogModal>
	);
});
