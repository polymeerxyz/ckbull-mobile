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

    if (nft.type !== NftTypes.Spore) {
        const { nftName, tokenUri } = nft;

        return (
            <SelectItemCard onPress={handleOnPress}>
                <NftSelectItemImage uri={tokenUri} />
                <Typography variant="body2Regular" numberOfLines={1}>
                    {nftName}
                </Typography>
            </SelectItemCard>
        );
    }

    // TODO: Case NFT is Spore. Should look at nft.contentType.mediaType and render nft.content
    return (
        <SelectItemCard onPress={handleOnPress}>
            <NftSelectItemImage />
            <Typography variant="body2Regular" numberOfLines={1}>
                {nft.tokenId}
            </Typography>
        </SelectItemCard>
    );
};
