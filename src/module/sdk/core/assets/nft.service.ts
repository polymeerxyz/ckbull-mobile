import { Cell, DepType, HashType, Script } from "@ckb-lumos/lumos";
import { TransactionSkeleton, TransactionSkeletonType, minimalCellCapacityCompatible } from "@ckb-lumos/helpers";
import { common } from "@ckb-lumos/common-scripts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as NrcSdk from "@rather-labs/nrc-721-sdk";
import {
    DecodedContentType,
    bufferToRawString,
    decodeContentType,
    packRawSporeData,
    unpackToRawSporeData,
    generateTypeId,
    setAbsoluteCapacityMargin,
    calculateFeeByTransactionSkeleton,
} from "@spore-sdk/core";
import { Logger } from "../../utils/logger";
import { ConnectionService, Environments } from "../connection.service";
import { FeeRate, ScriptType, TransactionService } from "../transaction.service";
import { NftSdk } from "./nft.types";

export type Nft = Nrc721Nft | MNft | SporeNft;

export enum NftTypes {
    Nrc721,
    MNft,
    Spore,
}

export interface CommonNft {
    tokenId: string;
    type: NftTypes;
    rawData: string;
    script: Script;
}

export interface Nrc721Nft extends CommonNft {
    type: NftTypes.Nrc721;
    nftName: string;
    tokenUri: string;
    data: any;
    nftSymbol: string;
    nftExtraData: string;
}

export interface MNft extends CommonNft {
    type: NftTypes.MNft;
    nftName: string;
    tokenUri: string;
    issued: number;
    total: number;
    data: {
        description: string;
        version: number;
        configure: number;
        type: "m-NFT";
    };
}

export interface BaseMNft {
    name: string;
    description: string;
    renderer: string;
    version: number;
    configure: number;
    issued: number;
    total: number;
}

export interface SporeNft extends CommonNft {
    type: NftTypes.Spore;
    contentType: DecodedContentType;
    contentTypeRaw: string;
    // content has data of contentType.mediaType mimetype
    content: string;
    contentEncoded: string;
    version: string;
    immortal: boolean;
    clusterId?: string;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface NftConfigType {
    txHash: string;
    index: string;
    depType: DepType;
    hashType: HashType;
    codeHash?: string;
    classCodeHash?: string;
    version?: string;
}

const nftConfig: { [key in Environments]: { [key in NftTypes]: NftConfigType[] } } = {
    [Environments.Mainnet]: {
        [NftTypes.Nrc721]: [
            {
                txHash: "0xb85f64679b43e6742ff2b874621d1d75c9680961c94de8187364474d637eddab",
                index: "0x0",
                depType: "code",
                hashType: "type",
            },
        ],
        [NftTypes.MNft]: [
            {
                txHash: "0x5dce8acab1750d4790059f22284870216db086cb32ba118ee5e08b97dc21d471",
                index: "0x2",
                depType: "code",
                hashType: "type",
                codeHash: "0x2b24f0d644ccbdd77bbf86b27c8cca02efa0ad051e447c212636d9ee7acaaec9",
                classCodeHash: "0xd51e6eaf48124c601f41abe173f1da550b4cbca9c6a166781906a287abbb3d9a",
            },
        ],
        [NftTypes.Spore]: [
            {
                txHash: "0x96b198fb5ddbd1eed57ed667068f1f1e55d07907b4c0dbd38675a69ea1b69824",
                index: "0x0",
                depType: "code",
                hashType: "data1",
                codeHash: "0x4a4dce1df3dffff7f8b2cd7dff7303df3b6150c9788cb75dcf6747247132b9f5",
                version: "0.2.2",
            },
        ],
    },
    [Environments.Testnet]: {
        [NftTypes.Nrc721]: [
            {
                txHash: "0xb22f046e3bc62ca3741e732cff136f5bb34038eb0437f21dded1556a8cc87cec",
                index: "0x0",
                depType: "code",
                hashType: "type",
            },
        ],
        [NftTypes.MNft]: [
            {
                txHash: "0xf11ccb6079c1a4b3d86abe2c574c5db8d2fd3505fdc1d5970b69b31864a4bd1c",
                index: "0x2",
                depType: "code",
                hashType: "type",
                codeHash: "0xb1837b5ad01a88558731953062d1f5cb547adf89ece01e8934a9f0aeed2d959f",
                classCodeHash: "0x095b8c0b4e51a45f953acd1fcd1e39489f2675b4bc94e7af27bb38958790e3fc",
            },
        ],
        [NftTypes.Spore]: [
            {
                txHash: "0xfd694382e621f175ddf81ce91ce2ecf8bfc027d53d7d31b8438f7d26fc37fd19",
                index: "0x0",
                depType: "code",
                hashType: "data1",
                codeHash: "0xbbad126377d45f90a8ee120da988a2d7332c78ba8fd679aab478a19d6c133494",
                version: "0.1.0",
            },
            {
                txHash: "0x5e8d2a517d50fd4bb4d01737a7952a1f1d35c8afc77240695bb569cd7d9d5a1f",
                index: "0x0",
                depType: "code",
                hashType: "data1",
                codeHash: "0x685a60219309029d01310311dba953d67029170ca4848a4ff638e57002130a0d",
                version: "0.2.2",
            },
            {
                txHash: "0x06995b9fc19461a2bf9933e57b69af47a20bf0a5bc6c0ffcb85567a2c733f0a1",
                index: "0x0",
                depType: "code",
                hashType: "data1",
                codeHash: "0x5e063b4c0e7abeaa6a428df3b693521a3050934cf3b0ae97a800d1bc31449398",
                version: "0.2.1",
            },
        ],
    },
};

export class NftService {
    private readonly connection: ConnectionService;
    private transactionService?: TransactionService;
    private readonly logger = new Logger(NftService.name);
    private nftSdk: NftSdk = null!;
    private initializing = false;
    private readonly nftCellSize = BigInt(142 * 10 ** 8);

