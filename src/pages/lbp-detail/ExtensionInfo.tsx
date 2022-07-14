import { ILBPDetail } from '@app/api/lbp/types'
import { TokenInfo } from '@uniswap/token-lists'
import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useMemo, useState } from 'react'
import { uid } from 'react-uid'
import { AuctionHistoryView } from './AuctionHistoryView'
import { AuctionSettingView } from './AuctionSettingView'
import { AuctuinDetailView } from './AuctuinDetailView'
import styles from './ExtensionInfo.module.scss'
import { OPERATION } from './LBPDetail'

interface ExtensionInfoParams {
    poolId: number
    tokenFrom: TokenInfo
    tokenTo: TokenInfo
    poolAddress: string
    detailData: ILBPDetail
    setOperation: React.Dispatch<React.SetStateAction<OPERATION>>,
}

export const ExtensionInfo = ({
    poolId, tokenFrom, tokenTo, poolAddress, detailData, setOperation
}: ExtensionInfoParams) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const {account} = useWeb3React();
    const [tabList, setTabList] = useState<string[]>([])

    useEffect(() => {
        if(detailData?.creator?.toLocaleLowerCase() === account?.toLocaleLowerCase()) {
            setTabList(['Auction Details', 'Auction History', 'Auction Settings'])
        } else {
            setTabList(['Auction Details', 'Auction History'])
        }
    }, [detailData])

    const renderExtensionContent = useMemo(() => {
        switch (currentIndex) {
            case 0:
                return tokenFrom && <AuctuinDetailView
                    tokenFrom={tokenFrom}
                    detailData={detailData}
                />
            case 1:
                return <AuctionHistoryView poolAddress={poolAddress} detailData={detailData} />
            case 2:
                return <AuctionSettingView
                    setOperation={setOperation}
                    poolAddress={poolAddress}
                    token0={tokenFrom}
                    token1={tokenTo}
                    detailData={detailData}
                />
            default:
                return <></>
        }
    }, [currentIndex, tokenFrom])

    return (
        <div className={styles.extensionWrapper}>
            <ul className={styles.tabList}>
                {tabList.map((tabName, index) => (
                    <li
                        key={uid(tabName)}
                        className={currentIndex === index ? styles.active : ''}
                        onClick={() => {
                            setCurrentIndex(index)
                        }}
                    >
                        {tabName}
                    </li>
                ))}
            </ul>

            {renderExtensionContent}
        </div>
    )
}
