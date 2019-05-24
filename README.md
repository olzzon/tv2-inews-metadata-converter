## TV2 iNews-metadata-converter

A converter reading stories from iNews FTP server and convert the #kg graphics overlay data from \<ae> tags in inews manus into .meta.ftd files for use on CasparCG-ClipTool.

The example_DEFAULTS.js is the template for the DEFAULTS.js file.

#### Inews connection:
IP, USERNAME, PASSWD etc.

#### File output:
The output file is json formatted so FILE_EXTENSION con be remaned to .json for other usecases.

### The OVERLAY_TEMPLATES structure is: 
* name: #kg name from the iNews manus
* htmlCcgType can be:
* * "XML" Add, Play, Stop based templates
* * "INVOKE" uses Invoke to call javascript methods. Parameters are added with {element} tags
* template: reference to the html template
* layer: so more than one element can be on screen at a time. (ClipTool is using 19 and 20)
* invokeSteps: Array with the steps for calling the javascript methods.

example: 
(from examle_DEFAULTS.js)
```
"topt": {
        "htmlCcgType": "XML",  //XML or INVOKE
        "template": "/HTML-Topt/TOPT",
        "layer": 20,
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
```

A list of all the TV2 #kg codes is in the "TV2_INEWS_KG_CODES.xml" file.

### Install:
```
git clone https://github.com/olzzon/tv2-inews-metadata-converter
cd tv2-inews-metadata-converter
mv example_DEFAULTS.js DEFAULTS.js 
nano DEFAULTS.js (Edit username, password, ip etc.)
```

### Run and build:
```
yarn
yarn build
yarn start
```
