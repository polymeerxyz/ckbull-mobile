import { ConnectionService } from "ckb-peersyst-sdk";

export default function useDomainValidator(): (value: string) => boolean {
    return (domain: string) => {
        return ConnectionService.isDomain(domain);
    };
}
