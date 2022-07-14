import BigNumber from "bignumber.js";

import type { Contract as ContractType } from "web3-eth-contract";

export class LBPPairData {
	pairContract: ContractType;
	vaultContract: ContractType;
	poolId_address: string;
	poolId_byte32: string;

	tokens: string[];
	tokensWeight: string[];
	tokensAmount: string[];

	constructor(pairContract: ContractType, vaultContract: ContractType, pairAddress: string) {
		this.poolId_address = pairAddress;
		this.pairContract = pairContract;
		this.vaultContract = vaultContract;
		this.updateTimer();
		this.getPoolIdByte32();
	}

	updateTimer() {
		return;
	}

	async getPoolIdByte32() {
		try {
			return this.poolId_byte32 || ((await this.pairContract.methods.getPoolId().call()) as string);
		} catch (err) {
			return Promise.reject(`getPoolIdByte32 error: ${err}`);
		}
	}

	async getTokensWeight() {
		const weights = (await this.pairContract.methods.getNormalizedWeights().call()) as string[];
		this.tokensWeight = weights;

		return weights;
	}

	async getTokensAmount() {
		const result = await this.getPoolTokens();

		return result.balances;
	}

	async getPoolTokens() {
		try {
			const poolId_byte32 = await this.getPoolIdByte32();
			const result = await this.vaultContract.methods.getPoolTokens(poolId_byte32).call();
			this.tokens = result.tokens;
			this.tokensAmount = result.balances;

			return result;
		} catch (error) {
			return null;
		}
	}

	async getTokensPair() {
		if (!this.tokens) await this.getPoolTokens();

		return this.tokens;
	}

	async _tokenInForExactTokenOut(tokenIn: string, amountIn: string) {
		const rate = await this.getTokenInForExactTokenOutRate(tokenIn, amountIn);

		return rate.multipliedBy(amountIn).toString();
	}

	async getTokenInForExactTokenOutRate(tokenIn: string, amountIn: string) {
		await this.getPoolTokens();

		const tokensWeight = await this.getTokensWeight();

		const fromIndex = tokenIn.toLowerCase() === this.tokens[0].toLocaleLowerCase() ? 0 : 1;
		const toIndex = tokenIn.toLowerCase() === this.tokens[0].toLocaleLowerCase() ? 1 : 0;

		// const token_0 = this.tokens[fromIndex]
		// const token_1 = this.tokens[toIndex]
		// console.log('tokensWeight',tokensWeight)
		// console.log('tokensAmount',this.tokensAmount)

		const weight_0 = tokensWeight[fromIndex];
		const weight_1 = tokensWeight[toIndex];

		const amount_0 = this.tokensAmount[fromIndex];
		const amount_1 = this.tokensAmount[toIndex];

		const rate = new BigNumber(weight_0).div(weight_1).div(new BigNumber(amount_0).div(amount_1));

		return rate;
	}
}