    constructor(connectionService: ConnectionService) {
        this.connection = connectionService;
    }

    private static mNftFormat(dataHex: string): BaseMNft {
        const data = dataHex.slice(2);
        const version = parseInt(data.slice(0, 1), 16);
        const total = parseInt(data.slice(1, 10), 16);
        const issued = parseInt(data.slice(10, 18), 16);
        const configure = parseInt(data.slice(18, 20), 16);
        const nameSize = parseInt(data.slice(20, 24), 16);
        const nameEnd = 24 + nameSize * 2;
        const name = decodeURIComponent(data.slice(24, nameEnd).replace(/[0-9a-f]{2}/g, "%$&"));
        const descriptionSizeEnd = nameEnd + 4;
        const descriptionSize = parseInt(data.slice(nameEnd, descriptionSizeEnd), 16);
        const descriptionEnd = descriptionSizeEnd + descriptionSize * 2;
        const description = decodeURIComponent(data.slice(descriptionSizeEnd, descriptionEnd).replace(/[0-9a-f]{2}/g, "%$&"));
        const rendererSizeEnd = descriptionEnd + 4;
        const rendererSize = parseInt(data.slice(descriptionEnd, rendererSizeEnd), 16);
        const rendererEnd = rendererSizeEnd + rendererSize * 2;
        const renderer = decodeURIComponent(data.slice(rendererSizeEnd, rendererEnd).replace(/[0-9a-f]{2}/g, "%$&"));

        return {
            name: name,
            description: description,
            renderer: renderer,
            version: version,
            configure: configure,
            issued: issued,
            total: total,
        };
    }

    private getNrc721Config(): NftConfigType[] {
        return nftConfig[this.connection.getEnvironment()][NftTypes.Nrc721];
    }

    private getNrc721ConfigFromScript(script: Script): NftConfigType | null {
        const nrc721Cfgs = nftConfig[this.connection.getEnvironment()][NftTypes.Nrc721];

        for (const cfg of nrc721Cfgs) {
            if (script.codeHash === cfg.codeHash && script.hashType === cfg.hashType) {
                return cfg;
            }
        }

        return null;
    }

    private getMNftConfig(): NftConfigType[] {
        return nftConfig[this.connection.getEnvironment()][NftTypes.MNft];
    }

    private getMNftConfigFromScript(script: Script): NftConfigType | null {
        const mNftCfgs = nftConfig[this.connection.getEnvironment()][NftTypes.MNft];

        for (const cfg of mNftCfgs) {
            if (script.codeHash === cfg.codeHash && script.hashType === cfg.hashType) {
                return cfg;
            }
        }

        return null;
    }

    private getSporeConfig(): NftConfigType[] {
        return nftConfig[this.connection.getEnvironment()][NftTypes.Spore];
    }

