import { atom } from "recoil";
import { Asset, AssetType } from "module/wallet/wallet.types";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";

export interface SendState {
    senderWalletIndex?: number;
    receiver?: string;
    amount?: string;
    message?: string;
    receiverDomainAddress?: BitAccountRecordAddress;
    asset: Asset;
    sendAllFunds?: boolean;
}

const sendState = atom<SendState>({
    key: "send",
    default: {
        asset: { type: AssetType.NATIVE_TOKEN },
        amount: "",
    },
});

export default sendState;
