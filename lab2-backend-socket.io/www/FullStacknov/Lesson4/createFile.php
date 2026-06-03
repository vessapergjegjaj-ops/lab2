<?php
    $file = fopen("example.txt", "w");
    if($file){
        echo "File u krijua me sukses";
        fclose($file);
    }else{
        echo "File nuk u krijua";
    }
    
?>


