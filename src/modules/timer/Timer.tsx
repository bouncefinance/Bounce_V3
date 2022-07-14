import React, { FC, useEffect, useState } from "react";

import { getDeltaTime, getKeepTime, toDeltaTimer } from "@app/utils/time";

export const Timer: FC<{ timer: number; onZero: () => void, model?: 'Delte' | 'Keep' }> = ({ timer, onZero, model }) => {
	const [time, setTime] = useState(model === 'Keep' ? getKeepTime(timer) : getDeltaTime(timer));

	useEffect(() => {
		const tm = setInterval(() => setTime(model === 'Keep' ? getKeepTime(timer) : getDeltaTime(timer)), 1000);

		return () => clearInterval(tm);
	}, [timer]);

	useEffect(() => {
		if (!time) {
			onZero();
		}
	}, [time]);

	return <>{toDeltaTimer(time)}</>;
};
