// hooks/useWindowSize.ts
import { useState, useEffect } from 'react';

interface WindowSize {
	width: number;
	height: number;
}

interface UseWindowSizeOptions {
	debounceDelay?: number;
}

export const useWindowSize = (
	options: UseWindowSizeOptions = {}
): WindowSize => {
	const { debounceDelay = 10 } = options;
	const [windowSize, setWindowSize] = useState<WindowSize>({
		width: typeof window !== 'undefined' ? window.innerWidth : 0,
		height: typeof window !== 'undefined' ? window.innerHeight : 0,
	});

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		let timeoutId: NodeJS.Timeout;

		const handleResize = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				setWindowSize({
					width: window.innerWidth,
					height: window.innerHeight,
				});
			}, debounceDelay);
		};

		const handleResizeImmediate = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		handleResizeImmediate();

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			clearTimeout(timeoutId);
		};
	}, [debounceDelay]);

	return windowSize;
};
