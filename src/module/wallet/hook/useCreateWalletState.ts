import { useRecoilState } from "recoil";
import createWalletState, { CreateWalletState } from "module/wallet/state/CreateWalletState";

export interface UseCreateWalletStateResult {
    state: CreateWalletState;
    setName: (name: string) => void;
    setPin: (pin: string) => void;
    setMnemonic: (mnemonic: string[]) => void;
}

const useCreateWalletState = (): UseCreateWalletStateResult => {
    const [state, setState] = useRecoilState(createWalletState);

    return {
        state,
        setName: (name: string) => setState((s) => ({ ...s, name })),
        setPin: (pin: string) => setState((s) => ({ ...s, pin })),
        setMnemonic: (mnemonic: string[]) => setState((s) => ({ ...s, mnemonic })),
    };
};

export default useCreateWalletState;