import { MOCKED_ADDRESS } from "mocks/common/wallet/wallet.mock";
import AddressOfDomainSelectItem, {
    AddressOfDomainSelectItemProps,
} from "module/transaction/component/input/AddressOfDomainSelectItem/AddressOfDomainSelectItem";
import { render } from "test-utils";

describe("AddressOfDomainSelectItem", () => {
    const mockValue = MOCKED_ADDRESS;
    const mockOnPress = jest.fn();
    const mockSelected = MOCKED_ADDRESS;

    const defaultProps: AddressOfDomainSelectItemProps = {
        value: mockValue,
        onPress: mockOnPress,
        selected: mockSelected,
    };

    it("renders properly", () => {
        const { getByText } = render(<AddressOfDomainSelectItem {...defaultProps} />);
        expect(getByText("ckt1qzda0cr08m85h...cjfxwz3mqr63937")).toBeDefined();
    });
});
