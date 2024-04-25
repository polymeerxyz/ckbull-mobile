import { AppCurrency } from "module/wallet/component/display/Balance/Balance.types";
import BaseMock from "../base.mock";
import { MOCKED_ADDRESS } from "../wallet";
import { AssetMock } from "../wallet/asset.mock";
import { BitAccountRecordAddressMock } from "../wallet/as.mock";

export interface ISendStateMock {
    senderWalletIndex?: number;
    receiver?: string;
    amount?: string;
    message?: string;
    receiverDomainAddress?: BitAccountRecordAddressMock;
    token: AppCurrency | string;
    asset: AssetMock;
}

export class SendStateMock extends BaseMock implements ISendStateMock {
    senderWalletIndex?: number | undefined;
    receiverAddress?: string | undefined;
    amount?: string | undefined;
    message?: string | undefined;
    token: AppCurrency | string;
    asset: AssetMock;
    receiverDomainAddress?: BitAccountRecordAddressMock | undefined;
    constructor({ senderWalletIndex, receiver, amount, message, token, asset, receiverDomainAddress }: Partial<ISendStateMock> = {}) {
        super();
        this.amount = amount;
        this.message = message;
        this.receiverAddress = receiver || MOCKED_ADDRESS;
        this.senderWalletIndex = senderWalletIndex || 0;
        this.token = token || "CKB";
        this.asset = asset || new AssetMock();
        this.receiverDomainAddress = receiverDomainAddress || new BitAccountRecordAddressMock();
    }
}
