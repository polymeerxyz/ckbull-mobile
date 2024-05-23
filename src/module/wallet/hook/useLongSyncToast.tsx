import { Col, Row, Typography, useToast } from "@peersyst/react-native-components";
import useCkbSync from "./useCkbSync";
import { useEffect, useRef } from "react";
import { useTranslate } from "module/common/hook/useTranslate";
import { TextStyle } from "react-native";
import { useRecoilValue } from "recoil";
import walletState from "module/wallet/state/WalletState";

function LongLoadingToastContent({ style }: { style?: TextStyle }): JSX.Element {
    const translate = useTranslate();
    const { hideToast } = useToast();

    return (
        <Col gap={6}>
            <Typography variant="body3Regular" style={style}>
                {translate("longLoadingText")}
            </Typography>
            <Row justifyContent="flex-end">
                <Typography variant="body3Strong" style={style} onPress={hideToast}>
                    {translate("dismiss")}
                </Typography>
            </Row>
        </Col>
    );
}

export function useLongSyncToast(): void {
    const { isAuthenticated } = useRecoilValue(walletState);
    const { synchronizing } = useCkbSync();
    const { showToast, hideToast } = useToast();

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isAuthenticated && synchronizing && !timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
                if (synchronizing) {
                    showToast(<LongLoadingToastContent />, {
                        type: "warning",
                        duration: Infinity,
                    });
                }
            }, 10000);
        }

        if (!synchronizing && timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            hideToast();
        }
    }, [synchronizing, isAuthenticated]);
}
