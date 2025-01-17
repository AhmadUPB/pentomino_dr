<?php
session_start();
if ($_SERVER['REQUEST_METHOD'] == "POST") {
    // store a new document sent to the Document Room
    if ($_POST['type'] === 'storedocumentPR') {
        $file = file_get_contents('./user-documents/' . $_SESSION['id'] . '.txt');
        $file = json_decode($file, true);
        echo $_POST['x'] . "," . $_POST['y'] . "," . $_POST["boardname"] . "," . $_POST['piecestate1'] . "," . $_POST['piecestate2'];
        $file["documents"][uniqid()] = array('x' => $_POST['x'], 'y' => $_POST['y'], 'boardname' => $_POST['boardname'], 'piecestate1' => $_POST['piecestate1'], 'piecestate2' => $_POST['piecestate2'], 'boardState' => $_POST['boardState'], 'TextStatePR' => $_POST['TextStatePR'], 'boardLayout' => $_POST['boardLayout']);
        $db = json_encode($file, JSON_FORCE_OBJECT);
        $fp = fopen('./user-documents/' . $_SESSION['id'] . '.txt', 'w');
        fwrite($fp, $db);
        fclose($fp);
    }
    // delete a document or many documents from the Document Room
    if ($_POST['type'] === 'deletedocumentsDR') {
        $file = file_get_contents('./user-documents/' . $_SESSION['id'] . '.txt');
        $file = json_decode($file, true);
        $documentIDs = $_POST['documentIDs'];
        $documentIDs = explode('_', $documentIDs);
        foreach ($documentIDs as $documentID) {
            if ($documentID) unset($file["documents"][$documentID]);
        }
        $db = json_encode($file, JSON_FORCE_OBJECT);
        $fp = fopen('./user-documents/' . $_SESSION['id'] . '.txt', 'w');
        fwrite($fp, $db);
        fclose($fp);
    }
    // Update document position
    if ($_POST['type'] === 'updateDocumentCoordinates') {
        $file = file_get_contents('./user-documents/' . $_SESSION['id'] . '.txt');
        $file = json_decode($file, true);
        $documentID = $_POST['id'];
        $file["documents"][$documentID]["x"] = $_POST['x'];
        $file["documents"][$documentID]["y"] = $_POST['y'];
        $db = json_encode($file, JSON_FORCE_OBJECT);
        $fp = fopen('./user-documents/' . $_SESSION['id'] . '.txt', 'w');
        fwrite($fp, $db);
        fclose($fp);
    }
    // update the labels state of Document Room
    if ($_POST['type'] === 'postTextStateDR') {
        $file = file_get_contents('./user-documents/' . $_SESSION['id'] . '.txt');
        $file = json_decode($file, true);
        $file["texts"] = $_POST['state'];
        $db = json_encode($file, JSON_FORCE_OBJECT);
        $fp = fopen('./user-documents/' . $_SESSION['id'] . '.txt', 'w');
        fwrite($fp, $db);
        fclose($fp);
    }
    // update the rectangles' state of Document Room
    if ($_POST['type'] === 'postRectangleStateDR') {
        $file = file_get_contents('./user-documents/' . $_SESSION['id'] . '.txt');
        $file = json_decode($file, true);
        $file["rectangles"] = $_POST['state'];
        $db = json_encode($file, JSON_FORCE_OBJECT);
        $fp = fopen('./user-documents/' . $_SESSION['id'] . '.txt', 'w');
        fwrite($fp, $db);
        fclose($fp);
    }
    // update the arrows' state of Document Room
    if ($_POST['type'] === 'postArrowStateDR') {
        $file = file_get_contents('./user-documents/' . $_SESSION['id'] . '.txt');
        $file = json_decode($file, true);
        $file["arrows"] = $_POST['state'];
        $db = json_encode($file, JSON_FORCE_OBJECT);
        $fp = fopen('./user-documents/' . $_SESSION['id'] . '.txt', 'w');
        fwrite($fp, $db);
        fclose($fp);
    }
}
if ($_SERVER['REQUEST_METHOD'] == "GET") {
    if (isset($_GET['type'])) {
        // get the whole Document Room content
        if ($_GET['type'] == "documentData") {
            $file = file_get_contents('./user-documents/' . $_SESSION['id'] . '.txt');
            $file = json_decode($file, true);
            $toEcho = "";
            $rectangles = "";
            $arrows = "";
            $texts = "";
            if (!empty($file["rectangles"])) $rectangles = $file["rectangles"];
            if (!empty($file["arrows"])) $arrows = $file["arrows"];
            if (!empty($file["texts"])) $texts = $file["texts"];
            $toEcho = $rectangles . "%" . $arrows . "%" . $texts . "%";
            $documents = $file["documents"];
            if ($documents)
                foreach ($documents as $i => $document) {
                    $toEcho .= '¤' . $i . '&' . $document['x'] . '&' . $document['y'] . '&' . $document['boardname'] . '&' . $document['piecestate1'] . '&' . $document['piecestate2'] . '&' . $document['boardState'] . '&' . $document['TextStatePR'] . '&' . $document["boardLayout"];
                };
            echo $toEcho;

        }
        // get the referenced document
        if ($_GET['type'] == "document") {
            $info = explode('.', $_GET['document']);
            $userID = $info[0];
            $documentId = $info[1];
            $file = file_get_contents('./user-documents/' . $userID . '.txt');
            $file = json_decode($file, true);
            $document = $file["documents"][$documentId];
            echo '&' . $document['boardname'] . '&' . $document['piecestate1'] . '&' . $document['piecestate2'] . '&' . $document['boardState'] . '&' . $document['TextStatePR'];

        }
    }
}


