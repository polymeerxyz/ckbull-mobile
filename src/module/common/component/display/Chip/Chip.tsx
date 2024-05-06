import { ChipProps as BaseChipProps } from "./Chip.types";
import { ChipRoot, ChipText } from "./Chip.styles";
import { TouchableWithoutFeedback } from "react-native";
import React, { useMemo } from "react";
import { extractTextStyles } from "utils/extractTextStyles";

export interface ChipProps extends Omit<BaseChipProps, "label"> {
    label: React.ReactNode;
}

const Chip = ({ label, variant = "secondary", style, fullWidth, onPress }: ChipProps): JSX.Element => {
    const [textStyles, rootStyles] = useMemo(() => extractTextStyles({ ...style }), [style]);
    return (
        <TouchableWithoutFeedback onPress={onPress} accessibilityRole={onPress ? "button" : "text"}>
            <ChipRoot variant={variant} fullWidth={fullWidth} testID="chipRoot" style={rootStyles}>
                <ChipText variant={variant} style={textStyles}>
                    {label}
                </ChipText>
            </ChipRoot>
        </TouchableWithoutFeedback>
    );
};

export default Chip;
