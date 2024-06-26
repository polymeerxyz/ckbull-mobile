import { Col, Typography } from "@peersyst/react-native-components";
import IconButton from "../IconButton/IconButton";
import { TouchableWithoutFeedback, View } from "react-native";
import { LabeledIconButtonProps } from "./LabeledIconButton.types";

export default function LabeledIconButton({ label, onPress, ...iconButtonProps }: LabeledIconButtonProps): JSX.Element {
    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <Col alignItems="center" gap={3}>
                <View style={{ marginHorizontal: "auto" }}>
                    <IconButton onPress={onPress} {...iconButtonProps} />
                </View>
                <Typography variant="body4Regular" adjustsFontSizeToFit>
                    {label}
                </Typography>
            </Col>
        </TouchableWithoutFeedback>
    );
}
