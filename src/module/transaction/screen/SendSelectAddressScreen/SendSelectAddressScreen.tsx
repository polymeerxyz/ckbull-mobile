import { Col, Spinner, Typography, useSetTab } from "@peersyst/react-native-components";
import { useTranslate } from "module/common/hook/useTranslate";
import { useRecoilState } from "recoil";
import sendRecoilState from "module/transaction/state/SendState";
import useGetAddressFromDomain from "module/common/hook/useGetAddressFromDomain";
import Button from "module/common/component/input/Button/Button";
import { SendScreens } from "module/transaction/component/core/SendModal/SendModal";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";
import AddressOfDomainSelect from "module/transaction/component/input/AddressOfDomainSelect/AddressOfDomainSelect";

const SendSelectAddressScreen = () => {
    const translate = useTranslate();
    const [sendState, setSendState] = useRecoilState(sendRecoilState);
    const { data: addresses, isLoading } = useGetAddressFromDomain(sendState.receiver!);
    const setTab = useSetTab();

    const handleSelectAddress = (address: BitAccountRecordAddress) => {
        setSendState((oldState) => ({
            ...oldState,
            receiverDomainAddress: address,
        }));
    };

    const handleNext = () => {
        setTab(SendScreens.AMOUNT_AND_MESSAGE);
    };

    return (
        <Col gap={24}>
            <Typography variant="body3Light">
                {translate("selectAddressOfDomain", { count: addresses?.length, domain: sendState.receiver })}
            </Typography>
            {isLoading && <Spinner />}
            <AddressOfDomainSelect addresses={addresses} onChange={handleSelectAddress} selected={sendState.receiverDomainAddress} />
            <Button variant="primary" fullWidth disabled={sendState.receiverDomainAddress === undefined} onPress={handleNext}>
                {translate("next")}
            </Button>
        </Col>
    );
};

export default SendSelectAddressScreen;
