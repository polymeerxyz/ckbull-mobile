import { SwipeButton } from "@peersyst/react-native-components";
import { stylesheet } from "@peersyst/react-native-styled";

export const swipeButtonStylesheet = stylesheet(SwipeButton)(({ fromTheme }) => ({
    height: 52,
    borderRadius: 52,
    backgroundGradient: {
        colors: fromTheme("palette.green.200", (startColor) =>
            fromTheme("palette.green.600", (endColor) => [startColor, endColor]),
        ) as unknown as string[],
        start: { x: 0, y: 1 },
        end: { x: 1, y: 0 },
    },
    ...fromTheme("typography.body2Regular"),
    color: fromTheme("palette.white"),
    track: {
        padding: 6,
    },
    thumb: {
        backgroundColor: fromTheme("palette.white"),
        color: fromTheme("palette.primary"),
    },
    disabled: {
        backgroundGradient: {
            colors: fromTheme("palette.disabled", (startColor) =>
                fromTheme("palette.disabled", (endColor) => [startColor, endColor]),
            ) as unknown as string[],
        },
    },
}));
