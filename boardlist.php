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

//This file crateas a list of board configurations which are saved as simple text files in
//the board subfolder. Each line of those text files contains solution information line by line
//
//Format of a solution: FFIIIIIZ VFFPPZZZ VF.PPZWW VVV.PWWY LUUX.WYY LUXXX.TY LUUXNNTY LLNNNTTT
//
//lines are separated by blanks, dots represent blocked cells (holes in the board, outer areas of a bounding box)
//
//The list created here containt this information together with sime metadata: 
//
//Format: 8x8e#74#8#8#4#FFIIIIIZ VFFPPZZZ VF.PPZWW VVV.PWWY LUUX.WYY LUXXX.TY LUUXNNTY LLNNNTTT
//        ID#Solutions#Rows#Cols#BlockedElements#Topology

header("Content-Type: text/plain");

$files=scandir('boards');

foreach($files as $file){
	
	if ($file=='.'||$file=='..') continue;
	
	$file=str_replace('.txt','',$file);
	
	$line=$file.'#'; //The id quals the filename
	
	$file=file_get_contents('boards/'.$file.'.txt');
	$file=explode("\n",$file);
	
	foreach ($file as $k=>$v){ if (!$v) unset ($file[$k]);} //Handle empty lines
	
	$line.=count($file).'#'; //The number of solutions in the file
	
	$oneSolutionString=explode(', ',$file[0])[1]; //The first solution
	
	$rows=explode(' ',$oneSolutionString); 
	$numRows=count($rows);
	$numCols=strlen($rows[0]);
	$numBlock=substr_count($oneSolutionString,'.');
	
	$line.=$numRows.'#'.$numCols.'#'.$numBlock.'#'; //#rows#cols#blockedCells
	
	$line.=$oneSolutionString; //Add the first solution string
	
	$line.="\n"; //End of line
	
	echo $line;
}

?>