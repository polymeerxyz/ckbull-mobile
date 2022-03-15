import { SvgIcon, SvgIconProps } from "react-native-components";
import { Path } from "react-native-svg";

export function InvalidIcon(props: Omit<SvgIconProps, "children">): JSX.Element {
    return (
        <SvgIcon
            // @ts-ignore
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            {...props}
            {...{ testID: "InvalidIcon" }}
        >
            <Path d="M12 0C18.6276 0 24 5.3724 24 12C24 18.6276 18.6276 24 12 24C5.3724 24 0 18.6276 0 12C0 5.3724 5.3724 0 12 0ZM12 1.8C9.29479 1.8 6.70038 2.87464 4.78751 4.78751C2.87464 6.70038 1.8 9.29479 1.8 12C1.8 14.7052 2.87464 17.2996 4.78751 19.2125C6.70038 21.1254 9.29479 22.2 12 22.2C14.7052 22.2 17.2996 21.1254 19.2125 19.2125C21.1254 17.2996 22.2 14.7052 22.2 12C22.2 9.29479 21.1254 6.70038 19.2125 4.78751C17.2996 2.87464 14.7052 1.8 12 1.8V1.8ZM16.1352 7.6764L16.236 7.764C16.3884 7.91639 16.4811 8.11841 16.4972 8.33334C16.5132 8.54827 16.4517 8.76184 16.3236 8.9352L16.236 9.036L13.2732 12L16.2372 14.964C16.3894 15.1165 16.4819 15.3186 16.4977 15.5336C16.5136 15.7485 16.4518 15.962 16.3236 16.1352L16.236 16.236C16.0836 16.3884 15.8816 16.4811 15.6667 16.4972C15.4517 16.5132 15.2382 16.4517 15.0648 16.3236L14.964 16.236L12 13.2732L9.036 16.2372C8.88346 16.3894 8.68136 16.4819 8.46643 16.4977C8.25151 16.5136 8.03803 16.4518 7.8648 16.3236L7.764 16.236C7.61158 16.0836 7.51891 15.8816 7.50283 15.6667C7.48675 15.4517 7.54834 15.2382 7.6764 15.0648L7.764 14.964L10.7268 12L7.7628 9.036C7.61056 8.88346 7.51811 8.68136 7.50225 8.46643C7.4864 8.25151 7.54819 8.03803 7.6764 7.8648L7.764 7.764C7.91639 7.61158 8.11841 7.51891 8.33334 7.50283C8.54827 7.48675 8.76184 7.54834 8.9352 7.6764L9.036 7.764L12 10.7268L14.964 7.7628C15.1165 7.61056 15.3186 7.51811 15.5336 7.50225C15.7485 7.4864 15.962 7.54819 16.1352 7.6764V7.6764Z" />
        </SvgIcon>
    );
}
