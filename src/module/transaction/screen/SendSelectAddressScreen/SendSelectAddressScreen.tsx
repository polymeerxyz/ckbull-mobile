import { Col, Typography, useSetTab } from "@peersyst/react-native-components";
import { useTranslate } from "module/common/hook/useTranslate";
import { useRecoilState } from "recoil";
import sendRecoilState from "module/transaction/state/SendState";
import useGetAddressFromDomain from "module/common/hook/useGetAddressFromDomain";
import SelectAddressOfDomain from "module/transaction/component/input/SelectAddressOfDomain/SelectAddressOfDomain";
import Button from "module/common/component/input/Button/Button";
import { SendScreens } from "module/transaction/component/core/SendModal/SendModal";

const SendSelectAddressScreen = () => {
    const translate = useTranslate();
    const [sendState, setSendState] = useRecoilState(sendRecoilState);
    const { data: addresses } = useGetAddressFromDomain(sendState.domain || "");
    const setTab = useSetTab();

    const handleSelectAddress = (address: string) => {
        setSendState((oldState) => ({
            ...oldState,
            addressDomain: address,
        }));
    };

    const handleNext = () => {
        setTab(SendScreens.AMOUNT_AND_MESSAGE);
    };

    return (
        <Col gap={24}>
            <Typography variant="body3Light">
                {translate("selectAddressOfDomain", { count: addresses?.length, domain: sendState.domain })}
            </Typography>
            <SelectAddressOfDomain addresses={addresses} onChange={handleSelectAddress} selected={sendState.addressDomain} />
            <Button variant="primary" fullWidth disabled={sendState.addressDomain === undefined} onPress={handleNext}>
                {translate("next")}
            </Button>
        </Col>
    );
};

export default SendSelectAddressScreen;
