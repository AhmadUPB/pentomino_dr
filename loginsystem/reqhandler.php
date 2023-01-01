<?php
session_start();
if($_SERVER['REQUEST_METHOD'] == "POST"){
    if($_POST['type']==='storedocumentPR'){
        $file = file_get_contents('./user-documents/'.$_SESSION['id'].'.txt');
        $file = json_decode($file, true);
        $file["boards"][uniqid()]=array('x' => $_POST['x'], 'y' => $_POST['y'], 'boardname' => $_POST['boardname'], 'piecestate1' => $_POST['piecestate1'],'piecestate2' => $_POST['piecestate2'],'boardState' => $_POST['boardState'], 'TextStatePR' => $_POST['TextStatePR'], 'boardLayout' => $_POST['boardLayout']);
        $db =json_encode($file,JSON_FORCE_OBJECT);
        $fp = fopen('./user-documents/'.$_SESSION['id'].'.txt', 'w');
        fwrite($fp, $db);
        fclose($fp);
    }}
if($_SERVER['REQUEST_METHOD'] == "GET"){
    if (isset($_GET['type']))
    {
        if($_GET['type']=="documents"){
            $file = file_get_contents('./user-documents/'.$_SESSION['id'].'.txt');
            $file = json_decode($file, true);
            $boards=$file["boards"];
            //echo var_dump($boards);
            foreach ($boards as $i=>$board){
                echo '¤'.$board['x'].'&'.$board['y'].$board['boardname'].'&'.$board['piecestate1'].'&'.$board['piecestate2'].'&'.$board['boardState'].'$'.$board['TextStatePR'].'$'.$board["boardLayout"];
            };

        }
    }
    }

    //$name= $_POST['name'];
    //$state = $_POST['state'];
    //$history=$_POST['history'];
    //$id=$_SESSION['id'];
    //$query = "insert into boards (user_id,name,state,history) values ('$id','$name','$state','$history')";
    //mysqli_query($con, $query);
    //header("Location: ".$_POST['url']);
