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
    const [alert, setAlert] = useState<AlertType | undefined>();
    const [newBalance, setNewBalance] = useState(0);
    const findToken = useTokenSearch();
    const web3 = useWeb3();
    const provider = useWeb3Provider();
    const { account } = useWeb3React();
    const tokenContract = getTokenContract(provider, tokenTo.address);
    const [blockStartRef, setBlockStartRef] = useState<HTMLElement | null>(null);
    const [blockEndRef, setBlockEndRef] = useState<HTMLElement | null>(null);

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
            getBalance(tokenContract, account).then((b) =>
                setNewBalance(parseFloat(fromWei(b, tokenFrom.decimals).toFixed(6, 1)))
            );
        } else {
            getEthBalance(web3, account).then((b) =>
                setNewBalance(parseFloat(fromWei(b, tokenFrom.decimals).toFixed(4, 1)))
            );
        }

        if (!isEth(tokenTo.address)) {
            getBalance(tokenContract, account).then((b) =>
                setNewBalance(parseFloat(fromWei(b, tokenTo.decimals).toFixed(6, 1)))
            );
        } else {
            getEthBalance(web3, account).then((b) =>
                setNewBalance(parseFloat(fromWei(b, tokenTo.decimals).toFixed(4, 1)))
            );
        }
    }, [web3, tokenContract, account, findToken, tokenTo]);

    return (
        <Form
            onSubmit={onSubmit}
            className={styles.form}
            initialValues={initialValues}
            validate={(values) => {
                return { tokenTo: isFromToTokensDifferent<string>(tokenFrom.address, tokenTo.address) };
            }}
        >
            <div className={styles.container}>
                <div className={styles.left}>
                    <FormSpy subscription={{ values: true }}>
                        {(props) => (
                            <Label
                                Component="label"
                                className={styles.row}
                                label="Launch Token Amount"
                                after={
                                    <span className={styles.balance}>
                                        Balance: {newBalance} <Symbol token={props.values.tokenTo} />
                                    </span>
                                }
                            >
                                <TextField
                                    type="number"
                                    name="amount"
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
                                                                "amount",
                                                                props.values.unitPrice
                                                                    ? (newBalance / props.values.unitPrice).toString()
                                                                    : 0
                                                            )
                                                        }
                                                        type="button"
                                                    >
                                                        MAX
                                                    </button>

                                                )}
                                            </FormSpy>
                                            <Currency token={tokenFrom.address} small />
                                        </div>
                                    }
                                    validate={composeValidators(isEqualZero, isValidWei)}
                                    required
                                />
                            </Label>
                        )}
                    </FormSpy>

                    <FormSpy subscription={{ values: true }}>
                        {(props) => (
                            <Label
                                Component="label"
                                className={styles.row}
                                label="Collected Token Amount"
                                after={
                                    <span className={styles.balance}>
                                        Balance: {newBalance} <Symbol token={props.values.tokenTo} />
                                    </span>
                                }
                            >
                                <TextField
                                    type="number"
                                    name="amount"
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
                                                                "amount",
                                                                props.values.unitPrice
                                                                    ? (newBalance / props.values.unitPrice).toString()
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
                                    validate={composeValidators(isEqualZero, isValidWei)}
                                    required
                                />
                            </Label>
                        )}
                    </FormSpy>

                    <div className={styles.selectTime}>
                        <div ref={setBlockStartRef}>
                            <Label Component="div" label="Start Time (Local Time)">
                                <DateField
                                    placeholder="10.01.2021"
                                    name="startPool"
                                    min={getDateIntervalStart(new Date()).toString()}
                                    dropdownWidth={`${100}px`}
                                    labels={["1. Choose start date", "2. Choose start time"]}
                                    quickNav={["today", "tomorrow", "in-2-days"]}
                                    required
                                />
                            </Label>
                        </div>

                        <div ref={setBlockEndRef}>
                            <Label Component="div" label="Start Time (Local Time)">
                                <DateField
                                    placeholder="10.01.2021"
                                    name="startPool"
                                    min={getDateIntervalStart(new Date()).toString()}
                                    dropdownWidth={`${100}px`}
                                    labels={["1. Choose start date", "2. Choose start time"]}
                                    quickNav={["today", "tomorrow", "in-2-days"]}
                                    required
                                />
                            </Label>
                        </div>
                    </div>

                    <div className="weightSlider">
                        <Label Component="div" label="Start Time (Local Time)">
                            <SliderField name={"startSlider"} labels={[]} />
                        </Label>

                        <Label Component="div" label="Start Time (Local Time)">
                            <SliderField name={"endSlider"} labels={[]} />
                        </Label>
                    </div>
                </div>

                <div className="right">
                    <Charts />
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