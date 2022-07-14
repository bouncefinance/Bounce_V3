

import { fetchLbpList, fetchTokenPrice } from '@app/api/lbp/api';
import { ILBPList} from '@app/api/lbp/types';
import { Card, DisplayPoolInfoType } from '@app/modules/auction-card';
import { EmptyData } from '@app/modules/emptyData/EmptyData';
import { Loading } from '@app/modules/loading/Loading';
import { Pagination } from '@app/modules/pagination';
import { LBPPairData } from '@app/pages/lbp-detail/LBPPairData';
import { fromWei, numToWei, weiToNum } from '@app/utils/bn/wei';
import { getProgress, POOL_STATUS } from '@app/utils/pool';
import { getIsOpen } from '@app/utils/time';
import { getLiquidityBootstrappingPoolContract, getVaultContract } from '@app/web3/api/bounce/lbp';
import { VolumeTokens } from '@app/web3/const/volumeTokens';
import { useAccount, useChainId, useWeb3Provider } from '@app/web3/hooks/use-web3';
import BigNumber from 'bignumber.js';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { uid } from 'react-uid';
import styles from './auctionList.module.scss';

export const ToLBPAuctionStatus = {
    1: POOL_STATUS.COMING,
    2: POOL_STATUS.LIVE,
    3: POOL_STATUS.CLOSED,
};


const EMPTY_ARRAY = [];
const WINDOW_SIZE = 9;

export enum lbpPoolStatus {
    all,
    upcoming,
    live,
    closed
}


export const LBPAuctionList = ({ type }: { type: string }) => {
    const [convertedPoolInformation, setConvertedPoolInformation] = useState<DisplayPoolInfoType[]>([]);
    const [page, setPage] = useState(0);
    const [auctionListData, setAuctionListData] = useState<ILBPList[]>([])
    const [totalCount, setTotalCount] = useState(0);
    const chainId = useChainId();
    const router = useRouter();
    const { pathname } = router;
    const [poolStatus, setPoolStatus] = useState<lbpPoolStatus>();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (pathname === '/lbp/upcoming') {
            setPoolStatus(lbpPoolStatus.upcoming);
        } else if (pathname === '/lbp/live') {
            setPoolStatus(lbpPoolStatus.live);
        } else if (pathname === '/lbp/closed') {
            setPoolStatus(lbpPoolStatus.closed)
        } else {
            setPoolStatus(lbpPoolStatus.all)
        }
    }, [pathname, type])

    const numberOfPages = Math.ceil(totalCount / WINDOW_SIZE);

    useEffect(() => {
        if (poolStatus === undefined) return
        setLoading(true);
        (async () => {
            const { data: lbpList, meta: { total } } = await fetchLbpList(
                chainId,
                poolStatus,
                {
                    page,
                    perPage: WINDOW_SIZE
                }
            );
            setTotalCount(total);
            setAuctionListData(lbpList);
        })()
    }, [chainId, page, poolStatus])

    const provider = useWeb3Provider();
    const account = useAccount();
    const vaultContract = useMemo(() => getVaultContract(provider, chainId), [chainId, provider]);  // 取amount

    const getCurrentPrice = async (pool: ILBPList) => {
        if(pool.isWithdrawed) {
            return '-'
        }

        const result = VolumeTokens?.some(item => item?.address?.toLocaleLowerCase() === pool?.token1?.toLocaleLowerCase());
        let currentPrice: number;
        if(!result) {
            const { data: priceData } = await fetchTokenPrice(chainId, pool?.token1);
            currentPrice = Number(priceData?.currentPrice);
        } else {
            currentPrice = 1;
        }
        const lbpPairContract = getLiquidityBootstrappingPoolContract(provider, pool?.address)
        const pairDate = new LBPPairData(lbpPairContract, vaultContract, pool?.address)             // 得到实例，当前时刻的pair-data的信息

        const amountOut = await pairDate._tokenInForExactTokenOut(
            pool?.token0,
            numToWei(1, pool.token0Decimals)        // 计算的是单价，不是总价
        )
        const price = new BigNumber(weiToNum(amountOut, pool.token1Decimals)).multipliedBy(currentPrice).dp(4).toString();     //amountOut乘以token1的价格
        return price;
    }

    useEffect(() => {
        if (auctionListData.length > 0) {
            Promise.all(
                auctionListData.map(async (pool) => {
                    const currentPrice = await getCurrentPrice(pool);
                    const isOpen = getIsOpen(pool?.startTs * 1000);
                    const token0 = {
                        address: pool.token0,
                        coinGeckoID: "",
                        decimals: pool?.token0Decimals,
                        largeURL: pool?.token0LargeURL,
                        name: pool?.token0Symbol,
                        smallURL: pool?.token0SmallURL,
                        symbol: pool?.token0Symbol,
                        thumbURL: pool?.token0ThumbURL,
                        chainId: chainId
                    }
                    const token1 = {
                        address: pool.token1,
                        coinGeckoID: "",
                        decimals: pool?.token1Decimals,
                        largeURL: pool?.token1LargeURL,
                        name: pool?.token1Symbol,
                        smallURL: pool?.token1SmallURL,
                        symbol: pool?.token1Symbol,
                        thumbURL: pool?.token1ThumbURL,
                        chainId: chainId
                    }
                    const swapAmount = new BigNumber(pool?.startAmountToken0)?.minus(new BigNumber(pool?.currentAmountToken0)).toString()

                    return {
                        status: isOpen ? ToLBPAuctionStatus[pool.status] : POOL_STATUS.COMING,
                        id: pool?.address?.slice(-6),
                        name: `${pool.token0Symbol} Launch Pool`,
                        address: pool.token0,
                        from: token0,
                        to: token1,
                        total: parseFloat(fromWei(pool?.startAmountToken0, token0.decimals).toFixed()),
                        price: currentPrice,
                        sold: parseFloat(fromWei(swapAmount, token0.decimals).toFixed()),
                        startTs: pool?.startTs,
                        endTs: pool?.endTs,
                        fill: getProgress(swapAmount, pool?.startAmountToken0, token0.decimals),
                        href: `/lbp/${pool?.address}`
                    };
                })
            ).then((info) => {
                setConvertedPoolInformation(info);
                setLoading(false);
            });
        } else {
            setConvertedPoolInformation(EMPTY_ARRAY);
            setLoading(false)
        }
    }, [auctionListData, pathname, type]);

    return <div className={styles.listBox}>
        <>
            {loading ? <Loading /> : <>
                {
                    convertedPoolInformation?.length > 0 ? (
                        <ul className={styles.list}>
                            {
                                convertedPoolInformation.map((auction) => (
                                    <li key={uid(auction)} className="animate__animated animate__flipInY">
                                        <Card {...auction}
                                            bordered
                                            isLbpCard
                                        />
                                    </li>
                                ))
                            }
                        </ul>
                    ) : <EmptyData data="No Pool" />
                }
            </>}
            {!loading && numberOfPages > 1 && (
                <Pagination
                    className={styles.pagination}
                    numberOfPages={numberOfPages}
                    currentPage={page}
                    onBack={() => setPage(page - 1)}
                    onNext={() => setPage(page + 1)}
                />
            )}
        </>

    </div>

}