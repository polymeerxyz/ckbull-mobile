import Queries from "../../../query/queries";
import { UseQueryOptions, UseQueryResult, useQuery } from "react-query";
import { ConnectionService } from "ckb-peersyst-sdk";
import { BitAccountRecordAddress } from "dotbit/lib/fetchers/BitIndexer.type";

export type useGetAddressFromDomainReturn = UseQueryResult<BitAccountRecordAddress[], unknown>;

const useGetAddressFromDomain = (
    domain: string | undefined,
    {
        enabled = true,
        ...restOptions
    }: Omit<UseQueryOptions<BitAccountRecordAddress[], unknown, BitAccountRecordAddress[], (string | undefined)[]>, "cacheTime"> = {},
): useGetAddressFromDomainReturn => {
    return useQuery(
        [Queries.GET_ADDRESS_FROM_DOMAIN, domain],
        async () => {
            try {
                const addresses = await ConnectionService.getAddressFromDomain(domain!);
                return addresses;
            } catch (error) {
                return [];
            }
        },
        { enabled: !!domain && enabled, cacheTime: 0, ...restOptions },
    );
};

export default useGetAddressFromDomain;
