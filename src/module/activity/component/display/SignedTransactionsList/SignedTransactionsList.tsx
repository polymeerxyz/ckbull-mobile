import EmptyListComponent from "module/common/component/display/EmptyListComponent/EmptyListComponent";
import MainList from "module/main/component/display/MainList/MainList";
import TransactionCard from "module/transaction/component/display/TransactionCard/TransactionCard";
import useGetSignedFullTransactions from "module/activity/hook/useGetSignedFullTransactions";

const SignedTransactionsList = (): JSX.Element => {
    const { fullTransactions, refetch, isLoading } = useGetSignedFullTransactions();

    return (
        <MainList
            data={fullTransactions}
            onRefresh={refetch}
            renderItem={({ item: signedFullTransaction }) => <TransactionCard transaction={signedFullTransaction} />}
            ListEmptyComponent={isLoading ? undefined : <EmptyListComponent />}
            loading={isLoading}
            keyExtractor={(_, index) => index.toString()}
        />
    );
};

export default SignedTransactionsList;
