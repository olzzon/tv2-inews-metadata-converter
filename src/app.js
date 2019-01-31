import fs from 'fs';
import inews from '@johnsand/inews';
import { on } from 'cluster';
import * as DEFAULTS from '../DEFAULTS';

export class App {
    constructor() {
        console.log("RUNNING");
        this.getInewsData = this.getInewsData.bind(this);

        this.inewsConnection = inews({
            'hosts': DEFAULTS.SERVERS,
            'user': DEFAULTS.USERNAME,
            'password': DEFAULTS.PASSWORD
        });
        this.getInewsData()
        .then((data) => {
            this.stories = data.map(({ storyName, story}) => {
                return { "storyName": storyName, "story": this.extractInewsMetaData(story)};
            });
            //Filter out <ae></ae> without kg data
            this.stories = this.stories.map((story) => {
                return story.filter((aeData) => {
                    return (aeData[1].subString(0,3) === "kg ");
                });
            });
            console.log("Stories With #kg codes:", this.stories);
            this.stories = this.stories.map(({ storyName, story}) => {
                return this.convertInewsMetaToObject(storyName, story);
            });
        });
        console.log("Didn't crash");
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

    extractInewsMetaData(story) {
        //Get all <ae></ae> elements:
        let aeInStory = story
            .match(/<\s*ae [^>]*>([\s\S]*?)<\s*\/\s*ae>/g);
        if (aeInStory === null) return [];

        //Get sub <ap></ap> elements
        let converted = aeInStory
            .map((string) => {
                return string.match(/<\s*ap[^>]*>([\s\S]*?)<\s*\/\s*ap>/g);
            });
        //Clean Up and return without <ap></ap> tags in text:
        return converted.map((element) => {
            return element.map( (string) => {
                return string
                .replace(/<\s*ap[^>]*>/, "")
                .replace(/<\s*\/\s*ap>/, "");
            });
        });
    }

    convertInewsMetaToObject(storyName, story) {
        let fileData = story.map((data) => {
            return { 
                "startTime": data[3],
                "duration": data[3],
                "templatePath": "/HTML-Bundt/BUNDT",
                "templateData": [
                    {
                        "id": "f0",
                        "type": "text",
                        "data": data[1]
                    },
                    {
                        "id": "f1",
                        "type": "text",
                        "data": data[2]
                    }
                ]
            };
        });
        console.log(fileData);
        /*
        fs.writeFile("media/" + storyName, JSON.stringify(fileData), (err) => {
            if(err) {
                return console.log(err);
            }
            console.log("The file ", storyName, " was saved!");
        });
        */
    }
} 