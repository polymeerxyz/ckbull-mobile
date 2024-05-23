import { AssetType } from "module/wallet/wallet.types";
import { Nft, NftTypes } from "ckb-peersyst-sdk";
import SelectItemCard from "../SelectItemCard";
import { useAssetSelect } from "../../hook/useAssetSelect";
import { Typography } from "@peersyst/react-native-components";
import { NftSelectItemImage } from "./NftSelectItemImage";

export interface NftSelectItemProps {
    nft: Nft;
}

export const NftSelectItem = ({ nft }: NftSelectItemProps) => {
    const { setSelectedAsset } = useAssetSelect();

    const handleOnPress = () => {
        setSelectedAsset({
            type: AssetType.NFT,
            nft,
        });
    };

    const name = nft.type !== NftTypes.Spore ? nft.nftName : nft.tokenId;
    let tokenUri = nft.type !== NftTypes.Spore ? nft.tokenUri : undefined;
    if (nft.type === NftTypes.Spore && nft.contentType.type === "image") {
        const imageB64 = Buffer.from(nft.contentEncoded.toString().slice(2), "hex").toString("base64");
        tokenUri = `data:${nft.contentType.mediaType};base64,${imageB64}`;
    }

    return (
        <SelectItemCard onPress={handleOnPress}>
            <NftSelectItemImage uri={tokenUri} />
            <Typography variant="body2Regular" numberOfLines={1}>
                {name}
            </Typography>
        </SelectItemCard>
    );
};
