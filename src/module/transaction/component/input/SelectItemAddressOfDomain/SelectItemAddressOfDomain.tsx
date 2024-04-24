import { TouchableWithoutFeedback } from "react-native";
import { SelectItemAddressOfDomainItem } from "./SelectItemAddressOfDomain.styles";

export interface SelectItemAddressOfDomainProps {
    value: string;
    onPress: () => void;
    selected: string;
}

const SelectItemAddressOfDomain = ({ value, onPress, selected }: SelectItemAddressOfDomainProps): JSX.Element => {
    return (
        <TouchableWithoutFeedback onPress={onPress} accessibilityRole={"button"}>
            <SelectItemAddressOfDomainItem address={value} type="address" variant="body3Light" length={15} isActive={value === selected} />
        </TouchableWithoutFeedback>
    );
};

export default SelectItemAddressOfDomain;
