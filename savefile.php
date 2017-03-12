<?PHP

header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Headers: cache-control, x-requested-with') ;
header("Access-Control-Allow-Methods: *");

$uploaddir = "uploads/";
$uploadfile = $uploaddir . basename($_FILES['fileToUpload']['name']);

if(isset( $_FILES['fileToUpload'] )){

 $file_name = $_FILES['fileToUpload']['name'];
 $file_tmp = $_FILES['fileToUpload']['tmp_name'];

 $uploaded = move_uploaded_file($file_tmp, $uploaddir . $file_name);
 echo 'success';
}else{
 echo 'error';
}

?>