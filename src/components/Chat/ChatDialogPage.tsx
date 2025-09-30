import { Button } from 'antd';
import { useEffect, type FC } from 'react';
import { ChatDialog } from './ChatDialog';
import { useDispatch, useSelector } from '../../services/store';
import {
	clearOpenChat,
	getChatById,
	selectIsLoading,
	selectOpenChat,
} from '../../services/slices/Chat/Chat';
import {
	useNavigate,
	useOutletContext,
	useParams,
} from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Loader } from '../Loader/Loader';

export const ChatDialogPage: FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { headerHeight } = useOutletContext<{ headerHeight: string }>();
	const openChat = useSelector(selectOpenChat);
	const isLoading = useSelector(selectIsLoading);

	useEffect(() => {
		if (id && !openChat) {
			dispatch(getChatById(id));
		}
	}, [id, openChat, dispatch]);

	const handleBackClick = () => {
		navigate('/chat');
		dispatch(clearOpenChat());
	};

	if (!openChat) {
		return <div>Чат не найден</div>;
	}
	if (isLoading) {
		return <Loader />;
	}
	return (
		<div
			className="w-100 mw-px-400"
			style={{
				height: `calc(100vh - ${headerHeight}px)`,
				display: 'grid',
				gridTemplateRows: 'auto 1fr',
			}}
		>
			<div className="m-2">
				<Button
					type="default"
					onClick={handleBackClick}
					icon={<ArrowLeftOutlined />}
				>
					Назад
				</Button>
			</div>
			<ChatDialog chat={openChat} />
		</div>
	);
};
