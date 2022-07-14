import { LBP_PATH } from '@app/const/const'
import { MaybeWithClassName } from '@app/helper/react/types'
import { Button, NavLink } from '@app/ui/button'
import { GutterBox } from '@app/ui/gutter-box'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import React, { FC } from 'react'
import { uid } from 'react-uid'
import { LBPAuctionList } from './components/AuctionList/AuctionList'
import { Banner } from './components/Banner/Banner'
import styles from './Lbp.module.scss'
import { LiveLBP } from './Live'
import { UpcomingLBP } from './Upcoming'



type TabType = "all" | "live" | "upcoming" | "closed";

const tabsConfig: {
    tab: TabType
    name: string
    href: string
    hoverClassName: string
    activeClassName: string
}[] = [{
    tab: 'all',
    name: 'ALL',
    href: `${LBP_PATH}`,
    hoverClassName: '',
    activeClassName: ''
}, {
    tab: 'live',
    name: 'Live',
    href: `${LBP_PATH}/live`,
    hoverClassName: styles.liveHover,
    activeClassName: styles.liveActive
}, {
    tab: 'upcoming',
    name: 'Upcoming',
    href: `${LBP_PATH}/upcoming`,
    hoverClassName: styles.upcomingHover,
    activeClassName: styles.upcomingActive
}]

interface LbpType {
    type: TabType
}

export const LbpView: FC<LbpType & MaybeWithClassName> = ({type, className}) => {

    const history = useRouter()
    const handleCreat = () => {
        history.push('/create/lbp')
    }


    return (
        <div className={styles.container}>
            <GutterBox>
                <Banner />
                <div className={styles.listTitle}>
                    <div className={styles.launch}>Token Launch Auctions</div>
                    <Button size="medium" variant="outlined" color="primary-white" onClick={handleCreat}>
                        Create Auction
                    </Button>
                </div>
                <div className={styles.auctionListBox}>
                    <div className={styles.tabs}>
                        {tabsConfig.map(item => {
                            return <div key={uid(item)}>
                                <NavLink
                                    className={classNames(styles.tab, item?.hoverClassName) }
                                    activeClassName={classNames(styles.active, item?.activeClassName) }
                                    href={item.href}
                                    weight="bold"
                                    exact
                                >
                                    {item.name}
                                </NavLink>
                            </div>
                        })}

                    </div>
                    <div>
                        {type === "all" && <LBPAuctionList type={type}/>}
                        {type === 'live' && <LiveLBP />}
                        {type === "upcoming" && <UpcomingLBP />}
                    </div>
                </div>
            </GutterBox>
        </div>
    )
}