    private getSporeConfigFromScript(script: Script): NftConfigType | null {
        const sporeNftCfgs = nftConfig[this.connection.getEnvironment()][NftTypes.Spore];

        for (const cfg of sporeNftCfgs) {
            if (script.codeHash === cfg.codeHash && script.hashType === cfg.hashType) {
                return cfg;
            }
        }

        return null;
    }

    private async isNrc721Nft(script: Script): Promise<boolean> {
        let isNftCell: boolean;
        try {
            isNftCell = await this.nftSdk!.nftCell.isCellNRC721(script);
        } catch (error) {
            isNftCell = false;
        }

        return isNftCell;
    }

    private isMNft(script: Script): boolean {
        return this.getMNftConfigFromScript(script) !== null;
    }

    private isSporeNft(script: Script): boolean {
        return this.getSporeConfigFromScript(script) !== null;
    }

    private addCellDepFromNftConfig(txSkeleton: TransactionSkeletonType, nftCfg: NftConfigType): TransactionSkeletonType {
        return txSkeleton.update("cellDeps", (cellDeps) => {
            return cellDeps.push({
                outPoint: {
                    txHash: nftCfg.txHash,
                    index: nftCfg.index,
                },
                depType: nftCfg.depType,
            });
        });
    }

    setTransactionService(transactionService: TransactionService) {
        this.transactionService = transactionService;
    }

    async initialize() {
        if (!this.nftSdk && !this.initializing) {
            this.initializing = true;
            this.nftSdk = await NrcSdk.initialize({
                nodeUrl: this.connection.getCKBUrl(),
                indexerUrl: this.connection.getIndexerUrl(),
            });
        } else if (!this.nftSdk) {
            while (!this.nftSdk) {
                await sleep(100);
            }
        }
    }

    async isScriptNftScript(script: ScriptType): Promise<boolean> {
        await this.initialize();
        return this.isMNft(script) || this.isSporeNft(script) || (await this.isNrc721Nft(script));
    }

    async getNftFromCell(cell: Cell): Promise<Nft | null> {
        const cellTypeScript = cell.cellOutput.type;
        if (!cellTypeScript) {
            return null;
        }

        const mNft = await this.getMNftFromCell(cell);
        if (mNft) {
            return mNft;
        }

        const sporeNft = await this.getSporeNftFromCell(cell);
        if (sporeNft) {
            return sporeNft;
        }

        const nrc721Nft = await this.getNRC721NftFromCell(cell);
        if (nrc721Nft) {
            return nrc721Nft;
        }

        return null;
    }

    private async getNRC721NftFromCell(cell: Cell): Promise<Nrc721Nft | null> {
        const typeScript = cell.cellOutput.type!;
        const isNftCell = await this.isNrc721Nft(typeScript);
        if (!isNftCell) {
            return null;
        }

        const nft = await this.nftSdk!.nftCell.read(typeScript);

        return {
            type: NftTypes.Nrc721,
            tokenId: nft.tokenId,
            tokenUri: nft.tokenUri,
            data: JSON.parse(nft.data),
            nftName: nft.factoryData.name,
            nftSymbol: nft.factoryData.symbol,
            nftExtraData: nft.factoryData.extraData,
            script: typeScript,
            rawData: cell.data,
        };
    }

    private async getMNftFromCell(cell: Cell): Promise<MNft | null> {
        const typeScript = cell.cellOutput.type!;
        const mNftCfg = this.getMNftConfigFromScript(typeScript);
        if (!mNftCfg) {
            return null;
        }

        const cellProvider = this.connection.getCellProvider({
            type: {
                codeHash: mNftCfg.classCodeHash!,
                args: typeScript.args.slice(0, -8),
                hashType: "type",
            },
        });

        const cells: Cell[] = [];
        const cellCollector = cellProvider.collector({});
        for await (const cell of cellCollector.collect()) {
            cells.push(cell);
        }

        if (cells.length !== 1) {
            return null;
        }

        const mNft = NftService.mNftFormat(cells[0].data);
        return {
            type: NftTypes.MNft,
            nftName: mNft.name,
            tokenId: parseInt(typeScript.args.slice(-8), 16).toString(),
            tokenUri: mNft.renderer,
            issued: mNft.issued,
            total: mNft.total,
            data: {
                description: mNft.description,
                version: mNft.version,
                configure: mNft.configure,
                type: "m-NFT",
            },
            script: typeScript,
            rawData: cell.data,
        };
    }

