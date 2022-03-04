import { ComponentType } from "react";
import { ModalWithId } from "module/common/component/base/feedback/ModalProvider/ModalProvider.types";

export default function createModal<P>(Component: ComponentType<P>): ModalWithId<P> {
    const id = (+new Date() + Math.random() * 1000).toFixed(0);
    const Modal: ComponentType<P> & { id: string } = Component as ModalWithId<P>;
    Modal.id = id;
    return Modal;
}