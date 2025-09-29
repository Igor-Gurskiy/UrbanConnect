import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const HomePage = () => {
	return (
		<div className="d-flex flex-column justify-content-center align-items-center p-4">
			<Title level={1}>UrbanConnect</Title>

			<Paragraph className="text-center fs-5">
				Место для общения с соседями в вашем районе
			</Paragraph>

			<Paragraph type="secondary">Пет-проект</Paragraph>
		</div>
	);
};
