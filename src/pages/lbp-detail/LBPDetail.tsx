import { CircularProgress } from '@material-ui/core'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { View } from './View'
import styles from './LBPDetail.module.scss'
import { Swap } from './Swap'
import { useTokenQuery, useTokenSearch } from '@app/web3/api/tokens'
import { isEth } from '@app/web3/api/eth/use-eth'
import { getBalance, getEthBalance, getTokenContract } from '@app/web3/api/bounce/erc'
import { useChainId, useWeb3, useWeb3Provider } from '@app/web3/hooks/use-web3'
import { fromWei } from '@app/utils/bn/wei'
import { useWeb3React } from '@web3-react/core'
import { ExtensionInfo } from './ExtensionInfo'
import { useControlPopUp } from '@app/hooks/use-control-popup'
import { ProcessingPopUp } from '@app/modules/processing-pop-up'
// import { CONTENT, TITLE } from '../farm/stakingModal'
import { fetchLbpDetail, fetchLbpSetting } from '@app/api/lbp/api'
import { ILBPDetail, ILBPSetting } from '@app/api/lbp/types'
import { TokenInfo } from '@uniswap/token-lists'
import BigNumber from 'bignumber.js'
import { divide } from '@app/utils/bn'
import { ToLBPAuctionStatus } from '../lbp/components/AuctionList/AuctionList'
import { ENABLED } from './AuctionSettingView'
import { getProgress } from '@app/utils/pool'
import { NavLink } from '@app/ui/button'


export enum OPERATION {
    default = "default",
    approval = "approval",
    confirm = "confirm",
    pending = "pending",
    success = "success",
    error = "error",
    cancel = "cancel",
    swapSuccess = "swapSuccess",
    settingSuccess = "settingSuccess",
}

export const TITLE = {
    [OPERATION.approval]: "Bounce Requests Approval",
    [OPERATION.confirm]: "Waiting for confirmation",
    [OPERATION.pending]: " Bounce Finance Pending",
    [OPERATION.error]: "Transaction Failed",
    [OPERATION.cancel]: "Transaction Canceled",
    [OPERATION.success]: "Success!",
    [OPERATION.settingSuccess]: "Success!",
    [OPERATION.swapSuccess]: "Success!",
};

export const CONTENT = {
    [OPERATION.approval]: "Please enable Bounce to access your tokens",
    [OPERATION.confirm]: "Confirm this transaction in your wallet",
    [OPERATION.pending]: "Please wait a moment.",
    [OPERATION.error]: "Your transaction was cancelled and wasn’t submitted",
    [OPERATION.cancel]: "Your transaction was cancelled and wasn’t submitted",
    [OPERATION.success]: "The transaction has been successful",
    [OPERATION.settingSuccess]: "The transaction has been successful",
    [OPERATION.swapSuccess]: '',
};


