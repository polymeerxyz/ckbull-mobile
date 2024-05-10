import { Col } from "@peersyst/react-native-components";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";
import AddressOfDomainSelectItem from "../AddressOfDomainSelectItem/AddressOfDomainSelectItem";

export interface AddressOfDomainSelectProps {
    addresses: BitAccountRecordAddress[] | undefined;
    onChange: (address: BitAccountRecordAddress) => void;
    selected?: BitAccountRecordAddress;
}

const AddressOfDomainSelect = ({ addresses, onChange, selected }: AddressOfDomainSelectProps): JSX.Element => {
    const handleOnPress = (address: BitAccountRecordAddress): void => {
        onChange(address);
    };

    return (
        <Col gap={24}>
            {addresses &&
                addresses.map((address, index) => {
                    return (
                        <AddressOfDomainSelectItem
                            key={index}
                            value={address.value}
                            onPress={() => handleOnPress(address)}
                            selected={selected?.value || ""}
                        />
                    );
                })}
        </Col>
    );
};

export default AddressOfDomainSelect;
