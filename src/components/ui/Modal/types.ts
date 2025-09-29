// export type TLogModal = {
//     title: string,
//     onCancel: () => void,
//     isModalOpen: boolean
// }

// export type TLogModal = {
//     title: string
// }

export type TModalUI = {
	title: string;
	handleCancel: () => void;
	// open: boolean;
	children: React.ReactNode;
};
