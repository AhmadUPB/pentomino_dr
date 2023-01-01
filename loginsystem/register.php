<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!empty($_POST["email"]) && !empty($_POST["psw"])  && !empty($_POST["psw-repeat"])) {
        $email = trim($_POST["email"]);
        if ($_POST["psw"] == $_POST["psw-repeat"]){
            $pw =  password_hash($_POST["psw"],PASSWORD_DEFAULT);
            $id =  md5($_POST["email"]);
            $file = file_get_contents('./database.txt');
            $file = json_decode($file, true);
            if (is_array($file))$registered= isset($file["$id"] ); // check if the user already registered
            else  $registered=false;
            if (empty($file)){ // in case the database file is empty, make an array to save users' info
                $new = array(
                    $id => array(
                        'email' => "$email",
                        'password' => "$pw"
                    )
                );
                $db =json_encode($new, JSON_FORCE_OBJECT);
            }


            else if (is_array($file)&& !$registered){ // in the database file not empty just add the new user

                    $new =  array('email' => "$email",'password' => "$pw");
                    $file["$id"] = $new;
                    $db =json_encode($file,JSON_FORCE_OBJECT);
                }
            if(!$registered){
                $filename = 'database.txt';
                $fp = fopen($filename, 'w');
                fwrite($fp, $db);
                fclose($fp);
                $fp= fopen('./user-documents/'.$id.'.txt', 'w');
                //$file = file_get_contents('./user-documents/'.$id.'.txt');
                //$file = json_decode($file, true);
                $new = array(
                    'lowestElement' => array(
                        'id' => 'none',
                        'position' => 'none'
                    ),
                    'boards' => array()
                );
                $userDocuments =json_encode($new, JSON_FORCE_OBJECT);
                fwrite($fp, $userDocuments);
                fclose($fp);

                echo 'Registration Done';
            }
            if($registered)echo("Your Email is already Registered!");
        }
        else {echo('Passwords are Not the Same');}
    }
    else {echo('Fields are Empty');}
}?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>signup</title>
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
        <input  id="text" type="password" name="psw"><br><br>
        <div style="font-size: 1em; margin: 0.1vw; color:black">Repeat Password:</div>
        <input  id="text" type="password" name="psw-repeat"><br><br>
        <input id="button" type="submit" value="register"><br><br>
        <span style="font-size: 1em; margin: 0.1vw; color:black">already registered? </span>
        <a href="login.php">login</a>
    </form>

</div>
</body>
</html>