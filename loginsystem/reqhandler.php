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
    }

    if($_POST['type']==='deletedocumentsDR'){
        $file = file_get_contents('./user-documents/'.$_SESSION['id'].'.txt');
        $file = json_decode($file, true);
        $documentIDs = $_POST['documentIDs'];
        $documentIDs=explode('_',$documentIDs);
        foreach ($documentIDs as $documentID){
            if($documentID)unset($file["boards"][$documentID]);
        }
        $db =json_encode($file,JSON_FORCE_OBJECT);
        $fp = fopen('./user-documents/'.$_SESSION['id'].'.txt', 'w');
        fwrite($fp, $db);
        fclose($fp);
    }

    if($_POST['type']==='updateDocumentCoordinates'){
        $file = file_get_contents('./user-documents/'.$_SESSION['id'].'.txt');
        $file = json_decode($file, true);
        $documentID = $_POST['id'];
        $file["boards"][$documentID]["x"]=$_POST['x'];
        $file["boards"][$documentID]["y"]=$_POST['y'];
        $db =json_encode($file,JSON_FORCE_OBJECT);
        $fp = fopen('./user-documents/'.$_SESSION['id'].'.txt', 'w');
        fwrite($fp, $db);
        fclose($fp);
    }

}
if($_SERVER['REQUEST_METHOD'] == "GET"){
    if (isset($_GET['type']))
    {
        if($_GET['type']=="documents"){
            $file = file_get_contents('./user-documents/'.$_SESSION['id'].'.txt');
            $file = json_decode($file, true);
            $boards=$file["boards"];
            //echo var_dump($boards);
            foreach ($boards as $i=>$board){
                echo '¤'.$i.'&'.$board['x'].'&'.$board['y'].'&'.$board['boardname'].'&'.$board['piecestate1'].'&'.$board['piecestate2'].'&'.$board['boardState'].'&'.$board['TextStatePR'].'&'.$board["boardLayout"];
            };

        }
        if($_GET['type']=="document"){
            $info=explode('.',$_GET['document']);
            $userID=$info[0];
            $documentId=$info[1];
            $file = file_get_contents('./user-documents/'.$userID.'.txt');
            $file = json_decode($file, true);
            $board=$file["boards"][$documentId];
            echo '&'.$board['boardname'].'&'.$board['piecestate1'].'&'.$board['piecestate2'].'&'.$board['boardState'].'&'.$board['TextStatePR'];

        }

    }
    }


