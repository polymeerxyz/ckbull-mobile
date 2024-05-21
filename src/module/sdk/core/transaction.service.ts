import { ScriptConfig } from "@ckb-lumos/config-manager";
import { Cell, commons, hd, helpers, Script, HashType, Transaction as LumosTx } from "@ckb-lumos/lumos";
import { sealTransaction, TransactionSkeletonType } from "@ckb-lumos/helpers";
import { TransactionWithStatus, values, WitnessArgs } from "@ckb-lumos/base";
import { TransactionCollector as TxCollector } from "@ckb-lumos/ckb-indexer";
import { CKBIndexerQueryOptions } from "@ckb-lumos/ckb-indexer/src/type";
import { ConnectionService } from "./connection.service";
import { Logger } from "../utils/logger";
import { NftService } from "./assets/nft.service";
import { number, bytes } from "@ckb-lumos/codec";
import { blockchain } from "@ckb-lumos/base";
import { XudtConfig } from "./assets/token.service";

const { ScriptValue } = values;

export interface ScriptType {
    args: string;
    codeHash: string;
    hashType: HashType;
}

export interface DataRow {
    quantity: number;
    address: string;
    type?: ScriptType;
    data?: number;
}

export interface Transaction {
    status: TransactionStatus;
    transactionHash: string;
    inputs: DataRow[];
    outputs: DataRow[];
    type: TransactionType;
    scriptType?: ScriptType;
    amount: number;
    blockHash?: string;
    blockNumber?: number;
    timestamp?: Date;
    tokenAmount?: number;
}

export enum TransactionStatus {
    PENDING = "pending",
    PROPOSED = "proposed",
    COMMITTED = "committed",
    REJECTED = "rejected",
}

export enum TransactionType {
    SEND_NATIVE_TOKEN = "send_ckb",
    RECEIVE_NATIVE_TOKEN = "receive_ckb",
    SEND_TOKEN = "send_token",
    RECEIVE_TOKEN = "receive_token",
    SEND_NFT = "send_nft",
    RECEIVE_NFT = "receive_nft",
    DEPOSIT_DAO = "deposit_dao",
    WITHDRAW_DAO = "withdraw_dao",
    UNLOCK_DAO = "unlock_dao",
    SMART_CONTRACT_SEND = "smart_contract_send",
    SMART_CONTRACT_RECEIVE = "smart_contract_receive",
}

export enum FeeRate {
    SLOW = 1000,
    NORMAL = 100000,
    FAST = 10000000,
}

export class TransactionService {
    private readonly connection: ConnectionService;
    private readonly nftService: NftService;
    private readonly TransactionCollector: any;
    private readonly logger = new Logger(TransactionService.name);
    private readonly transactionMap = new Map<string, Transaction>();
    private readonly secpSignaturePlaceholder =
        "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    public readonly defaultFee = BigInt(100000);

    constructor(connectionService: ConnectionService, nftService: NftService) {
        this.connection = connectionService;
        this.nftService = nftService;
        this.TransactionCollector = TxCollector;
    }

    static addCellDep(txSkeleton: TransactionSkeletonType, scriptConfig: ScriptConfig): TransactionSkeletonType {
        const { TX_HASH, INDEX, DEP_TYPE } = scriptConfig;

        if (txSkeleton.has("cellDeps")) {
            const cellDeps = txSkeleton.get("cellDeps");
            if (cellDeps.filter((cell) => cell.outPoint.txHash === TX_HASH && cell.outPoint.index === INDEX).size > 0) {
                return txSkeleton;
            }
        }

        return txSkeleton.update("cellDeps", (cellDeps) => {
            return cellDeps.push({
                outPoint: {
                    txHash: TX_HASH,
                    index: INDEX,
                },
                depType: DEP_TYPE,
            });
        });
    }

    static isScriptTypeScript(scriptType: Script, scriptConfig: ScriptConfig): boolean {
        return scriptConfig.CODE_HASH === scriptType.codeHash && scriptConfig.HASH_TYPE === scriptType.hashType;
    }

