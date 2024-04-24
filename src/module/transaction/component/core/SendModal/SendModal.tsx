import { createBackdrop, ExposedBackdropProps, TabPanel, Tabs } from "@peersyst/react-native-components";
import SendToAddressScreen from "module/transaction/screen/SendToAddressScreen/SendToAddressScreen";
import { useState } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import defaultSendState from "module/transaction/state/SendState";
import SendConfirmationScreen from "module/transaction/screen/SendConfirmationScreen/SendConfirmationScreen";
import SendSetAmountScreen from "module/transaction/screen/SendSetAmountScreen/SendSetAmountScreen";
import { useTranslate } from "module/common/hook/useTranslate";
import CardNavigatorModal from "module/common/component/navigation/CardNavigatorModal/CardNavigatorModal";
import SendSelectAddressScreen from "module/transaction/screen/SendSelectAddressScreen/SendSelectAddressScreen";
import sendRecoilState from "module/transaction/state/SendState";

export enum SendScreens {
    SEND_TO_ADDRESS,
    SELECT_ADDRESS,
    AMOUNT_AND_MESSAGE,
    CONFIRMATION,
}

const SendModal = createBackdrop(({ onExited, ...rest }: ExposedBackdropProps) => {
    const [activeIndex, setActiveIndex] = useState(SendScreens.SEND_TO_ADDRESS);
    const [sendState] = useRecoilState(sendRecoilState);
    const resetSendState = useResetRecoilState(defaultSendState);
    const translate = useTranslate();
    const handleExited = () => {
        onExited?.();
        resetSendState();
    };

    const handleIndexChange = (index: SendScreens) => {
        setActiveIndex((oldIndex) => {
            if (sendState.domain && index === SendScreens.AMOUNT_AND_MESSAGE) {
                return oldIndex - 1;
            } else {
                if (index !== SendScreens.AMOUNT_AND_MESSAGE) {
                    return oldIndex - 1;
                } else {
                    return oldIndex - 2;
                }
            }
        });
    };

    return (
        <CardNavigatorModal
            navbar={{
                back: true,
                title: translate("send")!,
                onBack: activeIndex > 0 ? () => handleIndexChange(activeIndex) : undefined,
                steps: {
                    length: 4,
                    index: activeIndex,
                },
            }}
            onExited={handleExited}
            {...rest}
        >
            <Tabs index={activeIndex} onIndexChange={setActiveIndex}>
                <TabPanel index={SendScreens.SEND_TO_ADDRESS}>
                    <SendToAddressScreen />
                </TabPanel>
                <TabPanel index={SendScreens.SELECT_ADDRESS}>
                    <SendSelectAddressScreen />
                </TabPanel>
                <TabPanel index={SendScreens.AMOUNT_AND_MESSAGE}>
                    <SendSetAmountScreen />
                </TabPanel>
                <TabPanel index={SendScreens.CONFIRMATION}>
                    <SendConfirmationScreen />
                </TabPanel>
            </Tabs>
        </CardNavigatorModal>
    );
});

export default SendModal;
