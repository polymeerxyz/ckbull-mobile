import { TextFieldProps } from "@peersyst/react-native-components";
import TextField from "../../../../common/component/input/TextField/TextField";
import { useDebounce } from "@peersyst/react-hooks";
import AddressOfDomainChip from "../../feedback/AddressOfDomainChip/AddressOfDomainChip";
import useGetAddressFromDomain from "module/common/hook/useGetAddressFromDomain";
import { useTranslate } from "module/common/hook/useTranslate";
import isDomain from "module/wallet/utils/isDomain";
import { useEffect } from "react";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";
import { useRecoilState } from "recoil";
import settingsState from "module/settings/state/SettingsState";
import { ConnectionService, Environments } from "module/sdk/core/connection.service";

export interface AddressOfDomainTextFieldProps extends TextFieldProps {
    domainAddress?: BitAccountRecordAddress;
    onDomainAddressChange?: (domain: BitAccountRecordAddress | undefined) => void;
    onScanQr?: () => void;
}

const AddressOfDomainTextField = ({
    defaultValue = "",
    onChange,
    onScanQr,
    error,
    domainAddress,
    onDomainAddressChange,
    ...rest
}: AddressOfDomainTextFieldProps): JSX.Element => {
    const { value, handleChange, debouncedValue, debouncing } = useDebounce(defaultValue, { onChange });
    const [settings] = useRecoilState(settingsState);
    const translateError = useTranslate("error");
    const isValidDomain = value === "" || isDomain(value);
    const isValidAddress = value === "" || ConnectionService.isAddress(settings.network as Environments, value);
    const isMainnet = settings.network === "mainnet";
    const { data: domainAddresses, isLoading } = useGetAddressFromDomain(debouncedValue, { enabled: isValidDomain && isMainnet });
    const loading = debouncing || isLoading;

    function getError(): boolean | [boolean, string] | undefined {
        if (loading) return true;
        if (!isValidAddress) {
            if (isMainnet) {
                if (!isValidDomain) {
                    return [true, translateError("invalid_address")];
                } else if ((!domainAddresses || !domainAddresses.length) && isMainnet) {
                    return [true, translateError("invalid_domain")];
                }
            } else {
                return [true, translateError("invalid_address")];
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

    const isError = getError();

    return (
        <TextField
            value={value}
            onChange={handleChange}
            error={isError}
            {...rest}
            suffix={
                <AddressOfDomainChip
                    domainAddress={domainAddress}
                    isLoading={loading}
                    onScanQr={onScanQr}
                    isError={typeof isError === "boolean" ? isError : Array.isArray(isError) ? isError[0] : false}
                />
            }
        />
    );
};

export default AddressOfDomainTextField;