    static cellIsScriptType(cell: Cell, scriptType: ScriptType): boolean {
        const { type } = cell.cellOutput;
        return !!type && type.args === scriptType.args && type.codeHash === scriptType.codeHash && type.hashType === scriptType.hashType;
    }

    private isScriptTokenScript(scriptType: ScriptType): boolean {
        const sudt = this.connection.getConfig().SCRIPTS.SUDT!;
        const xudt = XudtConfig[this.connection.getEnvironment()];

        return TransactionService.isScriptTypeScript(scriptType, sudt) || TransactionService.isScriptTypeScript(scriptType, xudt);
    }

    private cellIsTokenType(cell: Cell, tokenHash: string): boolean {
        const { type } = cell.cellOutput;

        return !!type && type.args === tokenHash && this.isScriptTokenScript(type);
    }

    private getTransactionCollector(address: string, includeStatus = false, toBlock?: string, fromBlock?: string): any {
        const queryOptions: CKBIndexerQueryOptions = { lock: this.connection.getLockFromAddress(address) };
        if (toBlock) {
            queryOptions.toBlock = toBlock;
        }
        if (fromBlock) {
            queryOptions.fromBlock = fromBlock;
        }

        return new this.TransactionCollector(this.connection.getIndexer(), queryOptions, this.connection.getCKBUrl(), { includeStatus });
    }

