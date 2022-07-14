import { useWeb3React } from "@web3-react/core";
import { FC, useEffect, useState } from "react";
import { FormSpy } from "react-final-form";
import { Symbol } from "@app/modules/symbol";
import { MaybeWithClassName } from "@app/helper/react/types";
import { Form } from "@app/modules/form";

import { ALERT_TYPE } from "@app/ui/alert";
import { PrimaryButton } from "@app/ui/button";
import { RightArrow2 } from "@app/ui/icons/arrow-right-2";

import { fromWei } from "@app/utils/bn/wei";
import {
    composeValidators,
    isEnoughBalance,
    isEqualZero,
    isFromToTokensDifferent,
    isValidWei,
} from "@app/utils/validation";
import { getBalance, getEthBalance, getTokenContract } from "@app/web3/api/bounce/erc";
import { isEth } from "@app/web3/api/eth/use-eth";
import { useTokenSearch } from "@app/web3/api/tokens";
import { useWeb3, useWeb3Provider } from "@app/web3/hooks/use-web3";

import styles from "./lbpParameters.module.scss";
import { Label } from "@app/modules/label";
import { TextField } from "@app/modules/text-field";
import { Currency } from "@app/modules/currency";
import { DateField } from "@app/modules/date-field";
import { SliderField } from "@app/modules/slider-field";
import { Charts } from "./Charts";
import { TokenInfo } from "@uniswap/token-lists";
import moment from "moment";

type BuyingViewType = {
    onSubmit(values): void;
    tokenFrom: TokenInfo;
    tokenTo: TokenInfo;
    initialValues: any;
};

const FLOAT = "0.0001";

