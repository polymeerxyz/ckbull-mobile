import BaseMock from "mocks/common/base.mock";
import { NftTypes, Nrc721Nft } from "ckb-peersyst-sdk";
import { Script } from "@ckb-lumos/lumos";

export interface NftTokenMetadata {
    description: string;
}

export class NftTokenMetadataMock extends BaseMock {
    description: string;
    constructor({ description }: Partial<NftTokenMetadata> = {}) {
        super();
        this.description = description || "description";
    }
}

export class NftTokenMock extends BaseMock implements Nrc721Nft {
    type: NftTypes.Nrc721;
    tokenId: string;
    data: any;
    nftName: string;
    tokenUri: string;
    rawData: string;
    nftSymbol: string;
    script: Script;
    nftExtraData: string;
    constructor({ tokenId, data, nftName, tokenUri, rawData, script, nftSymbol, nftExtraData }: Partial<Nrc721Nft> = {}) {
        super();
        this.type = NftTypes.Nrc721;
        this.tokenId = tokenId || "tokenId";
        this.data = data || new NftTokenMetadataMock();
        this.nftName = nftName || "nftName";
        this.nftSymbol = nftSymbol || "nftSymbol";
        this.nftExtraData = nftExtraData || "nftExtraData";
        this.tokenUri = tokenUri || "tokenUri";
        this.rawData = rawData || "rawData";
        this.script = script || { args: "args", codeHash: "codeHash", hashType: "data" };
    }
}

export interface NftTokensMockParmas {
    nfts: NftTokenMock[];
    length: number;
}

export class NftTokensMock extends BaseMock {
    nfts: NftTokenMock[];
    constructor({ length = 1, nfts }: Partial<NftTokensMockParmas> = {}) {
        super();
        this.nfts = nfts || new Array(length).fill(0).map(() => new NftTokenMock());
    }
}
