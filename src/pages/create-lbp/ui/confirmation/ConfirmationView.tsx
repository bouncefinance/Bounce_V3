import { MaybeWithClassName } from '@app/helper/react/types';
import { Button, CommonType, PrimaryButton } from '@app/ui/button/Button';
import { DescriptionList } from '@app/ui/description-list';
import { Spinner } from '@app/ui/spinner';
import { Heading3 } from '@app/ui/typography';
import { TokenInfo } from '@uniswap/token-lists';
import classNames from 'classnames';
import React, { Children, FC, ReactChild, ReactNode, useEffect, useState } from 'react'
import styles from './Confirmation.module.scss'

type ConfirmationType = {
    // chaildren: ReactChild
    name?: string;
    launchToken: ReactNode
    contactAddress: string
    collectedToken: ReactNode
    tokenLaunchDescription: string
    tradingFee: string
    poolDuration: string
    amount: ReactNode
    weights: ReactNode,
    tokenFrom?: TokenInfo
};

export const ConfirmationView: FC<MaybeWithClassName & ConfirmationType & CommonType> = ({
    className,
    launchToken,
    contactAddress,
    collectedToken,
    tokenLaunchDescription,
    tradingFee,
    poolDuration,
    amount,
    weights,
    tokenFrom,
    children
}) => {
    const TOKEN_DATA = {
        "Launch Token": launchToken,
        "Contact address": contactAddress,
        "Collected Token": collectedToken,
    };

    const PARAMETERS_DATA = {
        "Token Launch Description": tokenLaunchDescription,
        "Trading Fee (%)": tradingFee
    };

    const SETTINGS_DATA = {
        'Pool Duration': poolDuration,
        "Amount": amount,
        'Weights': weights
    };

    return (
        <div className={classNames(className, styles.component)}>
            <Heading3 className={styles.subTitle}>{`${tokenFrom?.symbol} Token Launch Auction Pool`}</Heading3>
            <div className={styles.body}>
                <div className={styles.leftInfo}>
                    <div className={styles.wrapperBox}>
                        <DescriptionList title="Token Information" data={TOKEN_DATA} />
                    </div>
                    <div className={styles.wrapperBox}>

                        <DescriptionList title="OTC Parameters" data={PARAMETERS_DATA} />
                    </div>
                    <div className={styles.wrapperBox}>

                        <DescriptionList title="Advanced Setting" data={SETTINGS_DATA} />
                    </div>
                </div>
                <div className={styles.rightOption}>
                    {children}
                </div>
            </div>
        </div>
    );
};