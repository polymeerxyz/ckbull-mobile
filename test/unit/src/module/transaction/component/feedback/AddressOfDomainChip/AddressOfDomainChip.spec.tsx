import { BitAccountRecordAddressMock } from "mocks/common/wallet/bitAccountRecordAddressMock.mock";
import AddressOfDomainChip, {
    AddressOfDomainChipProps,
} from "module/transaction/component/feedback/AddressOfDomainChip/AddressOfDomainChip";
import { render } from "test-utils";

describe("AddressOfDomainChip", () => {
    const defaultProps: AddressOfDomainChipProps = {
        isLoading: false,
        onScanQr: jest.fn(),
        domainAddress: new BitAccountRecordAddressMock(),
    };

    it("renders properly", () => {
        const { getByText } = render(<AddressOfDomainChip {...defaultProps} />);
        expect(getByText("ckt1q...937")).toBeDefined();
    });

    it("renders spinner when loading", () => {
        const { getByTestId } = render(<AddressOfDomainChip {...defaultProps} isLoading={true} />);
        expect(getByTestId("ActivityIndicator")).toBeDefined();
    });
});
