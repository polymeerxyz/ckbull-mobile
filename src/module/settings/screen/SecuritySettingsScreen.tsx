import { translate } from "locale";
import Button from "module/common/component/input/Button/Button";
import BaseSecondaryScreen from "module/common/component/layout/BaseSecondaryScreen/BaseSecondaryScreen";
import { BottomTabScreenNavigatonProps } from "module/main/component/navigation/MainBottomNavigatorGroup/MainBottomNavigatorGroup.types";
import useCreateWallet from "module/wallet/hook/useCreateWallet";
import walletState from "module/wallet/state/WalletState";
import { WalletStorage } from "module/wallet/WalletStorage";
import { useEffect } from "react";
import { Col, useToast } from "react-native-components";
import { useRecoilState, useSetRecoilState } from "recoil";
import pinConfirmedState from "../state/PinConfirmedState";

const GeneralSettingsScreen = ({ navigation }: BottomTabScreenNavigatonProps): JSX.Element => {
    const setWalletState = useSetRecoilState(walletState);
    const {
        state: { pin },
    } = useCreateWallet();
    const [pinConfirmed, setPinConfirmedState] = useRecoilState(pinConfirmedState);
    const { showToast } = useToast();

    useEffect(() => {
        const updatePin = async () => {
            const storedWallet = await WalletStorage.get();
            await WalletStorage.set({ ...storedWallet!, pin: pin! });
            setPinConfirmedState({ pinConfirmed: false, hasNewPin: false });
            showToast("Password update correctly", { type: "success" });
        };
        if (pinConfirmed.pinConfirmed && pinConfirmed.hasNewPin) updatePin();
    }, [pinConfirmed]);

    return (
        <BaseSecondaryScreen navigation={navigation} title={translate("security_settings")} back={true}>
            <Col gap={20}>
                <Button onPress={() => navigation.navigate("UpdatePin")} fullWidth variant="outlined">
                    Change passcode
                </Button>
                <Button fullWidth onPress={() => setWalletState((state) => ({ ...state, isAuthenticated: false }))}>
                    Log out
                </Button>
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
            </Col>
        </BaseSecondaryScreen>
    );
};

export default GeneralSettingsScreen;