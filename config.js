/* #################################################################

     Pentomino Digital
     
     DDI Paderborn, 2020-2022
     
     Realisation: Felix Winkelnkemper,
                  felix.winkelnkemper@uni-paderborn.de
                  
     Published under the European Union Public License
     
     https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
     
     This project uses material from other sources.
     See acknowledgements.md for details.
     
   #################################################################

*/

//All configuration variables are defined here. Sections are used for config dialog in config.pho
//Section 0 is not displayed there and should therefore used for rather internal config values.

//Attention... The line "var PentominoConfig..."" must not be changed in any way as it is processed in config.php!

var PentominoConfig={
    "0": {
        "fieldWidth":{
            "standard":27
        },
        "fieldHeight":{
            "standard":14
        },
        "nocache":{
            "standard":0
        },
        "registerCache":{
            "standard":0
        },
        "doubleDistance":{
            "standard":0
        },
        "diagonalDistance":{
            "standard":0
        }
    },
    "1": {
        "theme":{
            "buttonText":"Theme",
            "values":["standard","wood","gray","v3","v4","v5","tuca"],
            "readable":["standard","wood","gray","v3","v4","v5","tuca"],
            "standard":"standard"
        },
        "language": {
            "buttonText":"Language",
            "values":["","de","en"],
            "readable":["GET_FROM_BROWSER","de","en"],
            "standard":false
        },
        "boardselector":{
            "buttonText":"BoardSelector",
            "values":[1,0],
            "readable":["YES","NO"],
            "standard":1
        },
        "s":{
            "buttonText":"Board",
            "standard":false
        },
        "freezeState":{
            "buttonText":"FreezeState",
            "values":[1,0],
            "readable":["YES","NO"],
            "standard":0
        },
        "loadsave":{
            "buttonText":"ShowLoadSave",
            "values":[1,0],
            "readable":["YES","NO"],
            "standard":0
        },
        "qrbutton":{
            "buttonText":"ShowQRButton",
            "values":[1,0],
            "readable":["YES","NO"],
            "standard":0
        },
        "clear": {
            "buttonText":"ShowClearButton",
            "values":[1,0],
            "readable":["YES","NO"],
            "standard":1
        }
    },
    "2": {
        "solnumber": {
            "buttonText":"ShowSolutionNumber",
            "values":[1,0],
            "readable":["SHOW","NOSHOW"],
            "standard":0
        },
        "hint": {
            "buttonText":"HintDepth",
            "values":[2,1,0],
            "readable":["CONCRETE_HINT","VAGUE_HINT","NO_HINTS"],
            "standard":2
        },
        "autopilot": {
            "buttonText":"HintAutoPilot",
            "values":[0,1],
            "readable":["NO","YES"],
            "standard":0
        },
        "suggest": {
            "buttonText":"ShowSuggestButton",
            "values":[1,0],
            "readable":["YES","NO"],
            "standard":0
        },
        "suggestMode": {
            "buttonText":"SuggestMode",
            "values":[1,0],
            "readable":["HypothesisPlace","DistancePlace"],
            "standard":0
        },
        "heatmap": {
            "buttonText":"ShowHeatmapButton",
            "values":[1,0],
            "readable":["YES","NO"],
            "standard":0
        },
        "partition": {
            "buttonText":"PartitionMode",
            "values":[2,1,0],
            "readable":["COLORIZE","SEQUENTIAL","OFF"],
            "standard":1
        }
    },
    "3": {
        "prefill": {
            "buttonText":"PrefillMode",
            "values":[-1,0,1],
            "readable":["OFF","FILL_GAP","FILL_ONE_TOUCH"],
            "standard":0
        },
        "fillright": {
            "buttonText":"FillRight",
            "values":[0,3,5],
            "readable":["OFF","3_PIECES","5_PIECES"],
            "standard":0
        },
        "fillleft": {
            "buttonText":"FillLeft",
            "values":[0,3,5],
            "readable":["OFF","3_PIECES","5_PIECES"],
            "standard":0
        },
        "fillcenter": {
            "buttonText":"FillCenter",
            "values":[0,3,5],
            "readable":["OFF","3_PIECES","5_PIECES"],
            "standard":0
        }

    },
    "4":{
        "config": {
            "buttonText":"ShowConfigButton",
            "values":[1,0],
            "readable":["YES","NO"],
            "standard":1
        },
        "info": {
            "buttonText":"ShowInfoButton",
            "values":[1,0],
            "readable":["YES","NO"],
            "standard":1
        },
        "appcheck": {
            "buttonText":"ChekAppInstallation",
            "values":[1,0],
            "readable":["YES","NO"],
            "standard":0
        }
    }
}