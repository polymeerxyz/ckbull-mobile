import { render, SuccessApiCall } from "test-utils";
import { waitFor } from "@testing-library/react-native";
import { translate } from "locale";
import * as UseWalletState from "module/wallet/hook/useWalletState";
import { mockedUseWallet } from "mocks/useWalletState";
import DAOCompletedWithdrawalsList from "module/dao/component/core/DAOCompletedWithdrawalsList/DAOCompletedWithdrawalsList";
import { mockedDAOUnlocks } from "mocks/DAOTransaction";
import { CKBSDKService } from "module/common/service/CkbSdkService";

describe("DAOCompletedWithdrawalsList tests", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.spyOn(UseWalletState, "default").mockReturnValue(mockedUseWallet);
    });

    test("Renders correctly with tx", async () => {
        jest.spyOn(CKBSDKService.prototype, "getTransactions").mockReturnValue(SuccessApiCall(mockedDAOUnlocks));
        const screen = render(<DAOCompletedWithdrawalsList />);
        await waitFor(() => expect(screen.getByText("10/01/2022 - 00:00")));
        expect(screen.getByText("11/01/2022 - 00:00"));
        expect(screen.getByText("12/01/2022 - 00:00"));
    });
    test("Renders correctly without transactions", async () => {
        jest.spyOn(CKBSDKService.prototype, "getTransactions").mockReturnValue(SuccessApiCall([]));
        const screen = render(<DAOCompletedWithdrawalsList />);
        await waitFor(() => expect(screen.getAllByText(translate("no_withdrawals"))));
    });
});