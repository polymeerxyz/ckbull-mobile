import { render, translate } from "test-utils";
import SendToAddressScreen from "module/transaction/screen/SendToAddressScreen/SendToAddressScreen";
import * as Recoil from "recoil";
import * as Genesys from "@peersyst/react-native-components";
import { fireEvent } from "@testing-library/react-native";
import { UseServiceInstanceMock, UseWalletStateMock } from "test-mocks";

describe("SendToAddressScreen tests", () => {
    new UseServiceInstanceMock();
    const { state } = new UseWalletStateMock();
    afterAll(() => {
        jest.restoreAllMocks();
    });

    test("Renders correctly", () => {
        const screen = render(<SendToAddressScreen />);
        expect(screen.getByText(translate("select_a_wallet"))).toBeDefined();
        expect(screen.getByText(state.wallets[0].name)).toBeDefined();
        expect(screen.getByText(translate("send_to"))).toBeDefined();
        expect(screen.getByPlaceholderText(translate("address"))).toBeDefined();
        expect(screen.getByText(translate("next"))).toBeDefined();
    });

    test("Renders correctly when an addresses had been selected previously", () => {
        jest.spyOn(Recoil, "useRecoilState").mockReturnValue([{ senderWalletIndex: 1, receiver: "receiver_address" }, jest.fn()]);
        const screen = render(<SendToAddressScreen />);
        expect(screen.getByText(state.wallets[1].name)).toBeDefined();
        expect(screen.getByDisplayValue("receiver_address")).toBeDefined();
    });

    test("Sets send state and advances to next tab", async () => {
        const setSendState = jest.fn();
        jest.spyOn(Recoil, "useRecoilState").mockReturnValue([{}, setSendState]);
        const setTab = jest.fn();
        jest.spyOn(Genesys, "useSetTab").mockReturnValue(setTab);
        const screen = render(<SendToAddressScreen />);
        const input = screen.getByPlaceholderText(translate("address"));
        fireEvent.changeText(input, "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq03ewkvsva4cchhntydu648l7lyvn9w2cctnpask");
        fireEvent.press(screen.getByText(translate("next")));
    });
});