    async getTransactionFromLumosTx(lumosTx: TransactionWithStatus, address: string, allAddresses: string[]): Promise<Transaction> {
        const inputs: DataRow[] = [];
        const inputAddresses: string[] = [];
        let scriptType: ScriptType;
        let inputIndex = null;
        let amount = 0;
        let complexAmount = 0;
        let inputType = null;
        let inputData = null;
        let isRealSender = false;
        for (let i = 0; i < lumosTx.transaction.inputs.length; i += 1) {
            const input = lumosTx.transaction.inputs[i];
            const inputTx = await this.connection.getTransactionFromHash(input.previousOutput.txHash);
            const outputIdx = parseInt(input.previousOutput.index, 16);
            const output = inputTx.transaction.outputs[outputIdx];
            const inputAddress = this.connection.getAddressFromLock(output.lock);
            inputs.push({
                quantity: parseInt(output.capacity, 16) / 100000000,
                address: this.connection.getAddressFromLock(output.lock),
            });
            if (allAddresses.includes(inputAddress)) {
                inputIndex = i;
                amount -= parseInt(output.capacity, 16) / 100000000;
                complexAmount -= parseInt(output.capacity, 16) / 100000000;
                inputAddresses.push(inputAddress);
                if (output.type) {
                    inputType = {
                        args: output.type.args,
                        codeHash: output.type.codeHash,
                        hashType: output.type.hashType,
                    };
                    const data = inputTx.transaction.outputsData[outputIdx];
                    if (data && data !== "0x") {
                        if (data.length >= 34) {
                            inputData = Number(number.Uint128LE.unpack(data.substring(0, 34)).toBigInt());
                        } else if (data.length === 18) {
                            inputData = Number(number.Uint64LE.unpack(data).toBigInt());
                        }
                    }
                }
            }
            if (address === inputAddress) {
                isRealSender = true;
            }
        }

        let outputIndex = null;
        const tokensDestinationsIndex: number[] = [];
        let receiveAmount = 0;
        let tokenAmount: undefined | number = undefined;
        const outputs: DataRow[] = lumosTx.transaction.outputs.map((output, index) => {
            const outputAddress = this.connection.getAddressFromLock(output.lock);
            if (allAddresses.includes(outputAddress)) {
                amount += parseInt(output.capacity, 16) / 100000000;
                if (output.type) {
                    outputIndex = index;
                }
            } else if (output.type) {
                const outputScriptType = { args: output.type.args, codeHash: output.type.codeHash, hashType: output.type.hashType };
                if (this.isScriptTokenScript(outputScriptType)) {
                    tokensDestinationsIndex.push(index);
                }
            }
            if (inputAddresses.includes(outputAddress)) {
                complexAmount += parseInt(output.capacity, 16) / 100000000;
            }
            if (address === outputAddress) {
                receiveAmount = parseInt(output.capacity, 16) / 100000000;
            }
            return {
                quantity: parseInt(output.capacity, 16) / 100000000,
                address: this.connection.getAddressFromLock(output.lock),
                type: output.type ? { args: output.type.args, codeHash: output.type.codeHash, hashType: output.type.hashType } : undefined,
            };
        });
        lumosTx.transaction.outputsData.map((data, index) => {
            if (data !== "0x") {
                if (data.length >= 34) {
                    outputs[index].data = Number(number.Uint128LE.unpack(data.substring(0, 34)).toBigInt());
                } else if (data.length === 18) {
                    outputs[index].data = Number(number.Uint64LE.unpack(data).toBigInt());
                }
            }
        });

        let type: TransactionType;
        const isReceive = inputIndex === null;
        if (inputType === null && outputIndex === null) {
            // If neither input or output has type then it is a simple ckb transaction
            if (Math.abs(amount) < 1) {
                // It is fee, same receiver and sender
                if (isRealSender) {
                    type = TransactionType.SEND_NATIVE_TOKEN;
                    amount = complexAmount;
                } else {
                    type = TransactionType.RECEIVE_NATIVE_TOKEN;
                    amount = receiveAmount;
                }
            } else {
                type = !isReceive ? TransactionType.SEND_NATIVE_TOKEN : TransactionType.RECEIVE_NATIVE_TOKEN;
            }
        } else if (outputIndex !== null) {
            const { type: outputType, data, quantity } = outputs[outputIndex];
            scriptType = outputType!;
            if (this.isScriptTokenScript(scriptType)) {
                type = !isReceive ? TransactionType.SEND_TOKEN : TransactionType.RECEIVE_TOKEN;
                if (type === TransactionType.RECEIVE_TOKEN) {
                    tokenAmount = data || 0;
                } else {
                    tokenAmount = tokensDestinationsIndex.reduce((acc, outputIndex) => (acc += outputs[outputIndex].data || 0), 0);
                }
            } else if (TransactionService.isScriptTypeScript(scriptType, this.connection.getConfig().SCRIPTS.DAO!)) {
                if (data === 0) {
                    type = TransactionType.DEPOSIT_DAO;
                    amount = Math.abs(amount) < 1 ? -quantity : amount;
                } else {
                    type = TransactionType.WITHDRAW_DAO;
                    amount = Math.abs(amount) < 1 ? quantity : amount;
                }
            } else if (await this.nftService.isScriptNftScript(scriptType)) {
                type = !isReceive ? TransactionType.SEND_NFT : TransactionType.RECEIVE_NFT;
            } else {
                type = !isReceive ? TransactionType.SMART_CONTRACT_SEND : TransactionType.SMART_CONTRACT_RECEIVE;
            }
        } else {
            scriptType = inputType!;
            if (this.isScriptTokenScript(scriptType)) {
                type = !isReceive ? TransactionType.SEND_TOKEN : TransactionType.RECEIVE_TOKEN;
                if (inputData) {
                    tokenAmount = inputData;
                }
            } else if (await this.nftService.isScriptNftScript(scriptType)) {
                type = !isReceive ? TransactionType.SEND_NFT : TransactionType.RECEIVE_NFT;
            } else {
                type = TransactionType.UNLOCK_DAO;
            }
        }

        const transaction: Transaction = {
            status: lumosTx.txStatus.status as TransactionStatus,
            transactionHash: lumosTx.transaction.hash!,
            inputs,
            outputs,
            type: type!,
            scriptType: scriptType!,
            amount,
            tokenAmount,
        };
        if (lumosTx.txStatus.blockHash) {
            const header = await this.connection.getBlockHeaderFromHash(lumosTx.txStatus.blockHash);
            transaction.blockHash = lumosTx.txStatus.blockHash;
            transaction.blockNumber = parseInt(header.number, 16);
            transaction.timestamp = new Date(parseInt(header.timestamp, 16));
        }

        return transaction;
    }

