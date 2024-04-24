import Queries from "../../../query/queries";
import { UseQueryResult, useQuery } from "react-query";
import { ConnectionService } from "ckb-peersyst-sdk";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";

export type useGetAddressFromDomainReturn = UseQueryResult<BitAccountRecordAddress[], unknown>;

const useGetAddressFromDomain = (domain: string): useGetAddressFromDomainReturn => {
    return useQuery([Queries.GET_ADDRESS_FROM_DOMAIN, domain], async () => {
        try {
            const addresses = await ConnectionService.getAddressFromDomain(domain);
            const filteredAddresses = addresses.filter((address) => address.subtype === "ckb");
            return filteredAddresses;
        } catch (error) {
            return false;
        }
    });
};

export default useGetAddressFromDomain;
