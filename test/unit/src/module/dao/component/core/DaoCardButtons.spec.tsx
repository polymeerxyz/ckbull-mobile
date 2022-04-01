import { translate } from "locale";
import DaoCardButtons from "module/dao/core/DaoAccountCard/DaoCardButtons/DaoCardButtons";
import { fireEvent, render } from "test-utils";
import * as UseModal from "module/common/component/base/feedback/ModalProvider/hooks/useModal";
import SendModal from "module/transaction/component/core/SendModal/SendModal";
import ReceiveModal from "module/transaction/component/core/ReceiveModal/ReceiveModal";

describe("Test for the DoaCardBalance", () => {
    test("Returns correctly", () => {
        const screen = render(<DaoCardButtons />);
        expect(screen.getByText(translate("deposit"))).toBeDefined();
        expect(screen.getByTestId("DAODepositIcon")).toBeDefined();
        expect(screen.getByTestId("DAOWithdrawIcon")).toBeDefined();
        expect(screen.getByText(translate("withdraw"))).toBeDefined();
    });
    test("Triggers deposit function correctly", () => {
        const showModal = jest.fn();
        jest.spyOn(UseModal, "useModal").mockReturnValue({ showModal } as any);
        const screen = render(<DaoCardButtons />);
        const button = screen.getByText(translate("deposit"));
        fireEvent.press(button);
        expect(showModal).toHaveBeenCalledWith(SendModal);
    });
    test("Triggers withdraw function correctly", () => {
        const showModal = jest.fn();
        jest.spyOn(UseModal, "useModal").mockReturnValue({ showModal } as any);
        const screen = render(<DaoCardButtons />);
        const button = screen.getByText(translate("withdraw"));
        fireEvent.press(button);
        expect(showModal).toHaveBeenCalledWith(ReceiveModal);
    });
});