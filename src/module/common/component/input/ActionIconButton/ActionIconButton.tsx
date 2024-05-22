import LabeledIconButton from "../LabeledIconButton/LabeledIconButton";
import { ActionIconButtonProps } from "./ActionIconButton.types";

export default function ActionIconButton({ isActive, action, ...rest }: ActionIconButtonProps): JSX.Element {
    return <LabeledIconButton variant={isActive ? "secondary" : "outlined"} onPress={action} {...rest} />;
}
