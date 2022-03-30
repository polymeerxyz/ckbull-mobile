import { translate } from "locale";
import { render } from "test-utils";
import { fireEvent } from "@testing-library/react-native";
import * as UseModal from "module/common/component/base/feedback/ModalProvider/hooks/useModal";
import SendModal from "module/transaction/component/core/SendModal/SendModal";
import ReceiveModal from "module/transaction/component/core/ReceiveModal/ReceiveModal";
import AccountCardButtons from "module/wallet/component/core/AccountCard/AccountCardButtons/AccountCardButtons";

describe("Renders card button", () => {
    test("Renders correctly", () => {
        const screen = render(<AccountCardButtons />);
        expect(screen.getByText(translate("send"))).toBeDefined();
        expect(screen.getByTestId("ReceiveIcon")).toBeDefined();
        expect(screen.getByTestId("SendIcon")).toBeDefined();
        expect(screen.getByText(translate("receive"))).toBeDefined();
    });
    test("Triggers correctly send button", () => {
        const showModal = jest.fn();
        jest.spyOn(UseModal, "useModal").mockReturnValue({ showModal } as any);
        const screen = render(<AccountCardButtons />);
        const button = screen.getByText(translate("send"));
        fireEvent.press(button);
        expect(showModal).toHaveBeenCalledWith(SendModal);
    });
    test("Triggers correctly receive button", () => {
        const showModal = jest.fn();
        jest.spyOn(UseModal, "useModal").mockReturnValue({ showModal } as any);
        const screen = render(<AccountCardButtons />);
        const button = screen.getByText(translate("receive"));
        fireEvent.press(button);
        expect(showModal).toHaveBeenCalledWith(ReceiveModal);
    });
});