    addSecp256CellDep(txSkeleton: TransactionSkeletonType): TransactionSkeletonType {
        return TransactionService.addCellDep(txSkeleton, this.connection.getConfig().SCRIPTS.SECP256K1_BLAKE160!);
    }

    addSudtCellDep(txSkeleton: TransactionSkeletonType): TransactionSkeletonType {
        return TransactionService.addCellDep(txSkeleton, this.connection.getConfig().SCRIPTS.SUDT!);
    }

    addXudtCellDep(txSkeleton: TransactionSkeletonType): TransactionSkeletonType {
        return TransactionService.addCellDep(txSkeleton, XudtConfig[this.connection.getEnvironment()]);
    }

    injectCapacity(txSkeleton: TransactionSkeletonType, capacity: bigint, cells: Cell[]): TransactionSkeletonType {
        txSkeleton = this.addSecp256CellDep(txSkeleton);
        let lastScript: Script | undefined;
        let changeCell: Cell | undefined;
        let changeCapacity = BigInt(0);
        let currentCapacity = BigInt(capacity);

        for (const cell of cells) {
            // Cell is empty
            if (!cell.cellOutput.type) {
                txSkeleton = txSkeleton.update("inputs", (inputs) => inputs.push(cell));
                txSkeleton = txSkeleton.update("witnesses", (witnesses) => witnesses.push("0x"));

                const inputCapacity = BigInt(cell.cellOutput.capacity);
                let deductCapacity = inputCapacity;
                if (deductCapacity > currentCapacity) {
                    deductCapacity = currentCapacity;
                }
                currentCapacity -= deductCapacity;
                changeCapacity += inputCapacity - deductCapacity;

                const lockScript = cell.cellOutput.lock;
                if (
                    !lastScript ||
                    lastScript.args !== lockScript.args ||
                    lastScript.codeHash !== lockScript.codeHash ||
                    lastScript.hashType !== lockScript.hashType
                ) {
                    txSkeleton = this.addWitnesses(txSkeleton, lockScript);
                    lastScript = lockScript;
                }

                // Got enough capacity
                if (currentCapacity.toString() === BigInt(0).toString() && changeCapacity > BigInt(0)) {
                    changeCell = {
                        cellOutput: {
                            capacity: "0x" + changeCapacity.toString(16),
                            lock: cell.cellOutput.lock,
                            type: undefined,
                        },
                        data: "0x",
                        outPoint: undefined,
                        blockHash: undefined,
                    };
                    break;
                }
            }
        }

        if (changeCell !== undefined && changeCapacity > helpers.minimalCellCapacityCompatible(changeCell).toBigInt()) {
            txSkeleton = txSkeleton.update("outputs", (outputs) => outputs.push(changeCell!));
        }

        return txSkeleton;
    }

