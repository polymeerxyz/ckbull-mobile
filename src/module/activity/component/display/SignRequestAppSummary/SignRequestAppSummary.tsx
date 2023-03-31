import { Col, Typography } from "@peersyst/react-native-components";
import { DAppImage } from "module/activity/component/display/SignRequestAppSummary/SignRequestAppSummary.styles";
import config from "config/config";
import WalletSelector from "module/wallet/component/input/WalletSelector/WalletSelector";
import { useTranslate } from "module/common/hook/useTranslate";

interface SignRequestAppSummaryProps {
    requestTitle: string;
    name: string | undefined;
    image: string | undefined;
    description: string | undefined;
    loading?: boolean;
    onWalletChange?: (walletId: number) => void;
    selectedWallet?: number;
}

export default function SignRequestAppSummary({
    requestTitle,
    name,
    image,
    description,
    loading = false,
    selectedWallet,
    onWalletChange,
}: SignRequestAppSummaryProps): JSX.Element {
    const translate = useTranslate();

    return (
        <Col gap={24} flex={1}>
            <Col gap={24} alignItems="center">
                <Typography variant="body2Strong" textAlign="center">
                    {requestTitle}
                </Typography>
                <DAppImage source={{ uri: image || config.defaultDAppImage }} />
                <Col alignItems="center">
                    <Typography variant="body3Strong" textAlign="center">
                        {name}
                    </Typography>
                    <Typography variant="body3Light" textAlign="center" light numberOfLines={1}>
                        {description}
                    </Typography>
                </Col>
            </Col>
            {selectedWallet !== undefined && onWalletChange && (
                <WalletSelector
                    label={translate("signWith")}
                    required
                    name="signer"
                    disabled={loading}
                    onChange={onWalletChange}
                    value={selectedWallet}
                />
            )}
        </Col>
    );
}