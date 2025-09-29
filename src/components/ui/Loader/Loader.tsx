import React from 'react';

export const LoaderUI: React.FC = () => {
	return (
		<div className="d-flex flex-column justify-content-center align-items-center">
			{/* Spinner от Bootstrap */}
			<div
				className="spinner-border text-primary"
				role="status"
				style={{ width: '4rem', height: '4rem' }}
			>
				<span className="visually-hidden">Загрузка...</span>
			</div>
			{/* Текст с анимацией появления */}
			<p className="mt-3 text-muted fst-italic fade-in">
				Что-то загружается...
			</p>
		</div>
	);
};