    injectTokenCapacity(
        txSkeleton: TransactionSkeletonType,
        token: string,
        amount: bigint,
        capacity: bigint,
        cells: Cell[],
        toScript?: Script,
    ): TransactionSkeletonType {
        const sudt = this.connection.getConfig().SCRIPTS.SUDT!;
        const xudt = XudtConfig[this.connection.getEnvironment()];
        const tokenCells = cells.filter((cell) => this.cellIsTokenType(cell, token));
        const noTypeCells = cells.filter((cell) => !cell.cellOutput.type);
        if (tokenCells.length === 0) {
            throw new Error("Insufficient tokens amount");
        }

        const isSudt = tokenCells[0].cellOutput.type!.codeHash === sudt.CODE_HASH;
        const xudtData = isSudt ? "" : tokenCells[0].data.substring(34);
        txSkeleton = this.addSecp256CellDep(txSkeleton);
        txSkeleton = isSudt ? this.addSudtCellDep(txSkeleton) : this.addXudtCellDep(txSkeleton);

        const tokenType = {
            codeHash: isSudt ? sudt.CODE_HASH : xudt.CODE_HASH,
            hashType: isSudt ? sudt.HASH_TYPE : xudt.HASH_TYPE,
            args: token,
        };
        const changeCell: Cell = {
            cellOutput: {
                capacity: "0x0",
                lock: tokenCells[0].cellOutput.lock,
                type: tokenType,
            },
            data: bytes.hexify(number.Uint128LE.pack("0")) + xudtData,
            outPoint: undefined,
            blockHash: undefined,
        };
        if (toScript) {
            txSkeleton = txSkeleton.update("outputs", (outputs) => {
                return outputs.push({
                    cellOutput: {
                        capacity: "0x" + capacity.toString(16),
                        lock: toScript,
                        type: tokenType,
                    },
                    data: bytes.hexify(number.Uint128LE.pack(amount.toString())) + xudtData,
                });
            });

            txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
                return fixedEntries.push({
                    field: "outputs",
                    index: txSkeleton.get("outputs").size - 1,
                });
            });
        }
        const changeCellWithoutUdt: Cell = {
            cellOutput: {
                capacity: "0x0",
                lock: tokenCells[0].cellOutput.lock,
                type: undefined,
            },
            data: "0x",
            outPoint: undefined,
            blockHash: undefined,
        };
        let lastScript: Script | undefined;
        let changeCapacity = BigInt(0);
        let changeAmount = BigInt(0);
        let currentCapacity = capacity;
        let currentAmount = amount;

        for (const cell of [...tokenCells, ...noTypeCells]) {
            txSkeleton = txSkeleton.update("inputs", (inputs) => inputs.push(cell));
            txSkeleton = txSkeleton.update("witnesses", (witnesses) => witnesses.push("0x"));

            const inputCapacity = BigInt(cell.cellOutput.capacity);
            let deductCapacity = inputCapacity;
            if (deductCapacity > currentCapacity) {
                deductCapacity = currentCapacity;
            }
            currentCapacity -= deductCapacity;
            changeCapacity += inputCapacity - deductCapacity;

            if (cell.cellOutput.type) {
                const inputAmount = number.Uint128LE.unpack(cell.data.substring(0, 34)).toBigInt();
                let deductAmount = inputAmount;
                if (deductAmount > currentAmount) {
                    deductAmount = currentAmount;
                }
                currentAmount -= deductAmount;
                changeAmount += inputAmount - deductAmount;
            }

            const lockScript = cell.cellOutput.lock;
            if (
                !lastScript ||
                lastScript.args !== lockScript.args ||
                lastScript.codeHash !== lockScript.codeHash ||
                lastScript.hashType !== lockScript.hashType
            ) {
                txSkeleton = this.addWitnesses(txSkeleton, lockScript);
                lastScript = lockScript;
            }

            // Got enough capacity and amount and changeCell does not include tokens
            if (
                currentCapacity.toString() === BigInt(0).toString() &&
                currentAmount.toString() === BigInt(0).toString() &&
                changeAmount.toString() === BigInt(0).toString() &&
                (changeCapacity.toString() === BigInt(0).toString() ||
                    changeCapacity >= helpers.minimalCellCapacityCompatible(changeCellWithoutUdt).toBigInt())
            ) {
                changeCell.cellOutput.type = undefined;
                changeCell.data = "0x";
                break;
            }

            // Got enough capacity and amount and changeCell includes tokens
            if (
                currentCapacity.toString() === BigInt(0).toString() &&
                currentAmount.toString() === BigInt(0).toString() &&
                changeAmount > BigInt(0) &&
                changeCapacity >= helpers.minimalCellCapacityCompatible(changeCell).toBigInt()
            ) {
                break;
            }
        }

        if (currentAmount > 0) {
            throw new Error("Insufficient tokens amount");
        }
        if (currentCapacity > 0) {
            throw new Error("Insufficient capacity");
        }
        if (changeAmount > 0 && changeCapacity < helpers.minimalCellCapacityCompatible(changeCell).toBigInt()) {
            throw new Error("insufficient_capacity_for_change_cell");
        }

        if (changeCapacity > BigInt(0)) {
            let splitFlag = false;

            changeCell.cellOutput.capacity = "0x" + changeCapacity.toString(16);
            if (changeAmount > 0) {
                changeCell.data = bytes.hexify(number.Uint128LE.pack(changeAmount.toString())) + xudtData;

                const changeCellMin = helpers.minimalCellCapacityCompatible(changeCell).toBigInt();
                const changeCellNoSudtMin = helpers.minimalCellCapacityCompatible(changeCellWithoutUdt).toBigInt();
                if (changeCapacity >= changeCellMin + changeCellNoSudtMin) {
                    changeCell.cellOutput.capacity = "0x" + changeCellMin.toString(16);
                    changeCellWithoutUdt.cellOutput.capacity = "0x" + (changeCapacity - changeCellMin).toString(16);
                    splitFlag = true;
                }
            }

            txSkeleton = txSkeleton.update("outputs", (outputs) => outputs.push(changeCell));
            if (changeAmount > 0) {
                txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
                    return fixedEntries.push({
                        field: "outputs",
                        index: txSkeleton.get("outputs").size - 1,
                    });
                });
            }
            if (splitFlag) {
                txSkeleton = txSkeleton.update("outputs", (outputs) => outputs.push(changeCellWithoutUdt));
            }
        }

        return txSkeleton;
    }

    injectNftCapacity(txSkeleton: TransactionSkeletonType, nftScript: ScriptType, nftData: string, cells: Cell[]): TransactionSkeletonType {
        txSkeleton = this.addSecp256CellDep(txSkeleton);
        const nftCells = cells.filter((cell) => TransactionService.cellIsScriptType(cell, nftScript) && cell.data === nftData);
        if (nftCells.length === 0) {
            throw new Error("Nft not found");
        }
        const [cell] = nftCells;

        // Add output
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
            const output = outputs.get(0)!;
            output.cellOutput.capacity = cell.cellOutput.capacity;
            return outputs.set(0, output);
        });

        txSkeleton = txSkeleton.update("inputs", (inputs) => inputs.push(cell));
        txSkeleton = txSkeleton.update("witnesses", (witnesses) => witnesses.push("0x"));
        txSkeleton = this.addWitnesses(txSkeleton, cell.cellOutput.lock);

        return txSkeleton;
    }

    getScriptFirstIndex(txSkeleton: TransactionSkeletonType, fromScript: Script): number {
        return txSkeleton
            .get("inputs")
            .findIndex((input) =>
                new ScriptValue(input.cellOutput.lock, { validate: false }).equals(new ScriptValue(fromScript, { validate: false })),
            );
    }

    addWitnesses(txSkeleton: TransactionSkeletonType, fromScript: Script): TransactionSkeletonType {
        // posar el index i from script
        const firstIndex = this.getScriptFirstIndex(txSkeleton, fromScript);

        if (firstIndex !== -1) {
            while (firstIndex >= txSkeleton.get("witnesses").size) {
                txSkeleton = txSkeleton.update("witnesses", (witnesses) => witnesses.push("0x"));
            }

            let witness: string = txSkeleton.get("witnesses").get(firstIndex)!;
            const newWitnessArgs: WitnessArgs = { lock: this.secpSignaturePlaceholder };
            if (witness !== "0x") {
                const witnessArgs = blockchain.WitnessArgs.unpack(bytes.bytify(witness));
                const lock = witnessArgs.lock;
                if (!!lock && lock !== newWitnessArgs.lock) {
                    throw new Error("Lock field in first witness is set aside for signature!");
                }

                const inputType = witnessArgs.inputType;
                if (inputType) {
                    newWitnessArgs.inputType = inputType;
                }
                const outputType = witnessArgs.outputType;
                if (outputType) {
                    newWitnessArgs.outputType = outputType;
                }
            }
            witness = bytes.hexify(blockchain.WitnessArgs.pack(newWitnessArgs));
            txSkeleton = txSkeleton.update("witnesses", (witnesses) => witnesses.set(firstIndex, witness));
        }

        return txSkeleton;
    }

    extractPrivateKeys(txSkeleton: TransactionSkeletonType, fromAddresses: string[], privateKeys: string[]): string[] {
        const signingPrivKeys: string[] = [];

        for (let i = 0; i < fromAddresses.length; i += 1) {
            const index = this.getScriptFirstIndex(txSkeleton, this.connection.getLockFromAddress(fromAddresses[i]));
            if (index !== -1) {
                signingPrivKeys[index] = privateKeys[i];
            }
        }

        return signingPrivKeys.filter((privKey) => !!privKey);
    }

    async addressHasTransactions(address: string, toBlock?: string, fromBlock?: string): Promise<boolean> {
        const transactionCollector = this.getTransactionCollector(address, false, toBlock, fromBlock);

        const txs = await transactionCollector.count();
        return txs > 0;
    }

    async getLumosTransactions(address: string, toBlock?: string, fromBlock?: string): Promise<TransactionWithStatus[]> {
        const transactionCollector = this.getTransactionCollector(address, true, toBlock, fromBlock);
        const transactions: TransactionWithStatus[] = [];

        for await (const lumosTx of transactionCollector.collect()) {
            transactions.push(lumosTx);
        }

        return transactions;
    }

    async getTransactions(address: string, allAddresses: string[], toBlock?: string, fromBlock?: string): Promise<Transaction[]> {
        const transactionCollector = this.getTransactionCollector(address, true, toBlock, fromBlock);
        const transactions: Transaction[] = [];
        let lumosTx: TransactionWithStatus;

        for await (lumosTx of transactionCollector.collect()) {
            const key = `${address}-${lumosTx.transaction.hash}`;
            if (!this.transactionMap.has(key)) {
                const parsedTx = await this.getTransactionFromLumosTx(lumosTx, address, allAddresses);
                this.transactionMap.set(key, parsedTx);
            }

            const transaction = this.transactionMap.get(key);
            if (!transactions.includes(transaction!)) {
                transactions.push(transaction!);
            }
        }

        return transactions;
    }

    async getTransactionFromHash(txHash: string, addresses: string[]): Promise<Transaction> {
        const transaction = await this.connection.getTransactionFromHash(txHash, false);
        return this.getTransactionFromLumosTx(transaction, addresses[addresses.length - 1], addresses);
    }

    signTransaction(txSkeleton: TransactionSkeletonType, privateKeys: string[]): LumosTx {
        const txSkeletonWEntries = commons.common.prepareSigningEntries(txSkeleton, this.connection.getConfigAsObject());
        if (privateKeys.length !== txSkeletonWEntries.get("signingEntries").count()) {
            this.logger.error("Invalid private keys length");
            throw new Error("Invalid private keys length");
        }

        const signatures = [];
        for (let i = 0; i < privateKeys.length; i += 1) {
            const entry = txSkeletonWEntries.get("signingEntries").get(i);
            signatures.push(hd.key.signRecoverable(entry!.message, privateKeys[i]));
        }
        return sealTransaction(txSkeletonWEntries, signatures);
    }

    async signAndSendTransaction(txSkeleton: TransactionSkeletonType, privateKeys: string[]): Promise<string> {
        const signedTx = this.signTransaction(txSkeleton, privateKeys);
        const hash = await this.connection.getRPC().sendTransaction(signedTx, "passthrough");

        return hash;
    }
}
