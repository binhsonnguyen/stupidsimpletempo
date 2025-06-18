// /src/ui/domElements.ts
export interface DomElementsContainer {
    rotaryDialContainerElement: HTMLElement | null;
    startStopButtonElement: HTMLElement | null;
    rotaryKnobElement: HTMLElement | null;
    labelLayerElement: HTMLElement | null;
    tickMarkLayerElement: HTMLElement | null;
    dialTrackBorderLayerElement: HTMLElement | null;
    arcLayerElement: HTMLElement | null;
    appVersionElement: HTMLElement | null;
    dialAreaWrapperElement: HTMLElement | null; // querySelector có thể trả về Element hoặc null
}

export const dom: DomElementsContainer = {
    rotaryDialContainerElement: null,
    startStopButtonElement: null,
    rotaryKnobElement: null,
    labelLayerElement: null,
    tickMarkLayerElement: null,
    dialTrackBorderLayerElement: null,
    arcLayerElement: null,
    appVersionElement: null,
    dialAreaWrapperElement: null
};

export function initDomElements(): Promise<void> {
    return new Promise((resolve, reject) => {
        dom.rotaryDialContainerElement = document.getElementById('rotaryDialContainer');
        dom.startStopButtonElement = document.getElementById('startStopButton');
        dom.rotaryKnobElement = document.getElementById('rotaryKnob');
        dom.labelLayerElement = document.getElementById('labelLayer');
        dom.tickMarkLayerElement = document.getElementById('tickMarkLayer');
        dom.dialTrackBorderLayerElement = document.getElementById('dialTrackBorderLayer');
        dom.arcLayerElement = document.getElementById('arcLayer');
        dom.appVersionElement = document.getElementById('appVersion');
        // querySelector có thể trả về Element hoặc null, HTMLElement là một type assertion an toàn hơn nếu bạn chắc chắn
        dom.dialAreaWrapperElement = document.querySelector<HTMLElement>('.dial-area-wrapper');

        // Kiểm tra giá trị của các thuộc tính trong đối tượng dom, không phải tên thuộc tính
        for (const key in dom) {
            if (dom[key as keyof DomElementsContainer] === null) {
                // Nếu một element không tìm thấy, reject với tên của element đó
                // Hoặc bạn có thể throw Error để rõ ràng hơn
                const errorMessage = `DOM element not found: ${key}`;
                console.error(errorMessage);
                reject(new Error(errorMessage));
                return; // Thoát khỏi hàm sau khi reject
            }
        }

        resolve();
    });
}