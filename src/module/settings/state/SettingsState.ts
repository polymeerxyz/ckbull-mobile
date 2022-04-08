import { FeeRate } from "@peersyst/ckb-peersyst-sdk";
import { LocaleType } from "locale";
import getDefaultLocale from "locale/utils/getDefaultLocale";
import { atom } from "recoil";

export type FiatCurrencyType = "cny" | "usd" | "eur" | "jpy" | "gbp";

export type NetworkType = "testnet" | "mainnet";

export type FeeType = FeeRate.SLOW | FeeRate.NORMAL | FeeRate.FAST;

export interface SettingsState {
    locale?: LocaleType;
    fiat: FiatCurrencyType;
    network: NetworkType;
    fee: FeeType;
}

export const defaultSettingsState: SettingsState = { locale: getDefaultLocale(), fiat: "usd", network: "mainnet", fee: FeeRate.AVERAGE };

const settingsState = atom<SettingsState>({
    key: "settings",
    default: defaultSettingsState,
});

export default settingsState;
