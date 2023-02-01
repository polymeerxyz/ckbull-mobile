import styled from "@peersyst/react-native-styled";
import { Image } from "@peersyst/react-native-components";

export const SiteImage = styled(Image)(({ theme }) => ({
    width: 56,
    height: 56,
    borderRadius: 8,
    color: theme.palette.green[200],
}));