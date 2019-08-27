import fs from 'fs';
import inews from '@johnsand/inews';
import * as DEFAULTS from './DEFAULTS';

export class App {
    inewsConnection: any;
    stories: Array<any> = [];

    constructor() {
        this.getInewsData = this.getInewsData.bind(this);

        this.inewsConnection = inews({
            'hosts': DEFAULTS.SERVERS,
            'user': DEFAULTS.USERNAME,
            'password': DEFAULTS.PASSWORD
        });
        this.getInewsData()
        .then((data) => {
            if (!DEFAULTS.FULL_RUNDOWN) {
            this.stories = data.map(({ storyName, story}) => {
                return this.extractInewsMetaData(storyName, story);
            });
                this.stories = this.stories.map(({ storyName, story}) => {
                    return this.convertInewsMetaToObject(storyName, story);
                });
            } else {
                data.map(({ storyName, story}, index) => {
                    this.writeFullStory(storyName, story, index)
                })
            }
        });
    }

    getInewsData(): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            let inewsQueue = DEFAULTS.INEWS_QUEUE;
            let stories: Array<any> = [];
            this.inewsConnection.list(inewsQueue, (error: any, dirList: any) => {
                if(!error) {
                    console.log("File list readed");
                    dirList.map((storyFile: any, index: number) => {
                        this.inewsConnection.storyNsml(inewsQueue, storyFile.file, (error: any, storyNsml: any) => {
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

    extractInewsMetaData(storyName: string, story: any) {
        let fileName = story.split("<f id=video-id>")[1].split("</f>")[0];
        if (fileName === "") {
            fileName = storyName;
        }

        //Get all <ae></ae> elements:
        let elements = story.match(/<\s*ae [^>]*>([\s\S]*?)<\s*\/\s*ae>/g);
        if (elements === null) return { "storyName": storyName, "story": [] };

        //Get sub <ap></ap> elements
        let convertedElements = elements
            .map((string: string) => {
                return string.match(/<\s*ap[^>]*>([\s\S]*?)<\s*\/\s*ap>/g);
            });
        //Clean Up and return without <ap></ap> tags in text:
        convertedElements = convertedElements.map((element: any) => {
            return element.map( (string: string) => {
                return string
                .replace(/<\s*ap[^>]*>/, "")
                .replace(/<\s*\/\s*ap>/, "");
            });
        });
        return { "storyName": fileName, "story": convertedElements };
    }

    convertInewsMetaToObject(storyName: string, story: Array<any>) {
        //Filter out non kg elements:
        story = story.filter((element) => {
            if (element.length < 2) return false;
            if (element[1].length < 3) return false;
            return (element[1].substring(0,3) === "kg ");
        });

        let fileData = story.map((element) => {
            element[1] = element[1].replace("kg ", "");
            let templateType: string = element[1].split(/ |_/)[0];

            console.log("Type: ", templateType, " Orig text : ", element[1]);
            console.log("Whole Element: ", element);

            let templateDef = DEFAULTS.OVERLAY_TEMPLATES[templateType];
            if (templateDef === undefined) {
                return "";
            }
            let templatePath = templateDef.template;

            if (templateDef.htmlCcgType === "XML") {
                return {
                    "htmlCcgType": "XML", // "XML" or "INVOKE",
                    "templatePath": templatePath,
                    "startTime": 60 * parseFloat(element[3].substring(1)) | 0,
                    "duration": 5,
                    "layer": templateDef.layer,
                    "templateXmlData": [
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
                    ],
                    "invokeSteps": []
                };
            } else if (templateDef.htmlCcgType === "INVOKE") {
                let invokeSteps = templateDef.invokeSteps.map((step: string) => {
                    let replacedStep = step.replace('{element}', element[1].substring(1 + templateType.length));
                    replacedStep = replacedStep.replace('{element}', element[2]);
                    return replacedStep;
                });
                return {
                    "htmlCcgType": "INVOKE", // "XML" or "INVOKE",
                    "templatePath": templatePath,
                    "startTime": 60 * parseFloat(element[3].substring(1)) | 0,
                    "duration": 5,
                    "layer": templateDef.layer,
                    "templateXmlData": [],
                    "invokeSteps": invokeSteps
                };
            }
        });


        if (fileData.length != 0) {
            let formattedData = {
                "channel": [{
                    "metaList": fileData
                }]
            };
            fs.writeFile(DEFAULTS.MEDIA_FOLDER + storyName + DEFAULTS.FILE_EXTENSION, JSON.stringify(formattedData, null, 4), (err: any) => {
                if(err) {
                    return console.log(err);
                }
                console.log("The file ", storyName, " was saved!");
            });
        }
    }

    writeFullStory(storyName: string, story: string, index: number) {
        storyName = storyName.replace('/', '');

		// Split tags into objects:
		let storyArray = story.split('\n')

		// Put end tag on <meta>
		storyArray[2] = storyArray[2].replace(/<meta(.*?)>/g, '<meta$1\></meta>')

		console.log('DUMMY LOG : ', storyArray)

		storyArray = storyArray.map((story: string) => {
			// Set quotes around arguments xx="yy" instead of xx=yy
			// But not on <ap> tags:
			if (story.slice(0, 3) !== '<ap') {
				// and not when there´s allready qoute around argument:
				if (!story.match(/="/)) {
					story = story.replace(/(<.*?)=(.*?)>/g, '$1="$2">')
				}
			}
			// Put end tag on <a> tags:
			story = story.replace(/<a (.*?)>/g, '<a $1></a>')
			// Remove double tab in some forms:
			story = story.replace(/<tab>/g, '')

			return story
		})
		// Change header to XML:
		storyArray[0] = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>'
		// Put tag around the full form (head-body etc.):
		storyArray.splice(1, 0, '<root>')
		storyArray.push('</root>')

		// Convert back to string:
		story = storyArray.join('\n')

        console.log(("00"+String(index)).slice(-3)+" "+storyName, story);
        fs.writeFile(DEFAULTS.MEDIA_FOLDER + ("00"+String(index)).slice(-3) + " " + storyName + DEFAULTS.FILE_EXTENSION, story, (err: any) => {
            if(err) {
                return console.log(err);
            }
            console.log("The file ", storyName, " was saved!");
        });
    }
}

