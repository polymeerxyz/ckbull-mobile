import styled from "@peersyst/react-native-styled";
import BlockchainAddress from "module/common/component/display/BlockchainAddress/BlockchainAddress";

export const BlockchainAddressByDomain = styled(BlockchainAddress)(({ theme }) => ({
    color: theme.palette.primary,
}));
