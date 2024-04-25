import { IconButton, Row, Spinner, useTheme } from "@peersyst/react-native-components";
import Chip from "module/common/component/display/Chip/Chip";
import { BlockchainAddressByDomain } from "./AddressOfDomainChip.styles";
import { CameraIcon } from "icons";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";

export interface AddressOfDomainchipProps {
    isLoading?: boolean;
    onScanQr?: () => void;
    domainAddress?: BitAccountRecordAddress | undefined;
}

const AddressOfDomainchip = ({ onScanQr, isLoading, domainAddress }: AddressOfDomainchipProps): JSX.Element => {
    const { palette } = useTheme();

    return (
        <Row gap={4}>
            {isLoading && <Spinner />}
            {domainAddress && (
                <Chip
                    variant="tertiary"
                    label={<BlockchainAddressByDomain address={domainAddress.value} type="address" variant="body3Regular" length={3} />}
                />
            )}
            <IconButton style={{ color: palette.primary, fontSize: 24 }} onPress={onScanQr}>
                <CameraIcon />
            </IconButton>
        </Row>
    );
};

export default AddressOfDomainchip;
