import { Col, Typography } from "@peersyst/react-native-components";
import MainListCard from "module/main/component/display/MainListCard/MainListCard";
import { TouchableWithoutFeedback } from "react-native";
import { NftCardImage } from "./NftCard.styles";
import { NftCardProps } from "./NftCard.types";
import { NftTypes } from "ckb-peersyst-sdk";

const NftCard = ({ nft }: NftCardProps): JSX.Element => {
    const nftName = nft.type === NftTypes.Spore ? nft.tokenId : nft.nftName;
    let tokenUri = nft.type !== NftTypes.Spore ? nft.tokenUri : undefined;
    const tokenId = nft.type !== NftTypes.Spore ? nft.tokenId : null;
    const total = nft.type === NftTypes.MNft ? nft.total : null;
    let description = nft.type !== NftTypes.Spore ? nft.data.description : null;

    // Image if spore
    if (nft.type === NftTypes.Spore && nft.contentType.type === "image") {
        const imageB64 = Buffer.from(nft.contentEncoded.toString().slice(2), "hex").toString("base64");
        tokenUri = `data:${nft.contentType.mediaType};base64,${imageB64}`;
    }
    if (nft.type === NftTypes.Spore && nft.contentType.type === "text") {
        // text/plain text/csv
        description = nft.content;
    }

    const showTotal = tokenId && typeof total === "number";

    return (
        <TouchableWithoutFeedback>
            <MainListCard gap={24} style={{ height: 128, paddingVertical: 20 }}>
                <NftCardImage source={{ uri: tokenUri }} />
                <Col gap={10} flex={1} justifyContent={"space-between"}>
                    <Col>
                        {nftName && (
                            <Typography variant="body2Strong" numberOfLines={1}>
                                {nftName}
                            </Typography>
                        )}
                        {description && (
                            <Typography variant="body3Strong" numberOfLines={1} color="green.200">
                                {description}
                            </Typography>
                        )}
                    </Col>
                    {showTotal && (
                        <Col>
                            <Typography variant="body3Strong" numberOfLines={1} color="gray.700">
                                {`${tokenId}/${total}`}
                            </Typography>
                        </Col>
                    )}
                </Col>
            </MainListCard>
        </TouchableWithoutFeedback>
    );
};

export default NftCard;
