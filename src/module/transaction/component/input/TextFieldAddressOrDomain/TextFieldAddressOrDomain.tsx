import { TextFieldProps } from "@peersyst/react-native-components";
import TextField from "../../../../common/component/input/TextField/TextField";
import { useDebounce } from "@peersyst/react-hooks";
import AddressOfDomainchip from "../../feedback/AddressOfDomainChip/AddressOfDomainChip";
import useAddressValidator from "module/common/hook/useAddressValidator";
import useGetAddressFromDomain from "module/common/hook/useGetAddressFromDomain";
import { useTranslate } from "module/common/hook/useTranslate";
import isDomain from "module/wallet/utils/isDomain";
import { useEffect } from "react";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";

export interface TextFieldAddressOrDomainProps extends TextFieldProps {
    domainAddress?: BitAccountRecordAddress;
    onDomainAddressChange?: (domain: BitAccountRecordAddress | undefined) => void;
    onScanQr?: () => void;
}

const TextFieldAddressOrDomain = ({
    defaultValue = "",
    onChange,
    onScanQr,
    error,
    domainAddress,
    onDomainAddressChange,
    ...rest
}: TextFieldAddressOrDomainProps): JSX.Element => {
    const { value, handleChange, debouncedValue, debouncing } = useDebounce(defaultValue, { onChange });
    const translateError = useTranslate("error");
    const validAddress = useAddressValidator();
    const isValidDomain = !value || isDomain(value);
    const isValidAddress = !value || validAddress(value);
    const { data: domainAddresses, isLoading } = useGetAddressFromDomain(debouncedValue, { enabled: isValidDomain });

    const loading = debouncing || isLoading;

    function getError(): boolean | [boolean, string] | undefined {
        if (loading) return true;
        if (!isValidAddress) {
            if (!isValidDomain) {
                return [true, translateError("invalid_address")];
            } else if (!domainAddresses || !domainAddresses.length) {
                return [true, translateError("invalid_domain")];
            }
            return error;
        } else {
            return error;
        }
    }

    useEffect(() => {
        if (domainAddresses) {
            onDomainAddressChange?.(domainAddresses[0]);
        }
    }, [domainAddresses]);

    return (
        <TextField
            value={value}
            onChange={handleChange}
            error={getError()}
            {...rest}
            suffix={<AddressOfDomainchip domainAddress={domainAddress} isLoading={loading} onScanQr={onScanQr} />}
        />
    );
};

export default TextFieldAddressOrDomain;
