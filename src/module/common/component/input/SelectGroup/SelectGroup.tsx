import Select, { SelectProps } from "module/common/component/input/Select/Select";
import { SelectItem } from "react-native-components";
import FormGroup from "../FormGroup/FormGroup";

interface SelectGroupProps extends Pick<SelectProps, "onChange" | "value"> {
    options: (string | number)[];
    label: string;
}

const SelectGroup = ({ label, options, ...rest }: SelectGroupProps): JSX.Element => {
    return (
        <FormGroup label={label}>
            <Select placeholder={options[0].toString()} title={label} {...rest}>
                {options.map((option, index) => {
                    return (
                        <SelectItem key={index} value={option}>
                            {option}
                        </SelectItem>
                    );
                })}
            </Select>
        </FormGroup>
    );
};

export default SelectGroup;