import { BitAccountRecordAddressMock } from "mocks/common/wallet/bitAccountRecordAddressMock.mock";
import AddressOfDomainSelect, {
    AddressOfDomainSelectProps,
} from "module/transaction/component/input/AddressOfDomainSelect/AddressOfDomainSelect";
import { render, fireEvent } from "test-utils";
describe("AddressOfDomainSelect", () => {
    const mockOnChange = jest.fn();
    const mockAddresses = [new BitAccountRecordAddressMock()];
    const defaultProps: AddressOfDomainSelectProps = {
        addresses: mockAddresses,
        onChange: mockOnChange,
        selected: new BitAccountRecordAddressMock(),
    };

    it("renders properly", () => {
        const { getAllByText } = render(<AddressOfDomainSelect {...defaultProps} />);
        expect(getAllByText("ckt1qzda0cr08m85h...cjfxwz3mqr63937")).toHaveLength(1);
    });

    it("calls onChange when an item is pressed", () => {
        const { getAllByText } = render(<AddressOfDomainSelect {...defaultProps} />);
        fireEvent.press(getAllByText("ckt1qzda0cr08m85h...cjfxwz3mqr63937")[0]);
        expect(mockOnChange).toHaveBeenCalledWith(mockAddresses[0]);
    });
});
