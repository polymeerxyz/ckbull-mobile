import { Col, SwipeButton, Typography, useModal } from "@peersyst/react-native-components";
import { useRecoilValue } from "recoil";
import sendState from "module/transaction/state/SendState";
import useWalletState from "module/wallet/hook/useWalletState";
import SendSummary from "./SendSummary";
import { useTranslate } from "module/common/hook/useTranslate";
import useServiceInstance from "module/wallet/hook/useServiceInstance";
import { useSend } from "module/transaction/hook/useSend";
import SendModal from "module/transaction/component/core/SendModal/SendModal";
import CallbackModal from "module/common/component/feedback/SignModal/SignModal";
import useGetBalance from "module/wallet/query/useGetBalance";

const SendConfirmationScreen = (): JSX.Element => {
    const translate = useTranslate();
    const { amount, senderWalletIndex, receiver, receiverDomainAddress, message, asset, sendAllFunds } = useRecoilValue(sendState);
    const {
        state: { wallets },
    } = useWalletState();
    const senderWallet = wallets[senderWalletIndex!];
    const { name: senderName, index } = senderWallet;
    const { serviceInstance } = useServiceInstance(index);
    const { sendTransaction, ...restSendTransactionWithStatus } = useSend();
    const { hideModal } = useModal();

    const receiverAddress = receiverDomainAddress ? receiverDomainAddress.value : receiver!;

    function closeSendModal() {
        hideModal(SendModal.id);
    }

    const { data: { freeBalance = 0 } = {} } = useGetBalance(index);
    const amountToSend = sendAllFunds ? freeBalance : amount;
    return (
        <CallbackModal onSign={sendTransaction} {...restSendTransactionWithStatus} onError={closeSendModal} onExited={closeSendModal}>
            {({ showModal, isSuccess, isLoading }) => (
                <Col gap={24} onStartShouldSetResponder={() => true}>
                    <SendSummary
                        showTotal
                        amount={amountToSend!}
                        receiverAddress={receiverAddress!}
                        token={asset.ft}
                        nft={asset.nft}
                        message={message!}
                        senderName={senderName}
                        senderAddress={serviceInstance!.getAddress()}
                    />
                    <Typography variant="body3Light" textAlign="center" light>
                        {translate("send_confirmation_text")}
                    </Typography>
                    <SwipeButton loading={isLoading} disabled={isSuccess} onSwipe={showModal}>
                        {translate("confirm")}
                    </SwipeButton>
                </Col>
            )}
        </CallbackModal>
    );
};

export default SendConfirmationScreen;
