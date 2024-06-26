import { RPC, config, Script, helpers, OutPoint, Indexer } from "@ckb-lumos/lumos";
import {
    TransactionWithStatus,
    Header,
    ChainInfo,
    CellWithStatus,
    Indexer as IndexerType,
    CellProvider,
    CellCollector,
    QueryOptions,
} from "@ckb-lumos/base";
import { Config, ScriptConfig } from "@ckb-lumos/config-manager";
import {
    isSecp256k1Blake160Address,
    isAcpAddress,
    isSecp256k1Blake160MultisigAddress,
    isOmnilockAddress,
} from "@ckb-lumos/common-scripts/lib/helper";
import { createInstance } from "dotbit";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";
import { CKB_SYMBOL } from "../constants";

// AGGRON4 for test, LINA for main
const { AGGRON4, LINA } = config.predefined;

export enum Environments {
    Mainnet = "mainnet",
    Testnet = "testnet",
}

const OnepassConfig: { [key in Environments]: ScriptConfig } = {
    [Environments.Mainnet]: {
        CODE_HASH: "0xd01f5152c267b7f33b9795140c2467742e8424e49ebe2331caec197f7281b60a",
        HASH_TYPE: "type",
        TX_HASH: "0x86a5e91ad93475caf30a3d3b0258786dd463984f71e8471abc5574f206f6207a",
        INDEX: "0x0",
        DEP_TYPE: "code",
    },
    [Environments.Testnet]: {
        CODE_HASH: "0x3e1eb7ed4809b2d60650be96a40abfbdafb3fb942b7b37ec7709e64e2cd0a783",
        HASH_TYPE: "type",
        TX_HASH: "0x8b98ede6bf7b5baba767b1d2d46a13749fc810375b14152abbc259a7fc98e46d",
        INDEX: "0x0",
        DEP_TYPE: "code",
    },
};

const ForceBridgeConfig: { [key in Environments]: ScriptConfig } = {
    [Environments.Mainnet]: {
        CODE_HASH: "0x9f3aeaf2fc439549cbc870c653374943af96a0658bd6b51be8d8983183e6f52f",
        HASH_TYPE: "type",
        TX_HASH: "0xaa8ab7e97ed6a268be5d7e26d63d115fa77230e51ae437fc532988dd0c3ce10a",
        INDEX: "0x1",
        DEP_TYPE: "code",
    },
    [Environments.Testnet]: {
        CODE_HASH: "0x79f90bb5e892d80dd213439eeab551120eb417678824f282b4ffb5f21bad2e1e",
        HASH_TYPE: "type",
        TX_HASH: "0x9154df4f7336402114d04495175b37390ce86a4906d2d4001cf02c3e6d97f39c",
        INDEX: "0x0",
        DEP_TYPE: "code",
    },
};

const BitConfig: { [key in Environments]: ScriptConfig } = {
    [Environments.Mainnet]: {
        CODE_HASH: "0x9376c3b5811942960a846691e16e477cf43d7c7fa654067c9948dfcd09a32137",
        HASH_TYPE: "type",
        TX_HASH: "0x440acccb5495e3395c72a8006d384c28840f41df471ef0423475e66f8717cfe4",
        INDEX: "0x0",
        DEP_TYPE: "code",
    },
    [Environments.Testnet]: {
        CODE_HASH: "",
        HASH_TYPE: "type",
        TX_HASH: "",
        INDEX: "",
        DEP_TYPE: "code",
    },
};

const PwlockK1AcplConfig: { [key in Environments]: ScriptConfig } = {
    [Environments.Mainnet]: {
        CODE_HASH: "0xbf43c3602455798c1a61a596e0d95278864c552fafe231c063b3fabf97a8febc",
        HASH_TYPE: "type",
        TX_HASH: "0x1d60cb8f4666e039f418ea94730b1a8c5aa0bf2f7781474406387462924d15d4",
        INDEX: "0x0",
        DEP_TYPE: "code",
    },
    [Environments.Testnet]: {
        CODE_HASH: "0x58c5f491aba6d61678b7cf7edf4910b1f5e00ec0cde2f42e0abb4fd9aff25a63",
        HASH_TYPE: "type",
        TX_HASH: "0x4f254814b972421789fafef49d4fee94116863138f72ab1e6392daf3decfaec1",
        INDEX: "0x0",
        DEP_TYPE: "code",
    },
};

