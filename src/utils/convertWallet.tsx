export const walletConversion = (wallet: string): string => {
	if (!wallet || wallet.length <= 12) {
		return wallet;
	}

	const newWallet = wallet.split("");
	const firstPart = newWallet.slice(0, 6).join("");
	const lastPart = newWallet.slice(newWallet.length - 4, newWallet.length).join("");

	return firstPart + "..." + lastPart;
};
