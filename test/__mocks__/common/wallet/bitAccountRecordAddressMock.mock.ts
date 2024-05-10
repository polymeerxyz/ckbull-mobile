import BaseMock from "../base.mock";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";
import { MOCKED_ADDRESS } from "./wallet.mock";

export class BitAccountRecordAddressMock extends BaseMock implements BitAccountRecordAddress {
    coin_type: string;
    key: string;
    label: string;
    subtype: string;
    ttl: string;
    type: string;
    value: string;
    constructor({
        coin_type = "309",
        key = "address.cbk",
        label = "",
        subtype = "ckb",
        ttl = "300",
        type = "300",
        value = MOCKED_ADDRESS,
    }: Partial<BitAccountRecordAddress> = {}) {
        super();
        this.coin_type = coin_type;
        this.key = key;
        this.label = label;
        this.subtype = subtype;
        this.ttl = ttl;
        this.type = type;
        this.value = value;
    }
}
