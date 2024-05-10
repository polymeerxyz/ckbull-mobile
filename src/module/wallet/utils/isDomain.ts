import { ConnectionService } from "ckb-peersyst-sdk";

export default function isDomain(domain: string): boolean {
    return ConnectionService.isDomain(domain);
}