export const LBPDetail = (props: {
    poolAddress: string
}) => {
    const provider = useWeb3Provider();
    const web3 = useWeb3()
    const findToken = useTokenSearch();
    const queryToken = useTokenQuery()
    const { account } = useWeb3React()
    const { back: goBack } = useRouter();
    const { popUp, close, open } = useControlPopUp();
    const [operation, setOperation] = useState(OPERATION.default);
    const chainId = useChainId();
    const [detailData, setDetailData] = useState<ILBPDetail | null>(null)
    const [token0, setToken0] = useState<TokenInfo>()
    const [token1, setToken1] = useState<TokenInfo>()
    const [settingData, setSettingData] = useState<ILBPSetting>();
    const [swapInfo, setSwapInfo] = useState<any>(null)

    const getData = async () => {
        const { data } = await fetchLbpDetail(chainId, props.poolAddress);
        setDetailData(data)

        setToken0(findToken(data.token0) || await queryToken(data.token0))
        setToken1(findToken(data.token1) || await queryToken(data.token1))

        const { data: settingData } = await fetchLbpSetting(chainId, data.address);
        setSettingData(settingData);
    }

    useEffect(() => {
        getData();
    }, [chainId, props.poolAddress])

    const TokenSold = useMemo(() => {
        const sold = new BigNumber(detailData?.startAmountToken0)?.minus(new BigNumber(detailData?.currentAmountToken0)).toString();
        const progress = getProgress(sold, detailData?.startAmountToken0, detailData?.token0Decimals)

        return <div className={styles.tokenSold}>
            <CircularProgress thickness={6} style={{
                width: 29, height: 29, color: '#4B70FF', marginRight: 6
            }} variant="determinate" value={progress} />
            <span>{progress}%</span>
        </div>
    }, [detailData])


    const [token0Amount, setToken0Amount] = useState(0)
    const [token1Amount, setToken1Amount] = useState(0)

    useEffect(() => {
        if (operation !== OPERATION.default) {
            open();
        }
    }, [open, operation]);

    useEffect(() => {
        if (!token0 || !token1) {
            return;
        }
        if (!isEth(token0.address)) {
            getBalance(getTokenContract(provider, token0.address), account).then((b) =>
                setToken0Amount(parseFloat(fromWei(b, token0.decimals).toFixed(6, 1)))
            );
        } else {
            getEthBalance(web3, account).then((b) =>
                setToken0Amount(parseFloat(fromWei(b, token0.decimals).toFixed(4, 1)))
            );
        }

        if (!isEth(token1.address)) {
            getBalance(getTokenContract(provider, token1.address), account).then((b) =>
                setToken1Amount(parseFloat(fromWei(b, token1.decimals).toFixed(6, 1)))
            );
        } else {
            getEthBalance(web3, account).then((b) =>
                setToken1Amount(parseFloat(fromWei(b, token1.decimals).toFixed(4, 1)))
            );
        }
    }, [web3, getTokenContract, account, token1, token0]);

    const setData = (swapData: any) => {
        setSwapInfo(swapData)
    }

    const swapSuccess = () => {
        const inAmount = fromWei(swapInfo?.amount, swapInfo?.assetIn?.decimals).toFixed(2).toString();
        const outAmount = fromWei(swapInfo?.amountSec, swapInfo?.assetOut?.decimals).toFixed(2).toString();
        const url = `https://rinkeby.etherscan.io/tx/${swapInfo?.tx}`
        return <div>
            <span>Swap <span className={styles.blueText}>{`${inAmount} ${swapInfo?.assetIn?.symbol}`}</span> for <span className={styles.blueText}>{`${outAmount} ${swapInfo?.assetOut?.symbol}`}</span></span>
            <NavLink href={url} className={styles.navlink}>
                View on Etherscan
            </NavLink>
        </div>
    }

    const successClose = () => {
        if (operation === OPERATION.swapSuccess || operation === OPERATION.settingSuccess) {
            setOperation(OPERATION.default);
            close();
            window.location.reload();
        } else {
            setOperation(OPERATION.default);
            close();
        }
    }

    const update = () => {
        window.location.reload();
    }



    return (
        <div>
            <View
                status={ToLBPAuctionStatus[detailData?.status]}
                id={detailData?.address?.slice(-6)}
                name={`${detailData?.token0Symbol} Token Launch Auction`}
                openAt={Number(detailData?.startTs) * 1000}
                closeAt={Number(detailData?.endTs) * 1000}
                onZero={update}
                onBack={() => goBack()}
                totalVolume={`$ ${Number(detailData?.totalSwapVolume)?.toFixed(2)}`}
                liquidity={`$ ${Number(detailData?.totalLiquidity)?.toFixed(2) || 0}`}
                tokenSold={TokenSold}
                detailData={detailData}
                extension={<ExtensionInfo
                    poolId={+detailData?.poolID}
                    tokenFrom={token0}
                    tokenTo={token1}
                    setOperation={setOperation}
                    poolAddress={detailData?.address}
                    detailData={detailData}
                />}
            >
                {token0 && token1 && <Swap
                    token0={token0}
                    token1={token1}
                    token0Amount={token0Amount}
                    token1Amount={token1Amount}
                    setOperation={setOperation}
                    poolAddress={props.poolAddress}
                    isEnabled={settingData?.swapEnable === ENABLED.open && detailData?.status === 2}
                    swapFee={settingData?.swapFee}
                    setSwapData={setData}
                    detailData={detailData}
                />}
            </View>
            {popUp.defined ? (
                <ProcessingPopUp
                    title={TITLE[operation]}
                    text={operation === OPERATION.swapSuccess ? swapSuccess() : CONTENT[operation]}
                    onSuccess={successClose}
                    // onTry={tryAgainAction}
                    isSuccess={operation === OPERATION.success || operation === OPERATION.swapSuccess || operation === OPERATION.settingSuccess}
                    isLoading={
                        operation === OPERATION.approval ||
                        operation === OPERATION.pending ||
                        operation === OPERATION.confirm
                    }
                    isError={operation === OPERATION.error || operation === OPERATION.cancel}
                    control={popUp}
                    close={() => {
                        close();
                        setOperation(OPERATION.default);
                    }}
                />
            ) : undefined}
        </div >
    )
}
