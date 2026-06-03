<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <form action="" method="get">
        <input type="text" name="input1">
        <input type="submit" value="Submit GET">
</form>
<?php 
 if(isset($_GET['input'])){
    echo $inputValue

 }
 ?>
 <form action="" method="post">
        <input type="text" name="input2">
        <button name="postBtn" type="submit">Submit POST</button>
</form>
<?php 
 if(isset($_POST['postBtn'])){
    $input2 =$_POST['input2'];
    echo  "$input2";
 }
 ?>
 <hr>
 <form action="" method="post">
   <input type="text" name="nr">
   <button type="submit" name="ciftTekBtn">Cift Tek
    Btn</button>
    </form>
<?php
   if(isset($_POST['ciftTekBtn'])){
         $number = $_POST['nr'];
            cifTek($number);
   }
   ?>
</body>
</html>