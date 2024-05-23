import { TransactionSkeleton, minimalCellCapacityCompatible } from "@ckb-lumos/helpers";
import { common } from "@ckb-lumos/common-scripts";
import { calculateFeeByTransactionSkeleton } from "@spore-sdk/core";
import { ConnectionService } from "../connection.service";
import { TransactionService, FeeRate } from "../transaction.service";
import { Cell } from "@ckb-lumos/lumos";

export interface CKBBalance {
    totalBalance: number;
    occupiedBalance: number;
    freeBalance: number;
}

export class CKBService {
    private readonly connection: ConnectionService;
    private readonly transactionService: TransactionService;
    private readonly transferCellSize = BigInt(61 * 10 ** 8);
    private readonly transferData = "0x";

    constructor(connectionService: ConnectionService, transactionService: TransactionService) {
        this.connection = connectionService;
        this.transactionService = transactionService;
    }

    async transfer(from: string, to: string, amount: bigint, privateKey: string, feeRate: FeeRate = FeeRate.NORMAL): Promise<string> {
        if (amount < this.transferCellSize) {
            throw new Error("minimun_amount_61_ckb");
        }

        let txSkeleton = TransactionSkeleton({ cellProvider: this.connection.getEmptyCellProvider() });
        txSkeleton = await common.transfer(txSkeleton, [from], to, amount, undefined, undefined, this.connection.getConfigAsObject());
        txSkeleton = await common.payFeeByFeeRate(txSkeleton, [from], feeRate, undefined, this.connection.getConfigAsObject());

        return this.transactionService.signAndSendTransaction(txSkeleton, [privateKey]);
    }

    async transferFromCells(
        cells: Cell[],
        fromAddresses: string[],
        to: string,
        amount: bigint,
        privateKeys: string[],
        sendAllFunds = false,
        feeRate: FeeRate = FeeRate.NORMAL,
    ): Promise<string> {
        if (sendAllFunds) {
            // Get total capacity from all non type cells
            amount = cells.filter((cell) => !cell.cellOutput.type).reduce((ant, act) => ant + BigInt(act.cellOutput.capacity), BigInt(0));
        }
        if (amount < this.transferCellSize) {
            throw new Error("minimun_amount_61_ckb");
        }

        let txSkeleton = TransactionSkeleton({ cellProvider: this.connection.getEmptyCellProvider() });

        // Add output
        const toScript = this.connection.getLockFromAddress(to);
        const outputCell = {
            cellOutput: {
                capacity: "0x" + amount.toString(16),
                lock: toScript,
            },
            data: this.transferData,
        };
        txSkeleton = txSkeleton.update("outputs", (outputs) => outputs.push(outputCell));

        // Inject capacity
        txSkeleton = this.transactionService.injectCapacity(txSkeleton, amount, cells);

        // Pay fee
        if (sendAllFunds) {
            const minCapacity = minimalCellCapacityCompatible(outputCell);
            const fee = calculateFeeByTransactionSkeleton(txSkeleton, feeRate);

            let feeInCell = false;
            txSkeleton = txSkeleton.update("outputs", (outputs) => {
                const output = outputs.get(0)!;
                const capacity = BigInt(output.cellOutput.capacity);

                if (minCapacity.add(fee).lte(capacity)) {
                    feeInCell = true;
                    output.cellOutput.capacity = "0x" + (capacity - fee.toBigInt()).toString(16);
                    return outputs.set(0, output);
                }
                return outputs;
            });
            if (!feeInCell) {
                throw new Error("Insufficient funds to pay for fees");
            }
        } else {
            txSkeleton = await common.payFeeByFeeRate(txSkeleton, fromAddresses, feeRate, undefined, this.connection.getConfigAsObject());
        }

        // Get signing private keys
        const signingPrivKeys = this.transactionService.extractPrivateKeys(txSkeleton, fromAddresses, privateKeys);

        return this.transactionService.signAndSendTransaction(txSkeleton, signingPrivKeys);
    }

    async getBalance(address: string): Promise<CKBBalance> {
        const collector = this.connection.getIndexer().collector({
            lock: this.connection.getLockFromAddress(address),
        });

        const cells: Cell[] = [];
        for await (const cell of collector.collect()) {
            cells.push(cell);
        }

        return this.getBalanceFromCells(cells);
    }

    getBalanceFromCells(cells: Cell[]): CKBBalance {
        let totalBalanceBI = BigInt(0);
        let occupiedBalanceBI = BigInt(0);

        for (const cell of cells) {
            totalBalanceBI += BigInt(cell.cellOutput.capacity);
            if (cell.cellOutput.type) {
                occupiedBalanceBI += BigInt(cell.cellOutput.capacity);
            }
        }
        const freeBalance = Number(totalBalanceBI - occupiedBalanceBI) / 10 ** 8;
        const totalBalance = Number(totalBalanceBI) / 10 ** 8;
        const occupiedBalance = Number(occupiedBalanceBI) / 10 ** 8;

        return { totalBalance, occupiedBalance, freeBalance };
    }
}