const JoyIdConfig: { [key in Environments]: ScriptConfig } = {
    [Environments.Mainnet]: {
        CODE_HASH: "0xd00c84f0ec8fd441c38bc3f87a371f547190f2fcff88e642bc5bf54b9e318323",
        HASH_TYPE: "type",
        TX_HASH: "0xf05188e5f3a6767fc4687faf45ba5f1a6e25d3ada6129dae8722cb282f262493",
        INDEX: "0x0",
        DEP_TYPE: "depGroup",
    },
    [Environments.Testnet]: {
        CODE_HASH: "0xd23761b364210735c19c60561d213fb3beae2fd6172743719eff6920e020baac",
        HASH_TYPE: "type",
        TX_HASH: "0x4dcf3f3b09efac8995d6cbee87c5345e812d310094651e0c3d9a730f32dc9263",
        INDEX: "0x0",
        DEP_TYPE: "depGroup",
    },
};

class CustomCellProvider implements CellProvider {
    public readonly uri: string;

    constructor(
        private readonly indexer: IndexerType,
        private readonly myQueryOptions: QueryOptions,
    ) {
        this.uri = indexer.uri;
    }

    collector(queryOptions: QueryOptions): CellCollector {
        return this.indexer.collector({ ...queryOptions, ...this.myQueryOptions });
    }
}

export class ConnectionService {
    private readonly ckbUrl: string;
    private readonly indexerUrl: string;
    private readonly env: Environments;
    private readonly rpc: RPC;
    private readonly indexer: IndexerType;
    private readonly config: Config;
    private blockHeaderNumberMap = new Map<string, Header>();
    private blockHeaderHashMap = new Map<string, Header>();
    private transactionMap = new Map<string, TransactionWithStatus>();

    constructor(ckbUrl: string, indexerUrl: string, env: Environments) {
        this.ckbUrl = ckbUrl;
        this.indexerUrl = indexerUrl;
        this.env = env;
        this.rpc = new RPC(this.ckbUrl);
        this.indexer = new Indexer(this.indexerUrl, this.ckbUrl);
        this.config = env === Environments.Mainnet ? LINA : AGGRON4;
        config.initializeConfig(this.config);
    }

    async getBlockchainInfo(): Promise<ChainInfo> {
        return this.rpc.getBlockchainInfo();
    }

    setBlockHeaderMaps(header: Header): void {
        this.blockHeaderHashMap.set(header.hash, header);
        this.blockHeaderNumberMap.set(header.number, header);
    }

    async getCurrentBlockHeader(): Promise<Header> {
        const lastBlockHeader = await this.rpc.getTipHeader();
        this.setBlockHeaderMaps(lastBlockHeader);
        return lastBlockHeader;
    }

    async getBlockHeaderFromHash(blockHash: string): Promise<Header> {
        if (!this.blockHeaderHashMap.has(blockHash)) {
            const header = await this.rpc.getHeader(blockHash);
            this.setBlockHeaderMaps(header!);
        }
        return this.blockHeaderHashMap.get(blockHash)!;
    }

    async getBlockHeaderFromNumber(blockNumber: string): Promise<Header> {
        if (!this.blockHeaderNumberMap.has(blockNumber)) {
            const header = await this.rpc.getHeaderByNumber(blockNumber);
            this.setBlockHeaderMaps(header!);
        }
        return this.blockHeaderNumberMap.get(blockNumber)!;
    }

    async getCell(outPoint: OutPoint): Promise<CellWithStatus> {
        return this.rpc.getLiveCell(outPoint, true);
    }

    async getTransactionFromHash(transactionHash: string, useMap = true): Promise<TransactionWithStatus> {
        if (!useMap || !this.transactionMap.has(transactionHash)) {
            const transaction = await this.rpc.getTransaction(transactionHash);
            this.transactionMap.set(transactionHash, transaction!);
        }
        return this.transactionMap.get(transactionHash)!;
    }

    getConfig(): Config {
        return this.config;
    }

