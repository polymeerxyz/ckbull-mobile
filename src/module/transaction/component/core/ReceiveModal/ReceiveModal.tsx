import { Col, createBackdrop, ExposedBackdropProps, Typography, useToast } from "@peersyst/react-native-components";
import CardNavigatorModal from "module/common/component/navigation/CardNavigatorModal/CardNavigatorModal";
import { useTranslate } from "module/common/hook/useTranslate";
import QRCode from "module/transaction/component/display/QRCode/QRCode";
import useSelectedWallet from "module/wallet/hook/useSelectedWallet";
import { serviceInstancesMap } from "module/wallet/state/WalletState";
import useSelectedNetwork from "module/settings/hook/useSelectedNetwork";
import Button from "module/common/component/input/Button/Button";
import * as Clipboard from "expo-clipboard";
import Container from "module/common/component/display/Container/Container";

const ReceiveModal = createBackdrop<ExposedBackdropProps>(({ close, ...rest }) => {
    const t = useTranslate();
    const network = useSelectedNetwork();
    const { index } = useSelectedWallet();
    const serviceInstance = serviceInstancesMap.get(index)?.[network];
    const address = serviceInstance?.getAddress();
    const { showToast } = useToast();

    const copyToClipboard = () => {
        Clipboard.setString(address || "");
        showToast(t("address_copied"), { type: "success" });
        close();
    };

    return (
        <CardNavigatorModal navbar={{ back: true, title: t("receive") }} {...rest}>
            <Col gap={"8%"} flex={1} justifyContent="center">
                <QRCode />
                <Typography textAlign="center" variant="body3Regular">
                    {t("receive_info")}
                </Typography>
                <Container>
                    <Typography variant="body2Strong" textAlign="center" textTransform="uppercase">
                        {address}
                    </Typography>
                </Container>
                <Button variant="primary" fullWidth onPress={() => copyToClipboard()}>
                    {t("copy")}
                </Button>
            </Col>
        </CardNavigatorModal>
    );
});

export default ReceiveModal;
