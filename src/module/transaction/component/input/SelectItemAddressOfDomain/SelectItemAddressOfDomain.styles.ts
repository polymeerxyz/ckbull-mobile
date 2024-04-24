import styled from "@peersyst/react-native-styled";
import BlockchainAddress, { BlockchainAddressProps } from "module/common/component/display/BlockchainAddress/BlockchainAddress";

export const SelectItemAddressOfDomainItem = styled(BlockchainAddress)<BlockchainAddressProps & { isActive: boolean }>(
    ({ theme, isActive }) => ({
        paddingVertical: 16,
        paddingHorizontal: 20,
        width: "100%",
        textTransform: "uppercase",
        justifyContent: "center",
        borderColor: isActive ? theme.palette.primary : theme.palette.component.borderColor,
        borderWidth: 1,
        borderRadius: 8,
    }),
);
