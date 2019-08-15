export const SERVERS = ["xx.xx.xx.xx","yy.yy.yy.yy"];
export const USERNAME = "iNewsUserName";
export const PASSWORD = "iNewsPassword";
export const INEWS_QUEUE = "INEWS.QUEUE.ON-AIR";
export const MEDIA_FOLDER = "media/";
export const FILE_EXTENSION = ".meta.ftd";
//export const FILE_EXTENSION = ".xml";
export const FULL_RUNDOWN = false; // Export whole rundown or only #KG codes



interface overlay_template {
    htmlCcgType: string,
    template: string,
    layer: number,
    invokeSteps: Array<string>
}

export const OVERLAY_TEMPLATES: { [key: string]: overlay_template} = {
    "BillederFra": {
        "htmlCcgType": "XML",  //XML or INVOKE
        "template": "/HTML-Bundt/BUNDT",
        "layer": 20,
        "invokeSteps": []
    },
    "topt": {
        "htmlCcgType": "XML",  //XML or INVOKE
        "template": "/HTML-Topt/TOPT",
        "layer": 20,
        "invokeSteps": []
    },
    "bund": {
        "htmlCcgType": "INVOKE", //XML or INVOKE
        "template": "/main/main",
        "layer": 19,
        "invokeSteps": [
            "mainStrap(true, '{element}', '{element}')",
            "mainStrap(false)"
        ]
    }
};
