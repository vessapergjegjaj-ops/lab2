<?php
 
    $file = fopen("example1.php", "x");
    if($file){
        echo "File u krijua me sukses";
        fclose($file);
    }else{
        echo "File nuk u krijua";
    }
     
?>
