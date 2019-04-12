import fs from 'fs';
import inews from '@johnsand/inews';
import { on } from 'cluster';
import * as DEFAULTS from '../DEFAULTS';

export class App {
    constructor() {
        this.getInewsData = this.getInewsData.bind(this);

        this.inewsConnection = inews({
            'hosts': DEFAULTS.SERVERS,
            'user': DEFAULTS.USERNAME,
            'password': DEFAULTS.PASSWORD
        });
        this.getInewsData()
        .then((data) => {
            this.stories = data.map(({ storyName, story}) => {
                return this.extractInewsMetaData(storyName, story);
            });

            this.stories = this.stories.map(({ storyName, story}) => {
                return this.convertInewsMetaToObject(storyName, story);
            });
        });
    }

    getInewsData() {
        return new Promise((resolve, reject) => {
            let inewsQueue = DEFAULTS.INEWS_QUEUE;
            let stories = [];
            this.inewsConnection.list(inewsQueue, (error, dirList) => {
                if(!error) {
                    console.log("File list readed");
                    dirList.map((storyFile, index) => {
                        this.inewsConnection.storyNsml(inewsQueue, storyFile.file, (error, storyNsml) => {
                            stories.push({"storyName": storyFile.storyName, "story": storyNsml});
                            if (index === dirList.length - 1) {
                                resolve(stories);
                            }    
                        });
                    });
                } else {
                    console.log("Error connetiong iNews :", error);
                    reject(error);
                }
            });
            console.log("Stories recieved");
        });
    }

    extractInewsMetaData(storyName, story) {
        let fileName = story.split("<f id=video-id>")[1].split("</f>")[0];
        if (fileName === "") {
            fileName = storyName;
        }

        //Get all <ae></ae> elements:
        let elements = story.match(/<\s*ae [^>]*>([\s\S]*?)<\s*\/\s*ae>/g);
        if (elements === null) return { "storyName": storyName, "story": [] };

        //Get sub <ap></ap> elements
        let convertedElements = elements
            .map((string) => {
                return string.match(/<\s*ap[^>]*>([\s\S]*?)<\s*\/\s*ap>/g);
            });
        //Clean Up and return without <ap></ap> tags in text:
        convertedElements = convertedElements.map((element) => {
            return element.map( (string) => {
                return string
                .replace(/<\s*ap[^>]*>/, "")
                .replace(/<\s*\/\s*ap>/, "");
            });
        });
        return { "storyName": fileName, "story": convertedElements };
    }

    convertInewsMetaToObject(storyName, story) {
        //Filter out non kg elements:
        story = story.filter((element) => {
            if (element.length < 2) return false;
            if (element[1].length < 3) return false;
            return (element[1].substring(0,3) === "kg ");
        });

        let fileData = story.map((element) => {
            element[1] = element[1].replace("kg ", "");
            let templateType = element[1].split(/ |_/)[0];

            console.log("Type: ", templateType, " Orig text : ", element[1]);
            console.log("Hele Element: ", element);

            let templateDef = DEFAULTS.OVERLAY_TEMPLATES[templateType];
            if (templateDef === undefined) {
                return "";
            }
            let templatePath = templateDef.template;

            return { 
                "startTime": parseFloat(element[3].substring(1)),
                "duration": 5,
                "templatePath": templatePath,
                "layer": templateDef.layer,
                "templateData": [
                    {
                        "id": "f0",
                        "type": "text",
                        "data": element[1].substring(1 + templateType.length)
                    },
                    {
                        "id": "f1",
                        "type": "text",
                        "data": element[2]
                    }
                ]
            };
        });
        if (fileData.length != 0) {
            let formattedData = {
                "channel": [{
                    "metaList": fileData
                }]
            };
            fs.writeFile(DEFAULTS.MEDIA_FOLDER + storyName + ".meta.ftd", JSON.stringify(formattedData, null, 4), (err) => {
                if(err) {
                    return console.log(err);
                }
                console.log("The file ", storyName, " was saved!");
            });
        }
    }
} 