import NumericPad from "module/common/component/input/NumericPad/NumericPad";
import { Alert, Text, View } from "react-native";
import { useState } from "react";
import { translate } from "locale";
import BasePage from "module/common/component/layout/BasePage/BasePage";
import LogoPage from "../LogoPage/LogoPage";

const LoginPage = (): JSX.Element => {
    const [error, setError] = useState(false);
    const handleSubmit = (pin: string) => {
        if (pin === "1234") {
            setError(false);
            Alert.alert("Correct");
        } else setError(true);
    };
    console.log("main", error);

    return (
        <LogoPage>
            <View style={{width:"100%", height:100}}></View>
            <Text style={{color: "white"}}>hola</Text>
            <NumericPad onSubmit={handleSubmit} error={error} placeholder={translate("enter_your_pin")} />
        </LogoPage>
    );
};

export default LoginPage;
