// TODO change @nervosnetwork/ckb-sdk-core Cell and RawTransaction types
import { Cell, RawTransaction, Script } from "@ckb-lumos/lumos";

export interface MintNftParams {
    name: string;
    symbol: string;
    baseTokenUri: string;
    sourceAddress: string;
    targetAddress: string;
    extraData: Buffer;
    fee?: number;
    factoryContractTypeScript?: Script;
    factoryContractDep?: Script;
    extraDeps?: string[];
}

export interface MintNftResponse {
    rawTransaction: RawTransaction;
    typeScript: Script;
    usedCapacity: bigint;
    inputCells: Cell[];
}

export interface FactoryData {
    name: string;
    symbol: string;
    baseTokenUri: string;
    extraData: string;
}

export interface ReadFactoryResponse {
    data: FactoryData;
    rawCell: Cell;
}

export interface FactoryConstants {
    TYPE_CODE_HASH_SIZE: number;
    TYPE_ARGS_SIZE: number;
}

export interface CreateNewTypeScriptParams {
    rawTransaction: RawTransaction;
    factoryTypeScript: Script;
    nftTypeCodeHash: string;
    outputIndex: string;
}

export interface MintParams {
    nftContractTypeScript: Script;
    factoryTypeScript: Script;
    sourceAddress: string;
    targetAddress: string;
    nftContractDep?: Script;
    extraDeps?: string[];
    fee?: number;
    data?: any;
}

export interface MintResponse {
    rawTransaction: RawTransaction;
    nftTypeScript: Script;
    usedCapacity: bigint;
    inputCells: Cell[];
}

export interface ReadNftResponse {
    tokenId: string;
    tokenUri: string;
    data: string;
    factoryData: FactoryData;
    rawCell: Cell;
}

export interface NftFactoryCell {
    mint: (mintData: MintNftParams) => Promise<MintNftResponse>;
    readOne: (typeScript: Script) => Promise<ReadFactoryResponse>;
    isCellNRC721: (factoryTypeScript: Script) => Promise<boolean>;
    CONSTANTS: FactoryConstants;
}

export interface NftSdkCell {
    getAllFactoryNftsByAdress: ({ userAdress, factoryTypeScript }: { userAdress: string; factoryTypeScript: Script }) => Promise<Cell[]>;
    createNewTypeScript: (params: CreateNewTypeScriptParams) => Script;
    mint: (params: MintParams) => Promise<MintResponse>;
    read: (nftTypeScript: Script) => Promise<ReadNftResponse>;
    isCellNRC721: (nftTypeScript: Script) => Promise<boolean>;
}

export interface NftSdkUtils {
    getCellOccupiedCapacity: (cell: Cell, data: string) => number;
    bigNumberCKBToShannon: (amount: number | StringConstructor) => bigint;
    serializeInputCell: (inputCell: Cell) => Buffer;
    hxShannonToCKB: (hexNumber: string) => number;
    CKBToShannon: (amount: number) => bigint;
    shannonToCKB: (amount: number) => number;
    hexToBytes: (hexString: string) => number[];
}

export interface NftSdk {
    factoryCell: NftFactoryCell;
    nftCell: NftSdkCell;
    utils: NftSdkUtils;
}
