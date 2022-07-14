import styles from './ExtensionInfo.module.scss'
import { Icon } from '@app/modules/icon'
import { TokenInfo } from '@uniswap/token-lists'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import copyIcon from './assets/copy.svg'
import React from 'react'
import { ILBPDetail } from '@app/api/lbp/types';
import { CopyAddress } from '@app/modules/copy-to-clipboard';
import { NavLink } from '@app/ui/button';
import moment from 'moment';
import { fromWei } from '@app/utils/bn/wei';
import BigNumber from 'bignumber.js';

interface AuctuinDetailViewParams {
    tokenFrom: TokenInfo
    detailData: ILBPDetail
}

export const AuctuinDetailView = ({ tokenFrom, detailData }: AuctuinDetailViewParams) => {
    const formatDecimaiToPercent = (val: number | string) => {
        const percentNum = new BigNumber(val).multipliedBy(100).toString();
        return `${percentNum}%`
    }
    const soldAmount = new BigNumber(detailData?.startAmountToken0)?.minus(new BigNumber(detailData?.currentAmountToken0)).toString();
    const raiseAmount = new BigNumber(detailData?.currentAmountToken1)?.minus(new BigNumber(detailData?.startAmountToken1)).toString();
    const token0Img = tokenFrom.logoURI || detailData?.token0SmallURL || detailData?.token0ThumbURL || detailData?.token0LargeURL;

    return (
        <div>
            <div className={styles.tokenInfo}>
                <div className={styles.tokenInfoTop}>
                    <Icon src={token0Img} />
                    <h4>{tokenFrom.symbol}</h4>
                    <div>{tokenFrom.symbol}</div>
                </div>
                <div className={styles.tokenInfoBottom}>
                    <CopyAddress className={styles.copyAddress} address={tokenFrom.address} />
                </div>
            </div>
            <div className={styles.infoContent}>
                <div className={styles.infoContentLeft}>
                    <h4>Launch Description</h4>
                    <p>
                        {
                            detailData?.description || 'No launch description'
                        }
                    </p>
                    <h5>Learn More Links</h5>
                    <p>
                        {
                            detailData?.learnMoreLink ? <NavLink className={styles.textNavLink} href={detailData?.learnMoreLink?.includes('http') ? detailData?.learnMoreLink : `http://${detailData?.learnMoreLink}`}>
                                {detailData?.learnMoreLink}
                            </NavLink> : 'No link'
                        }

                    </p>
                </div>

                <div className={styles.infoContentRight}>
                    <h4>Auction Details</h4>
                    <h5>Auction Period</h5>
                    <p>
                        {
                            `${moment(Number(detailData.startTs) * 1000).format('MMM DD,YYYY HH:mm')} - ${moment(Number(detailData.endTs) * 1000).format('MMM DD,YYYY HH:mm')}`
                        }
                    </p>

                    <h5>Weights Settings</h5>
                    <p>
                        Start:  {`${formatDecimaiToPercent(detailData?.startWeightToken0)} ${detailData?.token0Symbol} + ${formatDecimaiToPercent(detailData?.startWeightToken1)} ${detailData?.token1Symbol}`}
                        <br />
                        End:  {`${formatDecimaiToPercent(detailData?.endWeightToken0)} ${detailData?.token0Symbol} + ${formatDecimaiToPercent(detailData?.endWeightToken1)} ${detailData?.token1Symbol}`}
                    </p>

                    <h5>Start Balances</h5>
                    <p>
                        {`${fromWei(detailData?.startAmountToken0, detailData?.token0Decimals).toFixed(2)} ${detailData?.token0Symbol}`}
                        <br />
                        {`${fromWei(detailData?.startAmountToken1, detailData?.token1Decimals).toFixed(2)} ${detailData?.token1Symbol}`}
                    </p>

                    <h5>Current Balances</h5>
                    <p>
                        {`${fromWei(detailData?.currentAmountToken0, detailData?.token0Decimals).toFixed(2)} ${detailData?.token0Symbol}`}
                        <br />
                        {`${fromWei(detailData?.currentAmountToken1, detailData?.token1Decimals).toFixed(2)} ${detailData?.token1Symbol}`}
                    </p>

                    <h5>Total Sold</h5>
                    <p>
                        {`${fromWei(soldAmount, detailData.token0Decimals).toFixed(2)} ${detailData?.token0Symbol}`}
                    </p>

                    <h5>Total Raised</h5>
                    <p>
                        {`${fromWei(raiseAmount, detailData.token1Decimals).toFixed(2)} ${detailData?.token1Symbol}`}
                    </p>
                </div>
            </div>
        </div>
    )
}
