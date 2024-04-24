import { Environments } from "ckb-peersyst-sdk";
import { CkbAddressOrDomainValidator } from "config/validators/CkbAddressOrDomainValidator";
import useSelectedNetwork from "module/settings/hook/useSelectedNetwork";

export default function useAddressValidator(): (value: string) => boolean {
    const network = useSelectedNetwork();
    return new CkbAddressOrDomainValidator("", () => "", network === "mainnet" ? Environments.Mainnet : Environments.Testnet).validate;
}
