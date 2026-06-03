<?php
$str = "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quasi, atque?";

echo "Stringu $str ka " . strlen($str) . " karaktere <br>";
echo "Stringu $str ka " . str_word_count($str) . " fjale <br>";

echo strtolower("LOREM IPSUM DOLOR SIT AMET, eLiT") . "<br>";
echo strtoupper("Lorem ipsum doLor Sit amEt") . "<br>";

echo "<p>Test
test
test</p>";

echo "<pre>Test
test
test</pre>";

$str1 = "Line 1
Line 2
Line 3
Line 4";

echo nl2br($str1);
echo "<br>";

$str2 = "Line1\nLine2\nLine3\n";
echo nl2br($str2);




  
 
 