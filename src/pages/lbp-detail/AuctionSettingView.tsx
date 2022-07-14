import { fetchLbpSetting } from '@app/api/lbp/api'
import { ILBPDetail, ILBPSetting } from '@app/api/lbp/types'
import { Button } from '@app/ui/button'
import { roundedDivide } from '@app/utils/bn'
import { fromWei } from '@app/utils/bn/wei'
import { getBounceProxyContract, setPoolEnabled, withDrawAllLbpPool } from '@app/web3/api/bounce/lbp'
import { useAccount, useChainId, useWeb3Provider } from '@app/web3/hooks/use-web3'
import { ListItem, ListItemSecondaryAction, Switch } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { TokenInfo } from '@uniswap/token-lists'
import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo, useState } from 'react'
import styles from './ExtensionInfo.module.scss'
import { OPERATION } from './LBPDetail'


const useStyles = makeStyles({
    root: {
        '.MuiSwitch-colorPrimary.Mui-checked': {
            color: '#000'
        }
    }
})

export enum ENABLED {
    unknown = 0,
    open,
    closed
}

interface IAuctionSettingViewParams {
    poolAddress: string
    token0: TokenInfo
    token1: TokenInfo
    detailData: ILBPDetail
    setOperation: React.Dispatch<React.SetStateAction<OPERATION>>
}


export const AuctionSettingView = ({
    poolAddress,
    token0,
    token1,
    detailData,
    setOperation,
}: IAuctionSettingViewParams) => {

    const POOLID = poolAddress
    const [isEnabled, setIsEnabled] = useState(false)
    const [isEnabledLoading, setIsEnabledALoading] = useState(false)
    const classes = useStyles();
    const provider = useWeb3Provider();
    const chainId = useChainId();
    const account = useAccount();
    const contract = useMemo(() => getBounceProxyContract(provider, chainId), [chainId, provider]);
    const [settingData, setSettingData] = useState<ILBPSetting>(null);

    useEffect(() => {
        (async() => {
            const { data } = await fetchLbpSetting(chainId, poolAddress);
            setSettingData(data);
        })();
    }, [poolAddress])

    useEffect(() => {
        setIsEnabled(settingData?.swapEnable === ENABLED.open)
    }, [settingData])



    const handleWithdraw = async () => {
        try {
            await withDrawAllLbpPool(contract, account,
                {
                    pool: POOLID,
                    minAmountsOut: [0, 0],
                    maxBPTTokenOut: [0, 0]
                }
            )
                .on("transactionHash", (h) => {
                    // console.log("hash", h);7
                    setOperation(OPERATION.pending);
                })
                .on("receipt", (r) => {
                    // console.log("receipt", r);
                    // setOperation(OPERATION.success);
                    setOperation(OPERATION.settingSuccess);
                    // setLastOperation(null);
                    // setPoolId(r.events.Created.returnValues[0]);
                })
                .on("error", (e) => {
                    // console.error("error", e);
                    setOperation(OPERATION.error);
                });
        } catch (error) {
            console.log(error)
        }
    }

    const handleChangeEnable = async () => {
        if (isEnabledLoading) return
        setIsEnabledALoading(true)
        const willEnable = !isEnabled

        setIsEnabled(willEnable)
        try {
            await setPoolEnabled(contract, account, {
                poolAddress: POOLID,
                swapEnabled: willEnable
            })
                .on("transactionHash", (h) => {
                    // console.log("hash", h);7
                    setOperation(OPERATION.pending);
                    setIsEnabledALoading(false)
                })
                .on("receipt", (r) => {
                    // console.log("receipt", r);
                    setOperation(OPERATION.settingSuccess);

                })
                .on("error", (e) => {
                    // console.error("error", e);
                    setOperation(OPERATION.error);
                    setIsEnabled(!willEnable)
                });
        } catch (error) {
            console.log(error)
            setIsEnabled(!willEnable)
            setIsEnabledALoading(false)
        }
    }

    return (
        <div>
            <div className={styles.centerWrapper}>
                <h4 style={{fontSize: 20}}>Trading Status</h4>
                <div className={styles.enabled}>
                    <ListItem>
                        <p style={{maxWidth: '314px'}}>For security, you should manually enable the swap function when the auction begins.</p>
                        <ListItemSecondaryAction>
                            <Switch
                                color='primary'
                                classes={classes}
                                size='medium'
                                edge="end"
                                disabled={detailData?.status === 1}
                                onChange={handleChangeEnable}
                                checked={isEnabled}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                </div>

                <h4 style={{fontSize: 20}}>Pool Balances</h4>
                <div className={styles.poolCard}>
                    <div>
                        <h5>Current Balances</h5>
                        <p>
                            {
                                `${fromWei(settingData?.CurrentAmountToken0, token0?.decimals).toFixed(2)} ${token0?.symbol}`
                            }
                            <br />
                            {
                                 `${fromWei(settingData?.currentAmountToken1, token1?.decimals).toFixed(2)} ${token1?.symbol}`
                            }
                        </p>

                        <h5>Swap Fees Collected By Project</h5>
                        <p>
                            {
                                `$ ${new BigNumber(detailData?.totalSwapVolume).multipliedBy(settingData?.swapFee).dp(2).toString()}`
                            }
                        </p>
                    </div>
                    <div className={styles.poolCardRight}>
                        <Button
                            className={styles.withdrawBtn}
                            color='primary-black'
                            variant='contained'
                            onClick={handleWithdraw}
                        >
                            Withdraw All
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

