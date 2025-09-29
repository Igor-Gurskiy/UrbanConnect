import { type FC, memo, useEffect } from 'react';
import { ModalUI } from '../ui/Modal/Modal';
import type { TModal } from './types';
import ReactDOM from 'react-dom';

const modalRoot = document.getElementById('modals');

export const Modal: FC<TModal> = memo(({ type, handleCancel, children }) => {
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			e.key === 'Escape' && handleCancel();
		};

		document.addEventListener('keydown', handleEsc);
		return () => {
			document.removeEventListener('keydown', handleEsc);
		};
	}, [handleCancel]);

	return ReactDOM.createPortal(
		<ModalUI title={type} handleCancel={handleCancel}>
			{children}
		</ModalUI>,
		modalRoot as HTMLDivElement
	);
});
