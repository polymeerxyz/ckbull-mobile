import { DAOWithdrawIcon, DAODepositIcon } from "icons";
import { useModal } from "@peersyst/react-native-components";
import CardButtons from "module/common/component/input/CardButtons/CardButtons";
import DepositModal from "../../DepositModal/DepositModal";
import WithdrawModal from "../../WithdrawModal/WithdrawModal";
import { useTranslate } from "module/common/hook/useTranslate";

const CARD_BUTTON_ICON_SIZE = 24;

const DAOCardButtons = (): JSX.Element => {
    const { showModal } = useModal();
    const translate = useTranslate();
    return (
        <CardButtons
            //Left props
            leftLabel={translate("deposit")}
            leftIcon={<DAODepositIcon style={{ fontSize: CARD_BUTTON_ICON_SIZE }} />}
            leftButtonOnPress={() => showModal(DepositModal)}
            //Right props
            rightLabel={translate("withdraw")}
            rightIcon={<DAOWithdrawIcon style={{ fontSize: CARD_BUTTON_ICON_SIZE }} />}
            rightButtonOnPress={() => showModal(WithdrawModal)}
        />
    );
};

export default DAOCardButtons;
