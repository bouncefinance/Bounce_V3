import { MaybeWithClassName } from '@app/helper/react/types'
import React, { FC, ReactChild } from 'react'
import styles from './Confirmation.module.scss'
import arrow_down_img from './arrow_down.svg'

interface ISerialNoParams {
    children?: ReactChild,
    no: number,
    text: string,
    hasNext?: boolean
}

export const SerialNo: FC<ISerialNoParams & MaybeWithClassName> = ({
    children, no, text, hasNext
}) => {
    return (
        <div className={styles.SerialNo}>
            <div className={styles.row}>
                <div className={styles.no}>
                    {no}
                </div>
                <div className={styles.text}>
                    {text}
                </div>
            </div>

            {children}

            {hasNext && <div className={styles.arrowImg}>
                <img src={arrow_down_img} alt='' />
            </div>}
        </div>
    )
}
