import * as UseWalletState from "module/wallet/hook/useWalletState";
import { render, SuccessApiCall } from "test-utils";
import { nfts } from "mocks/nft";
import NftsList from "module/nft/component/core/NftsList/NftsList";
import { waitFor } from "@testing-library/react-native";
import { translate } from "locale";
import { mockedUseWallet } from "mocks/useWalletState";
import { CKBSDKService } from "module/common/service/CkbSdkService";

describe("NftsList tests", () => {
    afterAll(() => {
        jest.restoreAllMocks();
    });

    test("Renders correctly", async () => {
        jest.spyOn(UseWalletState, "default").mockReturnValue(mockedUseWallet);
        jest.spyOn(CKBSDKService.prototype, "getNfts").mockReturnValue(SuccessApiCall(nfts));

        const screen = render(<NftsList />);

        await waitFor(() => expect(screen.getByText("NFT0")));
        expect(screen.getByText("NFT1"));
        expect(screen.getByText("NFT2"));
    });

    test("Renders correctly without transactions", async () => {
        jest.spyOn(UseWalletState, "default").mockReturnValue(mockedUseWallet);
        jest.spyOn(CKBSDKService.prototype, "getNfts").mockReturnValue(SuccessApiCall([]));
        const screen = render(<NftsList />);
        await waitFor(() => expect(screen.getAllByText(translate("no_nfts"))));
    });
});
