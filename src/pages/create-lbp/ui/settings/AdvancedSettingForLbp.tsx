import { FC } from "react";
import { FormSpy } from "react-final-form";
import { MaybeWithClassName } from "@app/helper/react/types";
import { Form } from "@app/modules/form";
import { PrimaryButton } from "@app/ui/button";
import { RightArrow2 } from "@app/ui/icons/arrow-right-2";
import styles from "./setting.module.scss";
import { Label } from "@app/modules/label";
import { TextArea } from "@app/modules/text-area";
import { TextField } from "@app/modules/text-field";
import { RadioField } from "@app/modules/radio-field";
import { RadioGroup } from "@app/ui/radio-group";

type SettingViewType = {
    onSubmit(values: any): void;
    initialValues: any;
};

export const AdvancedSettingForLbp: FC<MaybeWithClassName & SettingViewType> = ({
    onSubmit,
    initialValues,
}) => {
    return (
        <Form
            onSubmit={onSubmit}
            className={styles.form}
            initialValues={{
                ...initialValues,
                Radio_1: 1,
                Radio_2: 1,
                Radio_3: 1,
            }}
        >

            <Label Component="label" className={styles.label} label="Token Launch Description">
                <TextArea
                    type="text"
                    name="description"
                    placeholder="Enter pool description (less than 2000 words)."
                    maxLength={2000}
                    className={styles.description}
                    required
                />
            </Label>

            <div className={styles.Secondary}>
                <Label Component="label" className={styles.label} label="Learn More Link">
                    <TextField
                        type="text"
                        name="socialLink"
                        placeholder="Enter a URL"
                        maxLength={100}
                    />
                    <p>Please enter a valid URL that starts with http:// or https://</p>
                </Label>
                <Label Component="label" className={styles.label} label="Trading Fee (%)">
                    <TextField
                        type="number"
                        name="tradingFee"
                        placeholder="1.00"
                        hasTip={true}
                        required
                        validate={(value: string)=>{
                            const num = Number(value)
                            if(!num){
                                return 'You have entered a non-numeric'
                            }
                            if(num < 1 || num > 3){
                                return 'Please enter a number from 1 % to 3 %'
                            }
                        }}
                    />
                    <p>Recommend to enter a trading fee between 1% - 3%.</p>
                </Label>
            </div>

            <div className={styles.radioBox}>
                <Label Component="div" label="Select Creation Typedsada">
                    <RadioGroup count={3}>
                        <RadioField
                            name="Radio_1"
                            label="Can pause the auction"
                            value={1}
                        // checked={true}
                        />
                        <RadioField
                            name="Radio_2"
                            label="Manually open the contract, more safer"
                            value={1}
                        />

                        <RadioField
                            name="Radio_3"
                            label="Custom weights and swap fees"
                            value={1}
                        />
                    </RadioGroup>
                </Label>
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
