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

<?php

require_once ('slimdown.php');

echo Slimdown::render (file_get_contents('explanation.md'));


?>

</article>
</body>
</html>
