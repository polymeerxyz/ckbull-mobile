import { PropsWithChildren } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RecoilRoot } from "recoil";
import { ToastProvider } from "@peersyst/react-native-components";
import QueryClientProvider from "./query/QueryClientProvider";
import { ConfigProvider } from "./config";
import { I18nextProvider } from "react-i18next";
import i18n from "./locale/i18n";
import { StylesheetProvider } from "./stylesheets/StylesheetProvider";

const Providers = ({ children }: PropsWithChildren<unknown>): JSX.Element => (
    <RecoilRoot>
        <SafeAreaProvider>
            <I18nextProvider i18n={i18n}>
                <ConfigProvider>
                    <StylesheetProvider>
                        <ToastProvider>
                            <QueryClientProvider>
                                {children}
                                {/*{process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}*/}
                            </QueryClientProvider>
                        </ToastProvider>
                    </StylesheetProvider>
                </ConfigProvider>
            </I18nextProvider>
        </SafeAreaProvider>
    </RecoilRoot>
);

export default Providers;
