<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>Pentomino Digital</title>

<link href="style.css" rel="stylesheet">

</head>
<body>

<img src="pentomino_title.png" class="title" alt="Pentomino digital">

<navigation>
<?php include('navigation.php'); ?>
</navigation>
<article>

<h1>Pentomino Digital – DDI edition</h1>

<pre>

     <b>Pentomino Digital</b>
     
     DDI Paderborn, 2020-2022
     
     Realisation: Felix Winkelnkemper,
                  felix.winkelnkemper@uni-paderborn.de
                  
     Published under the <a href="https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12">European Union Public License</a>
     
</pre>

<?php

require_once ('slimdown.php');

echo Slimdown::render (file_get_contents('../acknowledgements.md'));


?>

</article>
</body>
</html>
