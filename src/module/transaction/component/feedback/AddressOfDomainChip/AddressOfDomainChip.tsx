import { IconButton, Row, useTheme } from "@peersyst/react-native-components";
import Chip from "module/common/component/display/Chip/Chip";
import useGetAddressFromDomain from "module/common/hook/useGetAddressFromDomain";
import { BlockchainAddressByDomain } from "./AddressOfDomainChip.styles";
import { CameraIcon } from "icons";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import sendRecoilState from "module/transaction/state/SendState";

export interface AddressOfDomainchipProps {
    domain: string;
    isDomain?: boolean;
    onScanQr?: () => void;
    onAddressDomainChipPress?: (domain: string, sender: number) => void;
}

const AddressOfDomainchip = ({ domain, onScanQr, isDomain, onAddressDomainChipPress }: AddressOfDomainchipProps): JSX.Element => {
    const { data: addresses, isLoading } = useGetAddressFromDomain(domain);
    const [sendState, setSendState] = useRecoilState(sendRecoilState);
    const showAddress = isDomain && addresses && addresses?.length > 0;
    const { palette } = useTheme();
    useEffect(() => {
        if (isDomain && addresses && addresses.length > 1) {
            onAddressDomainChipPress?.(domain, sendState.senderWalletIndex!);
        } else if (isDomain && addresses && addresses.length === 1) {
            setSendState((oldState) => ({
                ...oldState,
                addressDomain: addresses[0].value,
            }));
        }
    });

    return (
        <Row gap={4}>
            {isLoading && <Chip label="Loading..." />}
            {showAddress && (
                <Chip
                    variant="tertiary"
                    label={<BlockchainAddressByDomain address={addresses[0].value} type="address" variant="body3Regular" length={3} />}
                    onPress={() => onAddressDomainChipPress?.(domain, sendState.senderWalletIndex!)}
                />
            )}
            <IconButton style={{ color: palette.primary, fontSize: 24 }} onPress={onScanQr}>
                <CameraIcon />
            </IconButton>
        </Row>
    );
};

export default AddressOfDomainchip;