    getConfigAsObject(): any {
        return { config: this.config };
    }

    getRPC(): RPC {
        return this.rpc;
    }

    getEnvironment(): Environments {
        return this.env;
    }

    getIndexer(): IndexerType {
        return this.indexer;
    }

    getCellProvider(queryOptions: QueryOptions = {}): CellProvider {
        return new CustomCellProvider(this.indexer, queryOptions);
    }

    getEmptyCellProvider(queryOptions: QueryOptions = {}): CellProvider {
        return this.getCellProvider({ ...queryOptions, type: "empty" });
    }

    getCKBUrl(): string {
        return this.ckbUrl;
    }

    getIndexerUrl(): string {
        return this.indexerUrl;
    }

    getAddressFromLock(lock: Script): string {
        // return helpers.generateAddress(lock, { config: this.config });
        return helpers.encodeToAddress(lock, { config: this.config });
    }

    getLockFromAddress(address: string): Script {
        return helpers.parseAddress(address, { config: this.config });
    }

    static getLockFromAddress(address: string, config: Config): Script {
        return helpers.parseAddress(address, { config });
    }

    static isAddress(network: Environments, address: string): boolean {
        const config = network === Environments.Mainnet ? LINA : AGGRON4;
        try {
            return (
                isSecp256k1Blake160Address(address, config) ||
                isAcpAddress(address, config) ||
                isSecp256k1Blake160MultisigAddress(address, config) ||
                isOmnilockAddress(address, config) ||
                ConnectionService.isOnepassAddress(network, address) ||
                ConnectionService.isPwlockK1AcplAddress(network, address) ||
                ConnectionService.isForceBridgeAddress(network, address) ||
                ConnectionService.isBitAddress(network, address) ||
                ConnectionService.isJoyIdAddress(network, address)
            );
        } catch (err) {
            return false;
        }
    }

    static isDomain(domain: string): boolean {
        if (!domain) {
            return false;
        }
        try {
            const account = ConnectionService.domainExistFromBit(domain);
            return account !== null;
        } catch (err) {
            return false;
        }
    }

    static domainExistFromBit(domain: string): boolean {
        const dotbit = createInstance();
        const account = dotbit.account(domain);
        return account.status === 0;
    }

    static async getAddressFromDomain(domain: string): Promise<BitAccountRecordAddress[]> {
        const dotbit = createInstance();
        return await dotbit.addresses(domain, CKB_SYMBOL);
    }

    static getLockFromAddressNetwork(network: Environments, address: string): Script {
        const config = network === Environments.Mainnet ? LINA : AGGRON4;
        return ConnectionService.getLockFromAddress(address, config);
    }

    static isOnepassAddress(network: Environments, address: string): boolean {
        const lock = ConnectionService.getLockFromAddressNetwork(network, address);
        return lock.codeHash === OnepassConfig[network].CODE_HASH && lock.hashType === OnepassConfig[network].HASH_TYPE;
    }

    static isForceBridgeAddress(network: Environments, address: string): boolean {
        const lock = ConnectionService.getLockFromAddressNetwork(network, address);
        return lock.codeHash === ForceBridgeConfig[network].CODE_HASH && lock.hashType === ForceBridgeConfig[network].HASH_TYPE;
    }

    static isBitAddress(network: Environments, address: string): boolean {
        const lock = ConnectionService.getLockFromAddressNetwork(network, address);
        return lock.codeHash === BitConfig[network].CODE_HASH && lock.hashType === BitConfig[network].HASH_TYPE;
    }

    static isJoyIdAddress(network: Environments, address: string): boolean {
        const lock = ConnectionService.getLockFromAddressNetwork(network, address);
        return lock.codeHash === JoyIdConfig[network].CODE_HASH && lock.hashType === JoyIdConfig[network].HASH_TYPE;
    }

    static isPwlockK1AcplAddress(network: Environments, address: string): boolean {
        const lock = ConnectionService.getLockFromAddressNetwork(network, address);
        return lock.codeHash === PwlockK1AcplConfig[network].CODE_HASH && lock.hashType === PwlockK1AcplConfig[network].HASH_TYPE;
    }
}
