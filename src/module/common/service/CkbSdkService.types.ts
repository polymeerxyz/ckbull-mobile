import { Transaction } from "@peersyst/ckb-peersyst-sdk";

export interface DepositInDAOParams {
    amount: bigint;
    mnemonic: string[];
    feeRate?: string;
}

export interface SendTransactionParams {
    amount: bigint;
    mnemonic: string[];
    message: string;
    to: string;
    feeRate?: string;
}

export interface FullTransaction extends Transaction {
    token?: string;
}