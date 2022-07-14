import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './Swap.module.scss'
import settingIcon from './assets/setting.svg'
import translateIcon from './assets/translate.svg'
import { Form } from "@app/modules/form";
import { FormSpy } from 'react-final-form'
import { Label } from '@app/modules/label'
import { Symbol } from "@app/modules/symbol";
import { Currency } from '@app/modules/currency'
import { TextField } from '@app/modules/text-field'
import { Button, PrimaryButton } from '@app/ui/button';
import { TokenInfo } from '@uniswap/token-lists';
import Bignumber from 'bignumber.js'
import ClickAwayListener from 'react-click-away-listener';
import { approveLbpVault, FundManagement, getBounceProxyContract, getLbpVaultAllowance, getLiquidityBootstrappingPoolContract, getVaultContract, LbpSwap, SingleSwap } from '@app/web3/api/bounce/lbp';
import { useAccount, useChainId, useWeb3Provider } from '@app/web3/hooks/use-web3';
import { OPERATION } from './LBPDetail';
import { getUserDate } from '../create-lbp/createLBP';
import { fromWei, numToWei, toWei, unlimitedAuthorization, weiToNum } from '@app/utils/bn/wei';
import { isEqualZero } from '@app/utils/validation';
import { getTokenContract } from '@app/web3/api/bounce/erc';
import { isLessThan } from '@app/utils/bn';
import { LBPPairData } from './LBPPairData';
import { useRequest } from 'ahooks';
import { CORRECTORDER, ILBPDetail } from '@app/api/lbp/types';
import { getPriceSlice } from './chartDate';
import { VolumeTokens } from '@app/web3/const/volumeTokens';
import { fetchTokenPrice } from '@app/api/lbp/api';

const slipConfig = [0.5, 1, 2]
export interface ISwapparams {
    token0: TokenInfo,
    token1: TokenInfo,
    token0Amount: number
    token1Amount: number
    setOperation: React.Dispatch<React.SetStateAction<OPERATION>>
    poolAddress: string,
    isEnabled: boolean,
    swapFee: number,
    setSwapData?: (swapData: any) => void;
    detailData?: ILBPDetail;
}

