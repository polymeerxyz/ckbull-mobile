import { Col, Form, PressableText, Typography, useSetTab, useToast } from "@peersyst/react-native-components";
import Button from "module/common/component/input/Button/Button";
import sendRecoilState from "module/transaction/state/SendState";
import { useState } from "react";
import { SendScreens } from "module/transaction/component/core/SendModal/SendModal";
import { useRecoilState } from "recoil";
import WalletSelector from "module/wallet/component/input/WalletSelector/WalletSelector";
import useUncommittedTransaction from "module/transaction/hook/useUncommittedTransaction";
import useSelectedNetwork from "module/settings/hook/useSelectedNetwork";
import { useTranslate } from "module/common/hook/useTranslate";
import QrScanner from "module/common/component/input/QrScanner/QrScanner";
import TextFieldAddressOrDomain from "module/transaction/component/input/TextFieldAddressOrDomain/TextFieldAddressOrDomain";

export interface SendForm {
    sender: number;
    receiver: string;
}

const SendToAddressScreen = () => {
    const translate = useTranslate();
    const [sendState, setSendState] = useRecoilState(sendRecoilState);
    const [receiverAddress, setReceiverAddress] = useState(sendState.receiverAddress || "");
    const [scanQr, setScanQr] = useState(false);
    const [domain, setDomain] = useState("");

    const { showToast, hideToast } = useToast();
    const setTab = useSetTab();
    const uncommittedTransaction = useUncommittedTransaction();
    const network = useSelectedNetwork();

    const handleAddressScan = (data: string) => {
        setReceiverAddress(data);
        showToast(translate("scanned_address", { address: data }), {
            type: "success",
            duration: 10000,
            action: (
                <PressableText variant="body1" fontWeight="bold" onPress={hideToast}>
                    {translate("dismiss")}
                </PressableText>
            ),
        });
    };

    const handleSenderChange = (sender: number) => {
        setSendState((oldState) => ({ ...oldState, senderWalletIndex: sender }));
    };

    const handleSubmit = ({ sender, receiver }: SendForm) => {
        setSendState((oldState) => ({ ...oldState, senderWalletIndex: sender, receiverAddress: receiver }));
        setTab(SendScreens.AMOUNT_AND_MESSAGE);
    };

    const handleChipAddressPress = (domain: string, sender: number) => {
        setSendState((oldState) => ({
            ...oldState,
            domain,
            senderWalletIndex: sender || 0,
        }));
        setTab(SendScreens.SELECT_ADDRESS);
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Col gap={24}>
                    <WalletSelector
                        label={translate("select_a_wallet")}
                        required
                        name="sender"
                        onChange={handleSenderChange}
                        defaultValue={sendState.senderWalletIndex}
                    />
                    <TextFieldAddressOrDomain
                        label={translate("send_to")}
                        placeholder={translate("address")}
                        name="receiver"
                        validators={{ address: network }}
                        value={receiverAddress}
                        onChange={setReceiverAddress}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ component: { backgroundColor: "transparent" } }}
                        domain={domain}
                        onDomainChange={setDomain}
                        onScanQr={() => setScanQr(true)}
                        onAddressDomainChipPress={handleChipAddressPress}
                    />
                    <Col gap="5%">
                        {uncommittedTransaction && (
                            <Typography variant="body2" textAlign="center">
                                {translate("pending_transaction_text")}
                            </Typography>
                        )}
                        <Button type="submit" variant="primary" fullWidth disabled={uncommittedTransaction}>
                            {translate("next")}
                        </Button>
                    </Col>
                </Col>
            </Form>
            {scanQr && <QrScanner open={scanQr} onClose={() => setScanQr(false)} onScan={({ data }) => handleAddressScan(data)} />}
        </>
    );
};

export default SendToAddressScreen;
