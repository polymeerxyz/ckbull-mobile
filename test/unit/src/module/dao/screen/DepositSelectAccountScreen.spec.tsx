import { render, translate } from "test-utils";
import * as Recoil from "recoil";
import * as Genesys from "@peersyst/react-native-components";
import { fireEvent, waitFor } from "@testing-library/react-native";
import DepositSelectAccountScreen from "module/dao/screen/DepositSelectAccountScreen/DepositSelectAccountScreen";
import { UseServiceInstanceMock, UseWalletStateMock } from "test-mocks";

describe("DepositSelectAccountScreen tests", () => {
    const { state } = new UseWalletStateMock();
    new UseServiceInstanceMock();
    afterAll(() => {
        jest.restoreAllMocks();
    });

    test("Renders correctly", () => {
        const screen = render(<DepositSelectAccountScreen />);
        expect(screen.getByText(translate("select_a_wallet") + ":")).toBeDefined();
        expect(screen.getAllByText(state.wallets[0].name)).toBeDefined();
        expect(screen.getByText(translate("next"))).toBeDefined();
    });

    test("Sets send state and advances to next tab with default selected wallet", async () => {
        const setSendState = jest.fn();
        jest.spyOn(Recoil, "useRecoilState").mockReturnValue([{}, setSendState]);
        const setTab = jest.fn();
        jest.spyOn(Genesys, "useSetTab").mockReturnValue(setTab);
        const screen = render(<DepositSelectAccountScreen />);
        fireEvent.press(screen.getByText(translate("next")));
        await waitFor(() => expect(setSendState).toHaveBeenCalled());
    });
});
