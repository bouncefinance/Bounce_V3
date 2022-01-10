import { Button } from '@app/ui/button'
import { ListItem, ListItemSecondaryAction, ListItemText, Switch } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import React, { useState } from 'react'
import styles from './ExtensionInfo.module.scss'


const useStyles = makeStyles({
    root: {
        '.MuiSwitch-colorPrimary.Mui-checked': {
            color: '#000'
        }
    }
})

export const AuctionSettingView = (props: any) => {
    const [isEnabled, setIsEnabled] = useState(false)
    const classes = useStyles(props);

    return (
        <div>
            <div className={styles.centerWrapper}>
                <h4>Trading Status</h4>
                <div className={styles.enabled}>
                    <ListItem>
                        <p>Buy/Sell function is enabled</p>
                        <ListItemSecondaryAction>
                            <Switch
                                color='primary'
                                classes={classes}
                                size='medium'
                                edge="end"
                                onChange={() => {
                                    setIsEnabled(!isEnabled)
                                }}
                                checked={isEnabled}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                </div>

                <h4>Pool Balances</h4>
                <div className={styles.poolCard}>
                    <div>
                        <h5>Current Balances</h5>
                        <p>
                            120000.00 ETH
                            <br />
                            9000000.00 MONICA
                        </p>

                        <h5>Swap Fees Collected By Project</h5>
                        <p>
                            50.00 ETH
                        </p>
                    </div>
                    <div className={styles.poolCardRight}>
                        <Button className={styles.withdrawBtn} color='primary-black' variant='contained'>
                            Withdraw All
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

