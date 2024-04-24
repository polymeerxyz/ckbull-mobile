import { Col } from "@peersyst/react-native-components";
import SelectItemAddressOfDomain from "../SelectItemAddressOfDomain/SelectItemAddressOfDomain";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";

interface SelectAddressOfDomainProps {
    addresses: BitAccountRecordAddress[] | undefined;
    onChange: (address: string) => void;
    selected?: string;
}

const SelectAddressOfDomain = ({ addresses, onChange, selected }: SelectAddressOfDomainProps): JSX.Element => {
    const handleOnPress = (address: string) => {
        onChange(address);
    };
    return (
        <Col gap={24}>
            {addresses &&
                addresses.map((address, index) => {
                    return (
                        <SelectItemAddressOfDomain
                            key={index}
                            value={address.value}
                            onPress={() => handleOnPress(address.value)}
                            selected={selected || ""}
                        />
                    );
                })}
        </Col>
    );
};

export default SelectAddressOfDomain;
