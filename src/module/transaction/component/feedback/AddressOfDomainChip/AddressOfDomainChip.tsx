import { Row, Spinner } from "@peersyst/react-native-components";
import Chip from "module/common/component/display/Chip/Chip";
import { AddressOfDomainChipIconButton, BlockchainAddressByDomain } from "./AddressOfDomainChip.styles";
import { CameraIcon } from "icons";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";

export interface AddressOfDomainChipProps {
    isLoading?: boolean;
    onScanQr?: () => void;
    domainAddress?: BitAccountRecordAddress | undefined;
    isError?: boolean;
}

const AddressOfDomainChip = ({ onScanQr, isLoading, domainAddress, isError = false }: AddressOfDomainChipProps): JSX.Element => {
    return (
        <Row gap={4}>
            {isLoading && <Spinner />}
            {!isError && domainAddress && (
                <Chip
                    variant="tertiary"
                    label={<BlockchainAddressByDomain address={domainAddress.value} type="address" variant="body3Regular" length={3} />}
                />
            )}
            <AddressOfDomainChipIconButton onPress={onScanQr}>
                <CameraIcon />
            </AddressOfDomainChipIconButton>
        </Row>
    );
};

export default AddressOfDomainChip;
