<?php


session_start();


if ($_SERVER['REQUEST_METHOD'] == "POST") {
    //something was posted
    $email = $_POST['email'];
    $password = $_POST['password'];

    if (!empty($email) && !empty($password) && !is_numeric($email)) {

        //read from database
        $file = file_get_contents('./database.txt');
        $file = json_decode($file, true);
        $id =  md5($_POST["email"]);
        $user_data = isset($file[$id])?$file[$id]:"";

        if ($user_data) {
                if (password_verify($password,$user_data['password'] )) {
                    $_SESSION['id'] = $id;
                    header("Location: ../index.php");
                    die;
                }
        }

        echo "Wrong Username or Password!";
    } else {
        echo "Empty Fields!";
    }
}

?><!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>login</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div id="img2"></div>
<div id="img"></div>
<div id="box">
    <form method="post">
        <div style="font-size: 1em; margin: 0.1vw; color:black">Email:</div>
        <input id="text" type="text" name="email"><br><br>
        <div style="font-size: 1em; margin: 0.1vw; color:black">Password:</div>
        <input id="text" type="password" name="password"><br><br>
        <input id="button" type="submit" value="login"><br><br>
        <span style="font-size: 1em; margin: 0.1vw; color:black">not registered? </span>
        <a href="register.php">register</a><br><br>
        <span style="font-size: 1em; margin: 0.1vw; color:black; position: center">or: </span>
        <a href="../index.php">play without document room</a>
    </form>
</div>
</body>
</html>
