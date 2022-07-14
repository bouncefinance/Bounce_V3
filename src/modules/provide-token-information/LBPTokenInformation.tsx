import { TokenInfo } from "@uniswap/token-lists";
import { FC, useCallback, useEffect, useState } from "react";
import { useForm, useFormState, FormSpy } from "react-final-form";

import { Form } from "@app/modules/form";
import { Label } from "@app/modules/label";
import { SelectTokenField } from "@app/modules/select-token-field";
import { TextField } from "@app/modules/text-field";

import { NavLink, PrimaryButton } from "@app/ui/button";
import { RightArrow2 } from "@app/ui/icons/arrow-right-2";

import { useChainId } from "@app/web3/hooks/use-web3";
import { CHAINS_INFO } from "@app/web3/networks/const";

import styles from "./ProvideTokenInformation.module.scss";
import { Currency } from "../currency";
import { TokenLogo } from "./TokenLogo";
import { isFromToTokensDifferent } from "@app/utils/validation";
import { filterPopularToken } from "@app/web3/const/filterToken";

type EffectorType = {
	address?: string;
	onImgChange?: (imgUrl: string | null) => void;
	onTokenChange(token0: string, token1: string): void;
};

const Effector: FC<EffectorType> = ({ address, onImgChange, onTokenChange }) => {
	const form = useForm();
	const { values: { tokenFrom, tokenTo, tokenFromUrl } } = useFormState();

	console.log(tokenFromUrl)

	useEffect(() => {
		onTokenChange(tokenFrom, tokenTo);
	}, [onTokenChange, tokenFrom, tokenTo]);

	useEffect(() => {
		form.batch(() => {
			form.change("address", address);
		});
	}, [address, form]);

	useEffect(() => {
		(async () => {
			try {
				await fetch(tokenFromUrl).then(res => {
					if (res.status === 200) {
						onImgChange(tokenFromUrl)
					} else {
						onImgChange(null)
					}
				})
			} catch (error) {
				onImgChange(null)
			}
		})()
	}, [tokenFromUrl, onImgChange])

	return null;
};

type ProvideTokenInformationType = EffectorType & {
	href: string;
	initialState: any;
	withoutEth?: boolean;
	onSubmit(values): void;
};

export const LBPTokenInformation: FC<ProvideTokenInformationType> = ({
	onSubmit,
	onTokenChange,
	onImgChange,
	address,
	initialState,
	href,
	withoutEth,
}) => {
	const notEtherium = useCallback(
		(token: TokenInfo) => token.address !== "0x0000000000000000000000000000000000000000",
		[]
	);

	// lbp select token只显示价值币(DAI, USDC, WETH)
	const filterToken = useCallback(
		(token: TokenInfo) =>  filterPopularToken?.some((v) => v.address?.toLocaleLowerCase() === token?.address?.toLocaleLowerCase()),
		[]
	);
	// 过滤掉不显示价值币（DAI, USDC, WETH）
	const filterLaunchToken = useCallback(
		(token: TokenInfo) =>  filterPopularToken.every((item) => item?.address !== token.address),
		[]
	);
	console.log('后', filterLaunchToken)
	const [tokenFromImg, setTokenFromImg] = useState(initialState.tokenFromUrl)
	const chainId = useChainId();

	return (
		<Form
			onSubmit={onSubmit}
			className={styles.form}
			initialValues={initialState}
			validate={(values) => {
				return { tokenTo: isFromToTokensDifferent<string>(values.tokenFrom, values.tokenTo) };
			}}
		>
			<Effector address={address} onImgChange={(value) => {
				onImgChange(value)
				setTokenFromImg(value)
			}} onTokenChange={onTokenChange} />
			<Label className={styles.label} Component="div" label="Launch Token" tooltip="Select a ERC20 token.">
				<SelectTokenField
					name="tokenFrom"
					placeholder="Select a token"
					filter={withoutEth ? notEtherium : filterLaunchToken}
					required
				/>
				{address && <NavLink
					className={styles.link}
					href={href}
					size="medium"
					variant="text"
					color="dark-grey"
					weight="regular"
				>
					{`View on ${CHAINS_INFO[chainId].explorer.name}`}
				</NavLink>}
			</Label>
			<Label Component="label" className={styles.label} label="Token Logo URL">
				<div className={styles.tokenFromLogoWrapper}>
					<TextField
						className={styles.tokenFromLogoInput}
						type="text"
						name="tokenFromUrl"
						placeholder="URL of token image"
					/>
					<div className={styles.tokenFromPre}>
						{tokenFromImg ?
							<img src={tokenFromImg} alt='' /> : <Currency token={address} small isShowSymbol={false} />}
					</div>
				</div>
				<p style={{ fontSize: 12, color: 'rgba(0,0,0,.5)' }}>Please enter a valid URL starting with "https://" and ending in".jpeg",".jpg",or ".png"</p>
			</Label>

			<Label className={styles.label} Component="div" label="Collected Token" tooltip="Select a ERC20 token.">
				<SelectTokenField
					name="tokenTo"
					placeholder="Select a token"
					filter={withoutEth ? notEtherium : filterToken}
					required
					noManage
				/>
			</Label>
			<FormSpy>
				{(form) => (
					<PrimaryButton
						className={styles.submit}
						size="large"
						iconAfter={<RightArrow2 width={18} style={{ marginLeft: 12 }} />}
						submit
					>
						{initialState && form.dirty ? "Save" : "Next Step"}
					</PrimaryButton>
				)}
			</FormSpy>
		</Form>
	);
};
