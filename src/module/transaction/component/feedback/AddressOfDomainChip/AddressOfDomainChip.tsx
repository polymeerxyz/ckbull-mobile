import { Row, Spinner } from "@peersyst/react-native-components";
import Chip from "module/common/component/display/Chip/Chip";
import { AddressOfDomainChipIconButton, BlockchainAddressByDomain } from "./AddressOfDomainChip.styles";
import { CameraIcon } from "icons";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";
import settingsState from "module/settings/state/SettingsState";
import { useRecoilState } from "recoil";

export interface AddressOfDomainChipProps {
    isLoading?: boolean;
    onScanQr?: () => void;
    domainAddress?: BitAccountRecordAddress | undefined;
}

const AddressOfDomainChip = ({ onScanQr, isLoading, domainAddress }: AddressOfDomainChipProps): JSX.Element => {
    const [settings] = useRecoilState(settingsState);
    const isMainnet = settings.network === "mainnet";
    return (
        <Row gap={4}>
            {isLoading && <Spinner />}
            {domainAddress && isMainnet && (
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
