import BN from "bn.js";

export const composeValidators = (...validators: any[]) => (value: string) =>
	validators.reduce((error, validator) => error || (validator && validator(value)), undefined);

export function isRequired<T>(value: T): string | undefined {
	return value ? undefined : "This field is required.";
}

export const isNotGreaterThan = (max: number) => (value: string): string | undefined => {
	return +value > max ? "You have exceeded the limit." : undefined;
};

export const isEqualZero = (value: string): string | undefined => {
	return +value === 0 ? "Should be a more than 0" : undefined;
};

export const isNotLongerThan = (max: number) => (value: string): string | undefined => {
	return value && value.length > max ? `Keep it below ${max} characters` : undefined;
};

export function isValidEmail(value: string): string | undefined {
	return /\S+@\S+\.\S+/.test(value) ? undefined : "Invalid email address.";
}

export function isValidUsername(value: string): string | undefined {
	return value.startsWith("@") ? undefined : "Start your input with @";
}

export function isDecimalNumber(value: string): string | undefined {
	return value.match(/[^\d^.]/) ? "Should be a number" : undefined;
}

export function isValidWei(value: string): string | undefined {
	return value && value.split(".")[1]?.length > 6
		? "Should be no more than 6 digits after point"
		: undefined;
}

export const isEnoughBalance = (balance: number) => (value: string): string | undefined => {
	return +value > +balance ? `You don’t have enough balance` : undefined;
};

export function isDateRequired(date: Date): string | undefined {
	if (!date) {
		return isRequired(null);
	}

	if (date.getSeconds() === 30) {
		return "Missing hours and minutes";
	}

	return undefined;
}

export function isFromToTokensDifferent<T>(fromToken: T, toToken: T): string | undefined {
	return fromToken !== toToken ? undefined : "Please select different tokens.";
}

export const isThanGreateAddrss = (address1: string, address2: string) => {
	const num1 = new BN(parseInt(address1.substring(0, 8), 16));
	const num2 = new BN(parseInt(address2.substring(0, 8), 16));

	return num1.sub(num2).gt(new BN(0));
};
