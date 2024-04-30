import { TouchableWithoutFeedback } from "react-native";
import { BaseAddressOfDomainSelectItem } from "./AddressOfDomainSelectItem.styles";

export interface AddressOfDomainSelectItemProps {
    value: string;
    onPress: () => void;
    selected: string;
}

const AddressOfDomainSelectItem = ({ value, onPress, selected }: AddressOfDomainSelectItemProps): JSX.Element => {
    return (
        <TouchableWithoutFeedback onPress={onPress} accessibilityRole={"button"}>
            <BaseAddressOfDomainSelectItem address={value} type="address" variant="body3Light" length={15} isActive={value === selected} />
        </TouchableWithoutFeedback>
    );
};

export default AddressOfDomainSelectItem;
