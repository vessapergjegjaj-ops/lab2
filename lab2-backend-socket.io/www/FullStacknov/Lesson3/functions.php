<?php

   function cifTek($number){
       if(is_numeric($number)){
           if($number % 2 == 0){
                echo "<p>$number eshte cif</p>";
        }else{
            echo "<p>$number eshte tek</p>";
        }
       }else{
      echo "<p>$number nuk eshte numer</p>";
   }

   }
    