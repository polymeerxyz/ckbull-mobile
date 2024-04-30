import { Cell, Script, HashType } from "@ckb-lumos/lumos";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { sudt, common } from "@ckb-lumos/common-scripts";
import { ConnectionService, Environments } from "../connection.service";
import { FeeRate, TransactionService } from "../transaction.service";
import { number } from "@ckb-lumos/codec";
import { ScriptConfig } from "@ckb-lumos/lumos/config";

export interface TokenType {
    args: string;
    codeHash: string;
    hashType: HashType;
}

export type TokenKind = "sudt" | "xudt";

export interface TokenAmount {
    type: TokenType;
    amount: number;
    kind: TokenKind;
}

export const XudtConfig: { [key in Environments]: ScriptConfig } = {
    [Environments.Mainnet]: {
        CODE_HASH: "0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95",
        HASH_TYPE: "data1",
        TX_HASH: "0xc07844ce21b38e4b071dd0e1ee3b0e27afd8d7532491327f39b786343f558ab7",
        INDEX: "0x0",
        DEP_TYPE: "code",
    },
    [Environments.Testnet]: {
        CODE_HASH: "0x25c29dc317811a6f6f3985a7a9ebc4838bd388d19d0feeecf0bcd60f6c0975bb",
        HASH_TYPE: "type",
        TX_HASH: "0xbf6fb538763efec2a70a6a3dcb7242787087e1030c4e7d86585bc63a9d337f5f",
        INDEX: "0x0",
        DEP_TYPE: "code",
    },
};

export class TokenService {
    private readonly connection: ConnectionService;
    private readonly transactionService: TransactionService;
    private readonly sudtCellSize = BigInt(142 * 10 ** 8);

    constructor(connectionService: ConnectionService, transactionService: TransactionService) {
        this.connection = connectionService;
        this.transactionService = transactionService;
    }

    private isSudtScriptType(script: Script): boolean {
        if (!script) {
            return false;
        }

        const sudtScript = this.connection.getConfig().SCRIPTS.SUDT;
        return script.codeHash === sudtScript!.CODE_HASH && script.hashType === sudtScript!.HASH_TYPE;
    }

    private isXudtScriptType(script: Script): boolean {
        if (!script) {
            return false;
        }

        const xudtScript = XudtConfig[this.connection.getEnvironment()];
        return script.codeHash === xudtScript.CODE_HASH && script.hashType === xudtScript.HASH_TYPE;
    }

    async issue(address: string, amount: number, privateKey: string, feeRate: FeeRate = FeeRate.NORMAL): Promise<string> {
        let txSkeleton = TransactionSkeleton({ cellProvider: this.connection.getEmptyCellProvider() });
        txSkeleton = await sudt.issueToken(txSkeleton, address, amount, undefined, undefined, this.connection.getConfigAsObject());
        txSkeleton = await common.payFeeByFeeRate(txSkeleton, [address], feeRate, undefined, this.connection.getConfigAsObject());

        return this.transactionService.signAndSendTransaction(txSkeleton, [privateKey]);
    }

    async transfer(
        from: string,
        to: string,
        token: string,
        amount: number,
        privateKey: string,
        feeRate: FeeRate = FeeRate.NORMAL,
    ): Promise<string> {
        let txSkeleton = TransactionSkeleton({ cellProvider: this.connection.getCellProvider() });
        txSkeleton = await sudt.transfer(txSkeleton, [from], token, to, amount, undefined, undefined, undefined, {
            config: this.connection.getConfig(),
        });
        txSkeleton = await common.payFeeByFeeRate(txSkeleton, [from], feeRate, undefined, this.connection.getConfigAsObject());

        return this.transactionService.signAndSendTransaction(txSkeleton, [privateKey]);
    }

    async transferFromCells(
        cells: Cell[],
        fromAddresses: string[],
        to: string,
        token: string,
        amount: bigint,
        privateKeys: string[],
        feeRate: FeeRate = FeeRate.NORMAL,
    ): Promise<string> {
        let txSkeleton = TransactionSkeleton({ cellProvider: this.connection.getCellProvider() });

        // Inject token capacity
        const toScript = this.connection.getLockFromAddress(to);
        txSkeleton = this.transactionService.injectTokenCapacity(txSkeleton, token, amount, this.sudtCellSize, cells, toScript);

        // Pay fee
        txSkeleton = await common.payFeeByFeeRate(txSkeleton, fromAddresses, feeRate, undefined, this.connection.getConfigAsObject());

        // Get signing private keys
        const signingPrivKeys = this.transactionService.extractPrivateKeys(txSkeleton, fromAddresses, privateKeys);

        return this.transactionService.signAndSendTransaction(txSkeleton, signingPrivKeys);
    }

    async getBalance(address: string): Promise<TokenAmount[]> {
        const collector = this.connection.getIndexer().collector({
            lock: this.connection.getLockFromAddress(address),
        });

        const cells: Cell[] = [];
        for await (const cell of collector.collect()) {
            cells.push(cell);
        }

        return this.getBalanceFromCells(cells);
    }

    getBalanceFromCells(cells: Cell[]): TokenAmount[] {
        const sudtScript = this.connection.getConfig().SCRIPTS.SUDT!;
        const xudtScript = XudtConfig[this.connection.getEnvironment()];
        const tokenMap = new Map<string, TokenAmount>();

        for (const cell of cells) {
            if (this.isSudtScriptType(cell.cellOutput.type!)) {
                const key = cell.cellOutput.type!.args;
                let amount = Number(number.Uint128LE.unpack(cell.data).toBigInt());

                if (tokenMap.has(key)) {
                    amount += tokenMap.get(key)!.amount;
                }

                tokenMap.set(key, {
                    type: { args: key, codeHash: sudtScript.CODE_HASH, hashType: sudtScript.HASH_TYPE },
                    amount,
                    kind: "sudt",
                });
            } else if (this.isXudtScriptType(cell.cellOutput.type!)) {
                const key = cell.cellOutput.type!.args;
                let amount = Number(number.Uint128LE.unpack(cell.data).toBigInt());

                if (tokenMap.has(key)) {
                    amount += tokenMap.get(key)!.amount;
                }

                tokenMap.set(key, {
                    type: { args: key, codeHash: xudtScript.CODE_HASH, hashType: xudtScript.HASH_TYPE },
                    amount,
                    kind: "xudt",
                });
            }
        }

        return [...tokenMap.values()];
    }
}
