import { useSetRecoilState } from "recoil";
import walletState from "module/wallet/state/WalletState";
import Button from "module/common/component/input/Button/Button";
import { WalletStorage } from "module/wallet/WalletStorage";
import { translate } from "locale";
import BaseMainScreen from "module/main/component/layout/BaseMainScreen/BaseMainScreen";
import CardBackgroundWrapper from "module/common/component/surface/CardBackgroundWrapper/CardBackgroundWrapper";
import SelectGroup from "module/common/component/input/SelectGroup/SelectGroup";
import { Alert } from "react-native";

const SettingsScreen = (): JSX.Element => {
    const setWalletState = useSetRecoilState(walletState);
    const options = ["testnet", "mainnet"];

    return (
        <BaseMainScreen title={translate("settings")} back={false}>
            <CardBackgroundWrapper>
                <SelectGroup
                    options={options}
                    label={translate("select_your_network")}
                    onChange={(value) => Alert.alert(`Switched to ${value} network`)}
                />
                <Button onPress={() => setWalletState((state) => ({ ...state, isAuthenticated: false }))}>Log out</Button>
                <Button
                    onPress={async () => {
                        await WalletStorage.clear();
                        setWalletState((state) => ({
                            ...state,
                            isAuthenticated: false,
                            hasWallet: false,
                            name: undefined,
                            selectedAccount: undefined,
                        }));
                    }}
                >
                    Erase
                </Button>
            </CardBackgroundWrapper>
        </BaseMainScreen>
    );
};

export default SettingsScreen;