    private async getSporeNftFromCell(cell: Cell): Promise<SporeNft | null> {
        const typeScript = cell.cellOutput.type!;
        const sporeCfg = this.getSporeConfigFromScript(typeScript);
        if (!sporeCfg) {
            return null;
        }

        const sporeData = unpackToRawSporeData(cell.data);
        const contentType = decodeContentType(sporeData.contentType);

        return {
            type: NftTypes.Spore,
            tokenId: typeScript.args,
            script: typeScript,
            rawData: cell.data,
            contentType: contentType,
            contentTypeRaw: sporeData.contentType,
            content: bufferToRawString(sporeData.content),
            contentEncoded: sporeData.content.toString(),
            immortal: contentType.parameters.immortal ? true : false,
            version: sporeCfg.version!,
            clusterId: sporeData.clusterId?.toString(),
        };
    }

    async transferFromCells(
        cells: Cell[],
        fromAddresses: string[],
        to: string,
        nft: Nft,
        privateKeys: string[],
        feeRate: FeeRate = FeeRate.NORMAL,
    ): Promise<string> {
        if (!this.transactionService) {
            throw new Error("No transaction service");
        }
        let txSkeleton = TransactionSkeleton({ cellProvider: this.connection.getCellProvider() });

        // Add deps
        let cfg: NftConfigType | null = null;
        if (nft.type === NftTypes.MNft) {
            cfg = this.getMNftConfigFromScript(nft.script);
        } else if (nft.type === NftTypes.Spore) {
            cfg = this.getSporeConfigFromScript(nft.script);
        } else {
            cfg = this.getNrc721ConfigFromScript(nft.script);
        }
        if (!cfg) {
            throw new Error("Nft config not found!");
        }

        txSkeleton = this.transactionService.addSecp256CellDep(txSkeleton);
        txSkeleton = this.addCellDepFromNftConfig(txSkeleton, cfg);

        // Inject tokens
        const toScript = this.connection.getLockFromAddress(to);
        const outputCell = {
            cellOutput: {
                capacity: "0x" + this.nftCellSize.toString(16),
                lock: toScript,
                type: {
                    codeHash: nft.script.codeHash,
                    hashType: nft.script.hashType,
                    args: nft.script.args,
                },
            },
            data: nft.rawData,
        };
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
            return outputs.push(outputCell);
        });

        txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
            return fixedEntries.push({
                field: "outputs",
                index: txSkeleton.get("outputs").size - 1,
            });
        });

        txSkeleton = this.transactionService.injectNftCapacity(txSkeleton, nft.script, nft.rawData, cells);

        // Pay fee
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
            txSkeleton = await common.payFeeByFeeRate(txSkeleton, fromAddresses, feeRate, undefined, this.connection.getConfigAsObject());
        }

        // Get signing private keys
        const signingPrivKeys = this.transactionService.extractPrivateKeys(txSkeleton, fromAddresses, privateKeys);

        return this.transactionService.signAndSendTransaction(txSkeleton, signingPrivKeys);
    }

    async mintSporeFromCells(
        cells: Cell[],
        fromAddresses: string[],
        to: string,
        mimeType: string,
        content: string,
        immortal: boolean,
        privateKeys: string[],
        feeRate: FeeRate = FeeRate.NORMAL,
    ): Promise<string> {
        if (!this.transactionService) {
            throw new Error("No transaction service");
        }
        const cfg = this.getSporeConfig()[0];
        let txSkeleton = TransactionSkeleton({ cellProvider: this.connection.getCellProvider() });

        // Add token deps
        txSkeleton = this.transactionService.addSecp256CellDep(txSkeleton);
        txSkeleton = this.addCellDepFromNftConfig(txSkeleton, cfg);

        // Create output nft without args
        const toScript = this.connection.getLockFromAddress(to);
        const contentType = immortal ? `${mimeType};immortal=true` : mimeType;
        const data = packRawSporeData({ contentType, content: Buffer.from(content), clusterId: undefined });
        const outputCell = setAbsoluteCapacityMargin(
            {
                cellOutput: {
                    capacity: "0x0",
                    lock: toScript,
                    type: {
                        codeHash: cfg.codeHash!,
                        hashType: cfg.hashType,
                        args: "0x" + "0".repeat(64), // Fill 32-byte TypeId placeholder
                    },
                },
                data: "0x" + Buffer.from(data).toString("hex"),
            },
            1_0000_0000,
        );
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
            return outputs.push(outputCell);
        });

        // Add capacity from inputs
        txSkeleton = this.transactionService.injectCapacity(txSkeleton, BigInt(outputCell.cellOutput.capacity), cells);

        // Compute nft id (args) from input and output position
        const args = generateTypeId(txSkeleton.get("inputs").get(0)!, 0);

        // Add id to output type args
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
            const output = outputs.get(0)!;
            output.cellOutput.type!.args = args;
            return outputs.set(0, output);
        });

        // Add fixed entries
        txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
            return fixedEntries.push({
                field: "outputs",
                index: txSkeleton.get("outputs").size - 1,
            });
        });

        // Pay fee
        txSkeleton = await common.payFeeByFeeRate(txSkeleton, fromAddresses, feeRate, undefined, this.connection.getConfigAsObject());

        // Get signing private keys
        const signingPrivKeys = this.transactionService.extractPrivateKeys(txSkeleton, fromAddresses, privateKeys);

        return this.transactionService.signAndSendTransaction(txSkeleton, signingPrivKeys);
    }

    async meltSporeNftFromCells(
        cells: Cell[],
        fromAddresses: string[],
        to: string,
        nft: Nft,
        privateKeys: string[],
        feeRate: FeeRate = FeeRate.NORMAL,
    ): Promise<string> {
        if (!this.transactionService) {
            throw new Error("No transaction service");
        }
        if (nft.type !== NftTypes.Spore) {
            throw new Error("Invalid Nft type");
        }
        if (nft.immortal) {
            throw new Error("Cannot melt immortal spore nfts");
        }

        const [cell] = cells.filter((cl) => cl.cellOutput.type && cl.cellOutput.type.args === nft.tokenId);
        if (!cell) {
            throw new Error("Cell with nft not found");
        }

        let txSkeleton = TransactionSkeleton({ cellProvider: this.connection.getCellProvider() });

        // Add code deps
        const cfg = this.getSporeConfigFromScript(cell.cellOutput.type!);
        if (!cfg) {
            throw new Error("Spore config not found!");
        }
        txSkeleton = this.transactionService.addSecp256CellDep(txSkeleton);
        txSkeleton = this.addCellDepFromNftConfig(txSkeleton, cfg);

        // Add input
        txSkeleton = txSkeleton.update("inputs", (inputs) => inputs.push(cell));

        // Add output
        const toScript = this.connection.getLockFromAddress(to);
        const outputCell = {
            cellOutput: {
                capacity: cell.cellOutput.capacity,
                lock: toScript,
            },
            data: "0x",
        };
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
            return outputs.push(outputCell);
        });

        // Add witnesses
        txSkeleton = txSkeleton.update("witnesses", (witnesses) => witnesses.push("0x"));
        txSkeleton = this.transactionService.addWitnesses(txSkeleton, cell.cellOutput.lock);

        // Pay fee
        const minCapacity = minimalCellCapacityCompatible(outputCell);
        const fee = calculateFeeByTransactionSkeleton(txSkeleton, feeRate);
        if (minCapacity.add(fee).lte(cell.cellOutput.capacity)) {
            txSkeleton = txSkeleton.update("outputs", (outputs) => {
                const output = outputs.get(0)!;
                const capacity = BigInt(output.cellOutput.capacity);
                output.cellOutput.capacity = "0x" + (capacity - fee.toBigInt()).toString(16);
                return outputs.set(0, output);
            });
        } else {
            txSkeleton = await common.payFeeByFeeRate(txSkeleton, fromAddresses, feeRate, undefined, this.connection.getConfigAsObject());
        }

        // Get signing private keys
        const signingPrivKeys = this.transactionService.extractPrivateKeys(txSkeleton, fromAddresses, privateKeys);

        return this.transactionService.signAndSendTransaction(txSkeleton, signingPrivKeys);
    }

    async getBalance(address: string): Promise<Nft[]> {
        await this.initialize();

        const collector = this.connection.getIndexer().collector({
            lock: this.connection.getLockFromAddress(address),
        });

        const nfts: Nft[] = [];
        for await (const cell of collector.collect()) {
            const nft = await this.getNftFromCell(cell);
            if (nft) {
                nfts.push(nft);
            }
        }

        return nfts;
    }

    async getBalanceFromCells(cells: Cell[]): Promise<Nft[]> {
        await this.initialize();

        const nfts: Nft[] = [];
        for await (const cell of cells) {
            const nft = await this.getNftFromCell(cell);

            if (nft) {
                nfts.push(nft);
            }
        }

        return nfts;
    }
}
