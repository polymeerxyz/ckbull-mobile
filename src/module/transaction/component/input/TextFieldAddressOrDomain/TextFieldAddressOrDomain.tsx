import { TextFieldProps } from "@peersyst/react-native-components";
import TextField from "../../../../common/component/input/TextField/TextField";
import { useControlled } from "@peersyst/react-hooks";
import { useState } from "react";
import useDomainValidator from "module/common/hook/useDomainValidator";
import AddressOfDomainchip from "../../feedback/AddressOfDomainChip/AddressOfDomainChip";

export interface TextFieldAddressOrDomainProps extends TextFieldProps {
    domain?: string;
    onDomainChange?: (domain: string) => void;
    onScanQr?: () => void;
    onAddressDomainChipPress?: (domain: string, sender: number) => void;
}

const TextFieldAddressOrDomain = ({
    defaultValue = "",
    value,
    onChange,
    domain: domainProp,
    onDomainChange: onDomainChangeProp,
    onScanQr,
    onAddressDomainChipPress,
    ...rest
}: TextFieldAddressOrDomainProps): JSX.Element => {
    const [address, setAddrees] = useControlled(defaultValue, value, onChange);
    const [domain, setDomain] = useControlled("", domainProp, onDomainChangeProp);
    const [isDomain, setIsDomain] = useState(false);
    const validAddress = useDomainValidator();

    const handleOnChange = (address: string) => {
        const isDomain = validAddress(address);
        if (isDomain) {
            setIsDomain(true);
            setDomain(address);
        } else {
            setIsDomain(false);
            setAddrees(address);
        }
    };
    return (
        <TextField
            value={domain ? domain : address}
            onChange={handleOnChange}
            {...rest}
            suffix={
                <AddressOfDomainchip
                    domain={domain}
                    isDomain={isDomain}
                    onScanQr={onScanQr}
                    onAddressDomainChipPress={onAddressDomainChipPress}
                />
            }
        />
    );
};

export default TextFieldAddressOrDomain;
