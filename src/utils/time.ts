const formatTime = (d: number, h: number, m: number, s: number) => `${d}d : ${h}h : ${m}m : ${s}s`;

export const getDeltaTime = (time: number, to = Date.now()) => {
	const delta = /*14*24*60*60*1000 -*/ (time - to) / 1000;

	return delta > 0 ? delta : 0;
};

export const getKeepTime = (time: number, to = Date.now()) => {
	const delta = /*14*24*60*60*1000 -*/ (to - time) / 1000;

	return delta > 0 ? delta : 0;
};

export const getIsOpen = (time: number) => {
	const nowTime = new Date();
	const openTime = new Date(time);

	return nowTime > openTime;
};

export const getIsClosed = (time: number) => {
	const nowTime = new Date();
	const closeTime = new Date(time);

	return nowTime > closeTime;
};

export const toDeltaTimer = (delta: number) => {
	const d = Math.floor(delta / (60 * 60 * 24));
	const h = Math.floor((delta / (60 * 60)) % 24);
	const m = Math.floor((delta / 60) % 60);
	const s = Math.floor(delta % 60);

	return formatTime(d, h, m, s);
};
