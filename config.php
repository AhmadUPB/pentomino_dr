<?php
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

//configuration page used to create a configuration URL

?><!DOCTYPE html>
<html>
<head>
<title>Pentomino Configuration</title>
<meta charset="UTF-8">

<link rel="stylesheet" href="config.css">
<script type="text/javascript" src="qrcode.min.js"></script>
<script>

    // the new URL for the game containing the settings made on the page is created
    // and the URL is called

    var url='';

    function createURL(){

        url='i?';

        var inputs=document.getElementsByTagName('select');

        //replaceAll implementation as older iPads do not know replaceAll
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        function replaceAll(str, find, replace) {
            return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
        }

        for (var i in inputs){

            var input=inputs[i];
            var name=input.id;            

            if(!name) continue;

            var value=input.value;

            if (!value) continue;   // no value indicates the standard values. These are discarded.

            value=encodeURI(input.value);
            value=replaceAll(value,'#','%23');

            url+='&'+name+'='+value; //encoding for board data
        }

        url=url.replace('?&','?');

        showURL(url);
        
    }

    function showURL(url){
        var baseURL = location.href.substring(0,location.href.lastIndexOf('/'));
        var fullURL=baseURL+'/'+url;

        document.getElementById('urlDisplay').innerHTML=fullURL;

        //qrcodes by https://github.com/davidshimjs/qrcodejs
        document.getElementById("qrcodeDisplay").innerHTML='';
        new QRCode(document.getElementById("qrcodeDisplay"), fullURL);

    }

    function apply(){
        location.href=url;
        return false;
    }

</script>
</head>

<body>

<form onchange="createURL();">

<?php

//board selection data

$boards=array();$boardTitles=array();

$boards[]=false;$boardTitles[]=translate('OPTION_NO'); //if nothing is specified, users can choose themselves

if (isset($_GET['state'])){
    $boards[]=$_GET['state'];$boardTitles[]=translate('OPTION_BOARD_PROVIDED'); //if config has been called from a game, the given state can be chosen
}

//get all boards from board configuration folder
$dir=scandir('boards');

foreach ($dir as $entry){
    if ($entry=='.') continue;
    if ($entry=='..') continue;

    $entry=explode('.txt',$entry)[0];

    $boards[]='{"n":"'.$entry.'"}';$boardTitles[]=$entry;

}

//getting configuration option from config.js

$confFile='{'.explode('var PentominoConfig={',file_get_contents('config.js'))[1];
$confData=json_decode($confFile, true);

switch (json_last_error()) { //adaptation if php manual
    case JSON_ERROR_NONE:
    break;
    case JSON_ERROR_DEPTH:
        die(' - Maximum stack depth exceeded');
    break;
    case JSON_ERROR_STATE_MISMATCH:
        die(' - Underflow or the modes mismatch');
    break;
    case JSON_ERROR_CTRL_CHAR:
        die(' - Unexpected control character found');
    break;
    case JSON_ERROR_SYNTAX:
        die(' - Syntax error, malformed JSON');
    break;
    case JSON_ERROR_UTF8:
        die(' - Malformed UTF-8 characters, possibly incorrectly encoded');
    break;
    default:
        die(' - Unknown error');
    break;
}

//displaying configuration dialog

echo '<table>';

foreach ($confData as $section=>$elements){
    if ($section==0) continue;

    foreach ($elements as $variable=>$data){

        if ($variable=='s'){ //boardconfig is a special case as it is individual
            echo configOption('PreselectedBoard','','s',$boards,$boardTitles,false,false);
            continue;
        } 

        echo configOption($data['buttonText'],'',$variable,$data['values'],$data['readable'],$data['standard']);

    }

    echo '<tr class="transparent"><td></td><td>&nbsp;</td><td></td></tr>';
}

//echo '<tr class="transparent"><td></td><td>&nbsp;</td><td></td></tr>';

echo '<tr class="transparent" style="text-align:right"><td></td><td></td><td><button onclick="return apply();">'.translate('APPLY_CONFIG').'</button></td></table>';

echo '</table>';



//create a configuration entry
function configOption($readable,$desc,$name,$values,$readableValues,$standard,$translate=true){

    $provided=isset($_GET[$name])?$_GET[$name]:$standard;

    $out='<tr>';
    $out.='<th>'.translate('CONFIG_'.$readable).':</th>';
    $out.='<td>';

    $out.='<select id="'.$name.'">';

    foreach($values as $id=>$value){
        $oreadable=$readableValues[$id];
        $selected=($value==$provided)?' selected':'';

        if ($value==$standard) $value=''; 

        if ($translate) $oreadable=translate('OPTION_'.$oreadable);

        $out.='<option value="'.htmlentities($value).'"'.$selected.'>'.$oreadable.'</option>';
    }

    $out.='</select>';

    $out.='</td>';
    $out.='<td>'.translate('EXPLANATION_'.$readable).'</td>';
    $out.='</tr>';

    return $out;
}

//translation handling
function loadTranslations(){global $translations;

	//language handling form browser
    $lang=substr($_SERVER['HTTP_ACCEPT_LANGUAGE'],0,2);
    
	if ($lang!='de') $lang='en'; //only German and English at present

    $translations=array();

    $file=file_get_contents('translations/'.$lang.'.txt');
    $lines=explode("\n",$file);

    foreach ($lines as $line){
        $line=trim($line);
        $line=explode('::',$line);

        if (!$line[0]) continue;

        $translations[$line[0]]=$line[1];
    }

}

function translate($text){global $translations;
    if (!$translations) loadTranslations();
    if (isset($translations[$text])) return $translations[$text];
    return '<span style="color:red">'.$text.'</span>';
}

?>
</form>

<div id="targetDisplay">
    <div id="qrcodeDisplay"></div>
    <div id="urlDisplay"></div>
</div>

<script>
    createURL(); //initial URL creation
</script>
</body>
</html>