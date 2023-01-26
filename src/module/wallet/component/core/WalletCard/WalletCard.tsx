import useGetBalance from "module/wallet/query/useGetBalance";
import { Wallet } from "module/wallet/state/WalletState";
import WalletCardButtons from "./WalletCardButtons/WalletCardButtons";
import settingsState from "module/settings/state/SettingsState";
import { useRecoilValue } from "recoil";
import { useState } from "react";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import Balance from "../../display/Balance/Balance";
import Typography from "module/common/component/display/Typography/Typography";
import { Col } from "@peersyst/react-native-components";
import { BaseWalletCardRoot } from "module/common/component/surface/BaseWalletCard/BaseWalletCard.styles";

export interface WalletCardProps {
    wallet: Wallet;
}

const WalletCard = ({ wallet: { name, index, synchronizing } }: WalletCardProps): JSX.Element => {
    const { fiat } = useRecoilValue(settingsState);
    const { data: { freeBalance } = {} } = useGetBalance(index);
    const [showFiat, setCurrencyMode] = useState<boolean>(false);
    const changeCurrencyMode = () => {
        impactAsync(ImpactFeedbackStyle.Medium);
        setCurrencyMode((value) => !value);
    };

    return (
        <BaseWalletCardRoot>
            <Col style={{ width: "100%" }} alignItems="center" gap={10}>
                <Typography color={(p) => p.white} variant="body2Strong">
                    {name}
                </Typography>
                <Balance
                    textAlign="center"
                    style={{ width: "100%" }}
                    isLoading={synchronizing}
                    options={{ maximumFractionDigits: 2 }}
                    spinnerProps={{ color: (p) => p.white, size: 42 }}
                    onPress={changeCurrencyMode}
                    balance={showFiat ? "10" : freeBalance || 0}
                    variant="h1Strong"
                    color={(p) => p.white}
                    units={showFiat ? fiat : "token"}
                    unitsPosition={showFiat ? "left" : "right"}
                />
            </Col>
            <WalletCardButtons />
        </BaseWalletCardRoot>
    );
};

export default WalletCard;
