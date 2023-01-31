<?php
session_start();
if($_SERVER['REQUEST_METHOD'] == "POST"){
    if($_POST['type']==='storedocumentPR'){
        $file = file_get_contents('./user-documents/'.$_SESSION['id'].'.txt');
        $file = json_decode($file, true);
        $file["documents"][uniqid()]=array('x' => $_POST['x'], 'y' => $_POST['y'], 'boardname' => $_POST['boardname'], 'piecestate1' => $_POST['piecestate1'],'piecestate2' => $_POST['piecestate2'],'boardState' => $_POST['boardState'], 'TextStatePR' => $_POST['TextStatePR'], 'boardLayout' => $_POST['boardLayout']);
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
            if($documentID)unset($file["documents"][$documentID]);
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
        $file["documents"][$documentID]["x"]=$_POST['x'];
        $file["documents"][$documentID]["y"]=$_POST['y'];
        $db =json_encode($file,JSON_FORCE_OBJECT);
        $fp = fopen('./user-documents/'.$_SESSION['id'].'.txt', 'w');
        fwrite($fp, $db);
        fclose($fp);
    }
    if($_POST['type']==='postTextStateDR'){
        $file = file_get_contents('./user-documents/'.$_SESSION['id'].'.txt');
        $file = json_decode($file, true);
        $file["texts"]=$_POST['state'];
        $db =json_encode($file,JSON_FORCE_OBJECT);
        $fp = fopen('./user-documents/'.$_SESSION['id'].'.txt', 'w');
        fwrite($fp, $db);
        fclose($fp);
    }

}
if($_SERVER['REQUEST_METHOD'] == "GET"){
    if (isset($_GET['type']))
    {
        if($_GET['type']=="documentData"){
            $file = file_get_contents('./user-documents/'.$_SESSION['id'].'.txt');
            $file = json_decode($file, true);
            $toEcho="";
            $toEcho=$file["rectangles"]."%".$file["arrows"]."%".$file["texts"]."%";
            $documents=$file["documents"];
            //echo var_dump($boards);
            foreach ($documents as $i=>$document){
                $toEcho.= '¤'.$i.'&'.$document['x'].'&'.$document['y'].'&'.$document['boardname'].'&'.$document['piecestate1'].'&'.$document['piecestate2'].'&'.$document['boardState'].'&'.$document['TextStatePR'].'&'.$document["boardLayout"];
            };
            echo $toEcho;

        }
        if($_GET['type']=="document"){
            $info=explode('.',$_GET['document']);
            $userID=$info[0];
            $documentId=$info[1];
            $file = file_get_contents('./user-documents/'.$userID.'.txt');
            $file = json_decode($file, true);
            $document=$file["documents"][$documentId];
            echo '&'.$document['boardname'].'&'.$document['piecestate1'].'&'.$document['piecestate2'].'&'.$document['boardState'].'&'.$document['TextStatePR'];

        }

    }
    }


