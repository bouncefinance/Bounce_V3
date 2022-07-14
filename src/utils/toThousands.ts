export const toThousands = (num: number): string => {
	let result = "";
	const numArr = num.toString().split(".");
	let int = numArr[0];
	const decmial = numArr[1] ? "." + numArr[1] : "";

	while (int.length > 3) {
		result = "," + int.slice(-3) + result;
		int = int.slice(0, int.length - 3);
	}

	if (int) {
		result = int + result;
	}

	return result + decmial;
};

// 有小数点则根据位数保留小数点，没有小数点则取整
export const toDecimal2NoZero = (x: number, fixNum: number) => {
	const a = Number(`1e${fixNum}`);
	const f = Math.floor(x * a) / a;
	const s = f.toString();

	return s;
};

// 大数据转换字母缩写
export const numberFormat = (val: number): string => {
	if (val >= 1e12) {
		return `${toDecimal2NoZero(val / 1e12, 4)}T`;
	} else if (val >= 1e9) {
		return `${toDecimal2NoZero(val / 1e9, 4)}B`;
	} else if (val >= 1e6) {
		return `${toDecimal2NoZero(val / 1e6, 4)}M`;
	} else if (val >= 1e3) {
		return `${toDecimal2NoZero(val / 1e3, 4)}K`;
	} else if (val === 0) {
		return "0";
	} else {
		return toDecimal2NoZero(val, 4);
	}
};