export const LbpParametersView: FC<MaybeWithClassName & BuyingViewType> = ({
    onSubmit,
    tokenFrom,
    tokenTo,
    initialValues,
}) => {
    const [newBalanceFrom, setNewBalanceFrom] = useState(0);
    const [newBalanceTo, setNewBalanceTo] = useState(0);
    const findToken = useTokenSearch();
    const web3 = useWeb3();
    const provider = useWeb3Provider();
    const { account } = useWeb3React();
    const [blockStartRef, setBlockStartRef] = useState<HTMLElement | null>(null);
    const [blockEndRef, setBlockEndRef] = useState<HTMLElement | null>(null);
    const [startWeight, setStartWeight] = useState(initialValues.startWeight || 80)
    const [endWeight, setEndWeight] = useState(initialValues.endWeight || 50)

    type AlertType = {
        title: string;
        text: string;
        type: ALERT_TYPE;
    };

    useEffect(() => {
        if (!tokenFrom || !tokenTo) {
            return;
        }
        if (!isEth(tokenFrom.address)) {
            getBalance(getTokenContract(provider, tokenFrom.address), account).then((b) =>
                setNewBalanceFrom(parseFloat(fromWei(b, tokenFrom.decimals).toFixed(6, 1)))
            );
        } else {
            getEthBalance(web3, account).then((b) =>
                setNewBalanceFrom(parseFloat(fromWei(b, tokenFrom.decimals).toFixed(4, 1)))
            );
        }

        if (!isEth(tokenTo.address)) {
            getBalance(getTokenContract(provider, tokenTo.address), account).then((b) =>
                setNewBalanceTo(parseFloat(fromWei(b, tokenTo.decimals).toFixed(6, 1)))
            );
        } else {
            getEthBalance(web3, account).then((b) =>
                setNewBalanceTo(parseFloat(fromWei(b, tokenTo.decimals).toFixed(4, 1)))
            );
        }
    }, [web3, getTokenContract, account, findToken, tokenTo]);

    const handleSubmit = (values: any) => {
        onSubmit({
            ...values,
            startWeight: startWeight,
            endWeight: endWeight
        })
    }

    return (
        <Form
            onSubmit={handleSubmit}
            className={styles.form}
            initialValues={initialValues}
        >
            <div className={styles.container}>
                <div className={styles.left}>
                    <FormSpy subscription={{ values: true }}>
                        {(props) => {

                            console.log('数据', props.values)

                            return (
                                <Label
                                    Component="label"
                                    className={styles.row}
                                    label="Launch Token Amount"
                                    after={
                                        <span className={styles.balance}>
                                            Balance: {newBalanceFrom} <Symbol token={props.values.tokenTo} />
                                        </span>
                                    }
                                >
                                    <TextField
                                        type="number"
                                        name="amountFrom"
                                        placeholder="0.00"
                                        step={FLOAT}
                                        after={
                                            <div className={styles.amount}>
                                                <FormSpy>
                                                    {({ form }) => (
                                                        <button
                                                            className={styles.max}
                                                            onClick={() => {
                                                                form.change(
                                                                    "amountFrom",
                                                                    newBalanceFrom
                                                                        ? newBalanceFrom.toString()
                                                                        : 0
                                                                )
                                                            }
                                                            }
                                                            type="button"
                                                        >
                                                            MAX
                                                        </button>
    
                                                    )}
                                                </FormSpy>
                                                {
                                                    <Currency coin={tokenFrom} small />
                                                }
                                            </div>
                                        }
                                        validate={composeValidators(isEqualZero, isValidWei, 
                                            isEnoughBalance(newBalanceFrom)
                                            )}
                                        required
                                    />
                                </Label>
                            )
                        }}
                    </FormSpy>

                    <FormSpy subscription={{ values: true }}>
                        {(props) => (
                            <Label
                                Component="label"
                                className={styles.row}
                                label="Collected Token Amount"
                                after={
                                    <span className={styles.balance}>
                                        Balance: {newBalanceTo} <Symbol token={props.values.tokenTo} />
                                    </span>
                                }
                            >
                                <TextField
                                    type="number"
                                    name="amountTo"
                                    placeholder="0.00"
                                    step={FLOAT}
                                    after={
                                        <div className={styles.amount}>
                                            <FormSpy>
                                                {({ form }) => (
                                                    <button
                                                        className={styles.max}
                                                        onClick={() =>
                                                            form.change(
                                                                "amountTo",
                                                                newBalanceTo
                                                                    ? newBalanceTo.toString()
                                                                    : 0
                                                            )
                                                        }
                                                        type="button"
                                                    >
                                                        MAX
                                                    </button>
                                                )}
                                            </FormSpy>
                                            <Currency token={tokenTo.address} small />
                                        </div>
                                    }
                                    validate={composeValidators(isEqualZero, isValidWei, 
                                        isEnoughBalance(newBalanceTo)
                                        )}
                                    required
                                />
                            </Label>
                        )}
                    </FormSpy>

                    <div className={styles.selectTime}>
                        <div ref={setBlockStartRef}>
                            <Label Component="div" label="Start Time (Local Time)">
                                <DateField
                                    placeholder={moment().format('MM.DD.YYYY HH:MM')}
                                    name="startDate"
                                    min={getDateIntervalStart(new Date()).toString()}
                                    dropdownWidth={`${100}px`}
                                    labels={["1. Choose start date", "2. Choose start time"]}
                                    quickNav={["today", "tomorrow", "in-2-days"]}
                                    required
                                    nowTime
                                />
                            </Label>
                        </div>

                        <div ref={setBlockEndRef}>
                            <Label Component="div" label="End Time (Local Time)">
                                <DateField
                                    placeholder={moment(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 3)).format('MM.DD.YYYY HH:MM')}
                                    name="endDate"
                                    min={getDateIntervalStart(new Date()).toString()}
                                    dropdownWidth={`${100}px`}
                                    labels={["1. Choose start date", "2. Choose start time"]}
                                    quickNav={["today", "tomorrow", "in-2-days"]}
                                    required
                                    
                                />
                            </Label>
                        </div>
                    </div>

                    <FormSpy>
                        {({ form }) => {
                            return <div className="weightSlider">
                                <Label Component="div" label="Starting Weights (Price Ceiling)">
                                    <div className={styles.weightView}>
                                        <Currency token={tokenFrom.address} small />
                                        <Currency token={tokenTo.address} small />
                                    </div>
                                    <SliderField value={startWeight} setValue={setStartWeight} onChange={(newValue: number) => {
                                        if (newValue < endWeight) {
                                            setEndWeight(newValue)
                                        }
                                    }} />
                                </Label>

                                <Label Component="div" label="End Weights">
                                    <div className={styles.weightView}>
                                        <Currency token={tokenFrom.address} small />
                                        <Currency token={tokenTo.address} small />
                                    </div>
                                    <SliderField value={endWeight} setValue={setEndWeight} onChange={(newValue: number) => {
                                        if (newValue > startWeight) {
                                            setStartWeight(newValue)
                                        }
                                    }} />
                                </Label>
                            </div>
                        }}
                    </FormSpy>
                </div>

                <div className="right">
                    <FormSpy>
                        {(form) => (
                            <Charts
                                amountTokenFrom={form.values.amountFrom}
                                amountTokenTo={form.values.amountTo}
                                startWeight={startWeight}
                                endWeight={endWeight}
                                startDate={form.values.startDate}
                                endDate={form.values.endDate}
                            />
                        )}
                    </FormSpy>

                </div>
            </div>

            <FormSpy>
                {(form) => (
                    <PrimaryButton
                        className={styles.submit}
                        size="large"
                        iconAfter={<RightArrow2 width={18} style={{ marginLeft: 12 }} />}
                        submit
                    >
                        {initialValues.amount && form.dirty ? "Save" : "Next Step"}
                    </PrimaryButton>
                )}
            </FormSpy>
        </Form>
    );
};

const getDateIntervalStart = (from: Date) => {
    return new Date(from.getFullYear(), from.getMonth(), from.getDate());
};
