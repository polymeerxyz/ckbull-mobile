import { Col, Row, Typography } from "@peersyst/react-native-components";
import MainListCard from "module/main/component/display/MainListCard/MainListCard";
import { TouchableWithoutFeedback } from "react-native";
import { NftCardImage } from "./NftCard.styles";
import { NftCardProps } from "./NftCard.types";

const NftCard = ({ nft }: NftCardProps): JSX.Element => {
    const {
        nftName,
        tokenUri,
        tokenId,
        total,
        data: { description },
    } = nft;

    return (
        <TouchableWithoutFeedback>
            <MainListCard gap={24} style={{ marginTop: 30, height: 100 }}>
                <NftCardImage source={{ uri: tokenUri }} resizeMode="cover" />
                <Col gap={2} flex={1}>
                    {nftName && (
                        <Typography variant="body2Strong" numberOfLines={1}>
                            {nftName}
                        </Typography>
                    )}
                    {description && (
                        <Typography variant="body1Strong" numberOfLines={1}>
                            {description}
                        </Typography>
                    )}
                    {tokenId && total && (
                        <Typography variant="body3Strong" numberOfLines={1} color="primary">
                            {`${tokenId}/${total}`}
                        </Typography>
                    )}
                </Col>
            </MainListCard>
        </TouchableWithoutFeedback>
    );
};

export default NftCard;
