import { useEffect } from "react";
import { WalletStorage } from "module/wallet/WalletStorage";
import useCreateWallet from "module/wallet/hook/useCreateWallet";
import { useSetRecoilState } from "recoil";
import walletState from "module/wallet/state/WalletState";

const CreateWalletSuccessScreen = (): JSX.Element => {
    const {
        state: { mnemonic, pin, name },
    } = useCreateWallet();
    const setWalletState = useSetRecoilState(walletState);

    useEffect(() => {
        WalletStorage.set({ name: name!, pin: pin!, mnemonic: mnemonic! }).then(async () => {
            await new Promise((resolve) => setTimeout(() => resolve(null), 2000));
            setWalletState((state) => ({ ...state, hasWallet: true, isAuthenticated: true }));
        });
    }, []);

    return <></>;
};

export default CreateWalletSuccessScreen;