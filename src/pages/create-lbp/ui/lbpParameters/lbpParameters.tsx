import { defineFlowStep } from '@app/modules/flow/definition';
import { useFlowControl, useFlowData } from '@app/modules/flow/hooks';
import { TokenInfo } from '@uniswap/token-lists';
import { useMemo } from 'react';
import { LbpParametersView } from './LbpParametersView';


type ParameterInType = {
    tokenFrom: TokenInfo
    tokenTo: TokenInfo
    tokenFromImg: string
};

export type ParameterOutType = {
    amountFrom: number,
    amountTo: number,
    startDate: Date,
    endDate: Date,
    startWeight: number,
    endWeight: number
};

const LbpParameterImp = () => {
    const { moveForward, addData, data } = useFlowControl<ParameterOutType>();
    const { tokenFrom, tokenTo, tokenFromImg } = useFlowData<ParameterInType>();

    const initialValues = useMemo(
        () => {
            return {
                tokenFromImg: tokenFromImg,
                amountFrom: data.amountFrom,
                amountTo: data.amountTo,
                startDate: data.startDate,
                endDate: data.endDate,
                startWeight: data.startWeight,
                endWeight: data.endWeight
            }
        }, []
    );

    const onSubmit = async (values: any) => {
        addData({
            amountFrom: values.amountFrom,
            amountTo: values.amountTo,
            startDate: values.startDate,
            endDate: values.endDate,
            startWeight: values.startWeight,
            endWeight: values.endWeight
        });

        moveForward();
    };

    return (
        <LbpParametersView
            onSubmit={onSubmit}
            tokenFrom={tokenFrom}
            tokenTo={tokenTo}
            initialValues={initialValues}
        />
    );
};


export const lbpParameters = defineFlowStep<ParameterInType, ParameterOutType, {}>({
    Body: LbpParameterImp,
});