export const Swap = ({
    token0: tokenFrom, token1: tokenTo, token0Amount, token1Amount, setOperation, poolAddress, isEnabled, swapFee, setSwapData, detailData
}: ISwapparams) => {
    const POOL_ADDRESS = poolAddress
    const [isResver, setIsResver] = useState(false)
    const [tokenIsApprove, setTokenIsApprove] = useState(false)
    const [tragger, setTragger] = useState<'from' | 'to'>('from')
    const [isSlip, setIsSlip] = useState(false)
    const provider = useWeb3Provider();
    const chainId = useChainId();
    const account = useAccount();
    const vaultContract = useMemo(() => getVaultContract(provider, chainId), [chainId, provider]);
    const lbpPairContract = useMemo(() => getLiquidityBootstrappingPoolContract(provider, POOL_ADDRESS), [provider, POOL_ADDRESS]);
    // const [rate, setRate] = useState<string | number>(0)
    const pairDate = new LBPPairData(lbpPairContract, vaultContract, POOL_ADDRESS);
    const [btnText, setBtnText] = useState<string>('');
    const [currentPrice, setCurrentPrice] = useState<string[]>([]);

    // Submit loading
    const [loading, setLoading] = useState(false)

    const handleTranslate = useCallback(async ({ values, form }) => {
        if (loading) return
        setIsResver(!isResver)
        setLoading(true)

        if (tragger === 'from') {
            const amountFrom = values.amountFrom
            if (!amountFrom) return setLoading(false)

            form.change('amountTo', amountFrom)
            setTragger('to')
            const amountOut = await pairDate._tokenInForExactTokenOut(
                isResver ? tokenTo.address : tokenFrom.address,
                toWei(amountFrom,
                    isResver ? tokenTo.decimals : tokenFrom.decimals
                ).toString())

            form.change('amountFrom', weiToNum(amountOut, isResver ? tokenFrom.decimals : tokenTo.decimals))
            setLoading(false)
            // console.log(weiToNum(amountOut, 6, 4))
        } else {
            const amountTo = values.amountTo
            if (!amountTo) return setLoading(false)


            form.change('amountFrom', amountTo)
            setTragger('from')
            // updateQueryApprove(isResver ? tokenFrom : tokenTo, amountTo)

            const amountOut = await pairDate._tokenInForExactTokenOut(
                isResver ? tokenFrom.address : tokenTo.address,
                toWei(amountTo,
                    isResver ? tokenFrom.decimals : tokenTo.decimals,
                ).toString())

            form.change('amountTo', weiToNum(amountOut, isResver ? tokenTo.decimals : tokenFrom.decimals))

            setLoading(false)
        }
    }, [tokenFrom, tokenTo, tragger, isResver, loading])

    const updateQueryApprove = async (token: TokenInfo, amount: string) => {
        try {
            setLoading(true)
            if (isEqualZero(token.address)) return setTokenIsApprove(true)
            const tokenContract = getTokenContract(provider, token.address);
            const allowance = await getLbpVaultAllowance(
                tokenContract,
                chainId,
                account
            );

            if (!isLessThan(allowance, amount)) {
                setTokenIsApprove(true)
            } else {
                setTokenIsApprove(false)
            }
        } catch (error) {

        } finally {
            setLoading(false)
        }
    }


    // useEffect(() => {
    //     (async () => {
    //         const timer = setInterval(async () => {
    //             const swapRate = await pairDate._tokenInForExactTokenOut(tokenFrom.address, numToWei(1, tokenFrom.decimals))
    //             console.log('swapRate', swapRate)
    //             setRate(weiToNum(swapRate, tokenTo.decimals))
    //         }, 3000)

    //         return () => {
    //             clearInterval(timer)
    //         }
    //     })()
    //     // setOperation(OPERATION.swapSuccess);
    // }, [])

    const getSwapRate = async () => {
        const swapRate = await pairDate._tokenInForExactTokenOut(tokenFrom.address, numToWei(1, tokenFrom.decimals))
        return weiToNum(swapRate, tokenTo.decimals)
    }

    const { data: rate } = useRequest(getSwapRate, {
        pollingInterval: 30000,
    });

    useEffect(() => {
        updateQueryApprove(isResver ? tokenFrom : tokenTo, toWei(99999999, isResver ? tokenFrom.decimals : tokenTo.decimals).toString())
    }, [isResver])

    const handleApprove = useCallback(async () => {
        const tarToken = isResver ? tokenFrom : tokenTo

        if (isEqualZero(tarToken.address)) return
        const tokenContract = getTokenContract(provider, tarToken.address);
        approveLbpVault(tokenContract, chainId, account, unlimitedAuthorization)
            .on("transactionHash", (h) => {
                setOperation(OPERATION.approval);
            })
            .on("receipt", (r) => {
                setOperation(OPERATION.success);
                setTokenIsApprove(true)
            })
            .on("error", (e) => {
                setOperation(OPERATION.error);
            });
    }, [isResver, tokenTo, tokenFrom])

    // const Rate = await pairDate.getTokenInForExactTokenOutRate()

    const handleSubmit = async (values: { amountFrom: number; amountTo: number; }) => {
        if (!tokenIsApprove) return handleApprove()
        setLoading(true)
        const POOL_ID = await pairDate.getPoolIdByte32()

        console.log({
            poolId: POOL_ID,
            kind: 0,    // 0 转入   1  转出
            assetIn: isResver ? tokenFrom.address : tokenTo.address, // USDC
            assetOut: isResver ? tokenTo.address : tokenFrom.address,  // AUCTION 
            amount: toWei(values.amountTo, isResver ? tokenFrom.decimals : tokenTo.decimals).toString(),
            userData: await getUserDate([
                toWei(values.amountTo, isResver ? tokenFrom.decimals : tokenTo.decimals).toString(),
                toWei(values.amountFrom, isResver ? tokenTo.decimals : tokenFrom.decimals).toString()
            ])
        })

        const singleSwap: SingleSwap = {
            poolId: POOL_ID,
            kind: 0,    // 0 转入   1  转出
            assetIn: isResver ? tokenFrom.address : tokenTo.address, // USDC
            assetOut: isResver ? tokenTo.address : tokenFrom.address,  // AUCTION 
            amount: toWei(values.amountTo, isResver ? tokenFrom.decimals : tokenTo.decimals).toString(),
            userData: await getUserDate([
                toWei(values.amountTo, isResver ? tokenFrom.decimals : tokenTo.decimals).toString(),
                toWei(values.amountFrom, isResver ? tokenTo.decimals : tokenFrom.decimals).toString()
            ])
        }

        const fundManagement: FundManagement = {
            sender: account,
            fromInternalBalance: false,
            recipient: account,
            toInternalBalance: false
        }

        await LbpSwap(vaultContract, account, {
            swap_struct: singleSwap,
            fund_struct: fundManagement,
            // limit: toWei(0.0002, 6).toString(),
            limit: '0',
            deadline: new Bignumber(99999999999999).multipliedBy(new Bignumber(10).pow(5)).toString(),
        })
            .on("transactionHash", (h) => {
                console.log("hash", h);
                setOperation(OPERATION.pending);
                const swapData = {
                    tx: h,
                    assetIn: isResver ? tokenFrom : tokenTo, // USDC
                    assetOut: isResver ? tokenTo : tokenFrom,  // AUCTION 
                    amount: toWei(values.amountTo, isResver ? tokenFrom.decimals : tokenTo.decimals).toString(),
                    amountSec: toWei(values.amountFrom, isResver ? tokenTo.decimals : tokenFrom.decimals).toString(),
                }
                console.log('modal data', swapData)
                setSwapData(swapData)
            })
            .on("receipt", (r) => {
                // console.log("receipt", r);
                setOperation(OPERATION.swapSuccess);
                // setLastOperation(null);
                // setPoolId(r.events.Created.returnValues[0]);
                setLoading(false)
            })
            .on("error", (e) => {
                // console.error("error", e);
                setOperation(OPERATION.error);
                setLoading(false)
            });
    }

    // 判断按钮是否可用
    const checkout = (form) => {
        const restAmount = isResver ? fromWei(detailData?.currentAmountToken1, detailData?.token1Decimals).toNumber() : fromWei(detailData?.currentAmountToken0, detailData?.token0Decimals).toNumber()
        if (isEnabled) {
            if (tokenIsApprove) {
                setBtnText('Exchange')
                if (!form?.values?.amountFrom) {
                    setBtnText('Exchange')
                    return false;
                } else if (!form?.values?.amountTo) {
                    setBtnText('Exchange')
                    return false;
                } else {
                    if (Number(form?.values?.amountTo) > (isResver ? Number(token0Amount) : Number(token1Amount))) {    // 判断上面输入框的余额
                        setBtnText('You don’t have enough balance');
                        return false;
                    }
                    if(Number(form?.values?.amountFrom) > restAmount) {     // 判断下面输入框的数量不大于池子剩余量
                        setBtnText('Insufficient balance');
                        return false;
                    }
                    return true;
                }
                
            } else {
                setBtnText(`Approve ${isResver ? tokenFrom.symbol : tokenTo.symbol}`);
                return false;
            }
        } else {
            setBtnText('Not Enable Now');
            return false;
        }
    }

    // useEffect(() => {
    //     if (isEnabled) {
    //         if (tokenIsApprove) {
    //             setBtnText('Exchange')
    //         } else {
    //             setBtnText(`Approve ${isResver ? tokenFrom.symbol : tokenTo.symbol}`)
    //         }
    //     } else {
    //         setBtnText('Not Enable Now')
    //     }
    // }, [isEnabled, tokenIsApprove, isResver, tokenFrom, tokenTo])

    useEffect(() => {
        (async () => {
            const amounts = await pairDate.getTokensAmount()
            const currentAmountTokenFrom = detailData.isCorrectOrder === CORRECTORDER.true ? Number(weiToNum(amounts[0], detailData.token0Decimals)) : Number(weiToNum(amounts[1], detailData.token0Decimals))
            const currentAmountTokenTo = detailData.isCorrectOrder === CORRECTORDER.true ? Number(weiToNum(amounts[1], detailData.token1Decimals)) : Number(weiToNum(amounts[0], detailData.token1Decimals));
            const weights = await pairDate.getTokensWeight()
            const currentWeight = Number(weiToNum(weights[detailData.isCorrectOrder === CORRECTORDER.true ? 0 : 1], detailData.token0Decimals)) * 100;
            const endWeight = detailData.endWeightToken0 * 100;
            const result = VolumeTokens?.some(item => item?.address?.toLocaleLowerCase() === detailData?.token1?.toLocaleLowerCase());
			let tokenToPrice: number;
			if (!result) {
				const { data: priceData } = await fetchTokenPrice(chainId, detailData?.token1);
				tokenToPrice = Number(priceData?.currentPrice);
			} else {
				tokenToPrice = 1;
			}
    
            const current = await getPriceSlice([new Date().getTime()], currentAmountTokenFrom, currentAmountTokenTo, currentWeight, endWeight, tokenToPrice)
            setCurrentPrice(current)		
        })()
    }, [detailData, rate])


    return (
        <div className={styles.swapWrapper}>
            <Form
                onSubmit={handleSubmit}
                className={styles.form}
            // initialValues={''}
            >
                <div className={styles.header}>
                    <h4 className={styles.title}>Join The Pool</h4>
                    <div className={styles.setting}>
                        <img src={settingIcon} onClick={() => { setIsSlip(!isSlip) }} alt="" />
                        {isSlip &&
                            <ClickAwayListener onClickAway={() => {
                                setIsSlip(false)
                            }}>
                                <div className={styles.slip}>
                                    <span>Slippage tolerance</span>
                                    <FormSpy>
                                        {
                                            ({ form, values }) => (
                                                <div>
                                                    {slipConfig.map(item => {
                                                        return <Button
                                                            variant={
                                                                values.slip === item ? 'contained' : 'outlined'
                                                            } color={
                                                                values.slip === item ? 'primary-black' : 'primary-white'
                                                            }
                                                            onClick={() => {
                                                                form.change('slip', item)
                                                            }}> {new Bignumber(item).toFixed(1).toString()}%
                                                        </Button>
                                                    })}
                                                    <TextField
                                                        className={styles.slipInput}
                                                        name='slip'
                                                        type="number"
                                                        placeholder='0.1'
                                                        after={
                                                            <span className={styles.inputAfter}>%</span>
                                                        }
                                                        onChange={(e) => {
                                                            if (Number(e.target.value) > 99) {
                                                                form.change('slip', 99)
                                                            } else if (Number(e.target.value) < 0) {
                                                                form.change('slip', 0)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )
                                        }
                                    </FormSpy>
                                </div>
                            </ClickAwayListener>
                        }
                    </div>
                </div >

                <div className={styles.showPrice}>
                    <strong>{`Current Price $${currentPrice?.[0] || '-'}`}</strong>
                    <p>1 {isResver ? tokenFrom.symbol : tokenTo.symbol} = ~{
                        (isResver ? new Bignumber(rate) : new Bignumber(1).div(rate))
                            .dp(4).toString()} {isResver ? tokenTo.symbol : tokenFrom.symbol} </p>
                </div>

                <div className={styles.container}>

                    <FormSpy subscription={{ values: true }}>
                        {(props) => (
                            <>
                                <Label
                                    Component="label"
                                    className={styles.row}
                                    label={isResver ? "Launch Token Amount" : 'Currency'}
                                    after={
                                        <span className={styles.balance}>
                                            Balance: {isResver ? token0Amount : token1Amount} <Symbol token={(isResver ? tokenFrom : tokenTo).address} />
                                        </span>
                                    }
                                >
                                    <TextField
                                        type="number"
                                        name="amountTo"
                                        placeholder="0.00"
                                        onChange={async (e) => {
                                            setTragger('to')
                                            setLoading(true)
                                            const amountOut = await pairDate._tokenInForExactTokenOut(
                                                isResver ? tokenFrom.address : tokenTo.address,
                                                toWei(parseFloat(e.target.value), isResver ? tokenFrom.decimals : tokenTo.decimals
                                                ).toString())                                        
                                            props.form.change('amountFrom', e.target.value ? weiToNum(amountOut, isResver ? tokenTo.decimals : tokenFrom.decimals) : undefined)
                                            setLoading(false)
                                        }}
                                        after={
                                            <div className={styles.amount}>
                                                <FormSpy>
                                                    {({ form }) => (
                                                        <button
                                                            className={styles.max}
                                                            onClick={async () => {
                                                                const max = isResver ? token0Amount : token1Amount
                                                                form.change(
                                                                    "amountTo",
                                                                    max
                                                                );
                                                                const amountOut = await pairDate._tokenInForExactTokenOut(
                                                                    isResver ? tokenFrom.address : tokenTo.address,
                                                                    toWei(max, isResver ? tokenFrom.decimals : tokenTo.decimals
                                                                    ).toString())
                                                                props.form.change('amountFrom', max ? weiToNum(amountOut, isResver ? tokenTo.decimals : tokenFrom.decimals) : undefined)
                                                            }
                                                            }
                                                            type="button"
                                                        >
                                                            MAX
                                                        </button>

                                                    )}
                                                </FormSpy>
                                                {
                                                    tokenFrom && tokenTo && <Currency coin={isResver ? tokenFrom : tokenTo} small />
                                                }
                                            </div>
                                        }
                                    />
                                </Label>

                                <div className={styles.translate}>
                                    <img
                                        onClick={() => { handleTranslate(props) }}
                                        className={isResver ? styles.translated : ''}
                                        src={translateIcon}
                                        alt=""
                                    />
                                </div>

                                <Label
                                    Component="label"
                                    className={styles.row}
                                    label={isResver ? 'Currency' : "Launch Token Amount"}
                                    after={
                                        <span className={styles.balance}>
                                            Balance: {isResver ? token1Amount : token0Amount} <Symbol token={(isResver ? tokenTo : tokenFrom).address} />
                                        </span>
                                    }
                                >
                                    <TextField
                                        type="number"
                                        name="amountFrom"
                                        placeholder="0.00"
                                        className={styles.inputBox}
                                        onChange={async (e) => {
                                            setTragger('from')
                                            setLoading(true)
                                            const amountOut = await pairDate._tokenInForExactTokenOut(
                                                isResver ? tokenTo.address : tokenFrom.address,
                                                toWei(parseFloat(e.target.value), isResver ? tokenTo.decimals : tokenFrom.decimals
                                                ).toString())
                                            props.form.change('amountTo', e.target.value ? weiToNum(amountOut, isResver ? tokenFrom.decimals : tokenTo.decimals) : undefined)
                                            setLoading(false)
                                            // console.log(e.target.value)

                                        }}
                                        after={
                                            <div className={styles.amount}>
                                                {/* <FormSpy>
                                                    {({ form }) => (
                                                        <button
                                                            className={styles.max}
                                                            onClick={async() => {
                                                                const max = isResver ? token1Amount : token0Amount
                                                                form.change(
                                                                    "amountFrom",
                                                                    max
                                                                );
                                                                const amountOut = await pairDate._tokenInForExactTokenOut(
                                                                    isResver ? tokenTo.address : tokenFrom.address,
                                                                    toWei(max, isResver ? tokenTo.decimals : tokenFrom.decimals
                                                                    ).toString())
                    
                                                                props.form.change('amountTo', max ? weiToNum(amountOut, isResver ? tokenFrom.decimals : tokenTo.decimals) : undefined )
                                                            }
                                                            }
                                                            type="button"
                                                        >
                                                            MAX
                                                        </button>

                                                    )}
                                                </FormSpy> */}
                                                {
                                                    tokenFrom && tokenTo && <Currency coin={isResver ? tokenTo : tokenFrom} small />
                                                }
                                            </div>
                                        }
                                    />
                                </Label>
                                <div className={styles.tradingFee}>
                                    <span>Trading Fee is {new Bignumber(swapFee).multipliedBy(100).toString()}%</span>
                                </div>
                            </>
                        )}
                    </FormSpy>
                    <FormSpy>
                        {(form) => {
                            const balanceEnough = checkout(form);
                            return (
                                <PrimaryButton
                                    className={styles.submit}
                                    size="large"
                                    disabled={loading || !isEnabled || !balanceEnough}
                                    submit
                                >
                                    {btnText}
                                </PrimaryButton>
                            )
                        }}
                    </FormSpy>
                </div>
            </Form >
        </div >
    )
}
