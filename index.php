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

session_start();
//timestamp used in order to avoid caching.'
$t='?t='.time();

?><!DOCTYPE html>
<html>
<head>
<title>DDI Pentomino</title>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, orientation=landscape, width=device-width">
<meta name="description" content="A truely digital Pentomino adaptation">
<meta name="keywords" content="Pentomino, Math, Digitality">
 
<meta name="theme-color" content="#000">
<meta name="mobile-web-app-capable" content="yes">

<meta name="apple-mobile-web-app-title" content="DDI Pentomino Digital">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">

<meta name="msapplication-navbutton-color" content="black">
<meta name="msapplication-TileColor" content="#da532c">
<meta name="msapplication-TileImage" content="./appinfo/apple-touch-icon.png">
<meta name="msapplication-config" content="browserconfig.xml">

<meta name="application-name" content="DDI Pentomino Digital">
<meta name="msapplication-tooltip" content="DDI Pentomino Digital">

<meta name="msapplication-tap-highlight" content="no">

<meta name="full-screen" content="yes">
<meta name="browsermode" content="application">

<meta name="nightmode" content="enable/disable">
<meta name="layoutmode" content="fitscreen/standard">
<meta name="screen-orientation" content="landscape">

<meta property="og:title" content="DDI Pentomino Digital"/>
<meta name="format-detection" content="telephone=no">

<link rel="apple-touch-icon" sizes="120x120" href="./appinfo/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="./appinfo/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="./appinfo/favicon-16x16.png">
<link rel="manifest" href="./appinfo/site.webmanifest">
<link rel="mask-icon" href="./appinfo/safari-pinned-tab.svg" color="#5bbad5">
<link href="favicon.ico" rel="shortcut icon" type="image/x-icon">
  
  
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-touch-fullscreen" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="google" content="notranslate">
<meta name="HandheldFriendly" content="true">
<meta http-equiv="x-ua-compatible" content="ie=edge">


<link rel="stylesheet" id="boardstyle" href="boardstyles/standard.css<?=$t?>">
<link rel="stylesheet" href="style.css<?=$t?>">

<script type="text/javascript" src="qrcode.min.js"></script>

<script src="config.js<?=$t?>"></script>
<script type="text/javascript"> var isLoggedIn=<?php echo(isset($_SESSION['id']));?></script>
    <script type="text/javascript">
        var LoggedIn = <?php echo json_encode($_SESSION['id']); ?>;
        console.log(LoggedIn);
    </script>
    <script type="text/javascript">
        var annotatedDocument = <?php echo (json_encode($_GET['d'])); ?>;
    </script>


<?php

    //load addconfig if conf parameter is given

    if (isset($_GET['conf'])) {
        echo '<script src="configs/'.$_GET['conf'].'.js'.$t.'"></script>';
    }


?>

<script src="Piece.js<?=$t?>"></script>
<script src="Game.js<?=$t?>"></script>
<script src="UI.js<?=$t?>"></script>
<script src="Visual.js<?=$t?>"></script>
<script src="Evaluator.js<?=$t?>"></script>
<script src="Hinter.js<?=$t?>"></script>
<script src="PD.js<?=$t?>"></script>
<script src="Konva.js<?=$t?>"></script>
<script src="DocumentDR.js<?=$t?>"></script>



<script>
    function initialize(){

        //check for class functionality

        try { eval('"use strict"; class foo {}'); } catch (e) {
             location.href='help/oldbrowser_class.php'; 
             return;
        }

        if (!(new URL(document.location)).searchParams){
            location.href='help/oldbrowser_params.php';
            return;
        }

        window.pd=new PD();	
    }
</script>


</head>

<body onload="initialize();">
</body>

</html>