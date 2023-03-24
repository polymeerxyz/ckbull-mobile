import { render, translate } from "test-utils";
import SignInRequestDetails from "module/activity/component/display/SignInRequestDetails/SignInRequestDetails";
import { screen } from "@testing-library/react-native";
import { UseWalletStateMock } from "mocks/common";

describe("SignInRequestDetails tests", () => {
    const mockName = "name";
    const mockImage = "image";
    const mockDescription = "description";

    beforeEach(() => jest.restoreAllMocks());

    test("Renders correctly without loading", () => {
        new UseWalletStateMock();

        render(<SignInRequestDetails name={mockName} image={mockImage} description={mockDescription} />);

        expect(screen.getByText(mockName)).toBeDefined();
        expect(screen.getByText(mockDescription)).toBeDefined();
        expect(screen.getByText(translate("signWith"))).not.toBeDisabled();
    });
});
