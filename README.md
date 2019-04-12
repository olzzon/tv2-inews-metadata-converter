## TV2 iNews-metadata-converter

A converter reading stories from iNews FTP server and convert the #kg graphics overlay data from \<ae> tags in inews manus into .meta.ftd files for use on CasparCG-ClipTool.

The example_DEFAULTS.js is the template for the DEFAULTS.js file.

The OVERLAY_TEMPLATES structure is: 
* name: #kg name from the iNews manus
* template: reference to the html template
* layer: so more than one element can be on screen at a time. (ClipTool is using 19 and 20)

example: 
(from examle_DEFAULTS.js)
```
"bund": {
        "template": "/HTML-Bundt/BUNDT",
        "layer": 20,
    },
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
