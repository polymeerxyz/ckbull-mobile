import { render } from "test-utils";
import { translate } from "locale";
import AuthSwitchScreen from "module/auth/screen/AuthSwitchScreen/AuthSwitchScreen";
import * as UseTabs from "module/common/component/base/navigation/Tabs/hook/useTabs";
import { fireEvent } from "@testing-library/react-native";
import { AuthScreens } from "module/auth/AuthNavigatorGroup";

describe("AuthSwitchScreen tests", () => {
    test("Renders correctly", () => {
        const screen = render(<AuthSwitchScreen />);
        expect(screen.getByText(translate("create_wallet")));
        expect(screen.getByText(translate("import_it")));
        expect(screen.getByText(translate("already_have_wallet")));
    });
    test("Create wallet button onPress works correctly", () => {
        const setTab = jest.fn();
        jest.spyOn(UseTabs, "default").mockReturnValue([0, setTab]);
        const screen = render(<AuthSwitchScreen />);
        const button = screen.getByText(translate("create_wallet"));
        fireEvent.press(button);
        expect(setTab).toHaveBeenCalledWith(AuthScreens.CREATE_WALLET);
    });
    test("Import button onPress works correctly", () => {
        const setTab = jest.fn();
        jest.spyOn(UseTabs, "default").mockReturnValue([0, setTab]);
        const screen = render(<AuthSwitchScreen />);
        const button = screen.getByText(translate("import_it"));
        fireEvent.press(button);
        expect(setTab).toHaveBeenCalledWith(AuthScreens.IMPORT_WALLET);
    });
});
