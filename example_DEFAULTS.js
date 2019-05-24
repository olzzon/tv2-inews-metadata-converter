export const SERVERS = ["xx.xx.xx.xx","yy.yy.yy.yy"];
export const USERNAME = "iNewsUserName";
export const PASSWORD = "iNewsPassword";
export const INEWS_QUEUE = "INEWS.QUEUE.ON-AIR";
export const MEDIA_FOLDER = "media/";
export const FILE_EXTENSION = ".meta.ftd"; //format is .JSON compatible

export const OVERLAY_TEMPLATES = {
    "bund": {
        "htmlCcgType": "XML",  //XML or INVOKE
        "template": "/HTML-Bundt/BUNDT",
        "layer": 20,
    },
    "topt": {
        "htmlCcgType": "XML",  //XML or INVOKE
        "template": "/HTML-Topt/TOPT",
        "layer": 20,
    },
    "BillederFra": {
        "htmlCcgType": "INVOKE", //XML or INVOKE
        "template": "/main/main",
        "layer": 19,
        "invokeSteps": [
            "mainStrap(true, '{element}', '{element}')",
            "mainStrap(false)"
        ]
    }
};
