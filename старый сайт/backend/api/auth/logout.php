<?php
// Since we are using stateless JWT, the server doesn't "logout" per se, 
// but we can provide this endpoint for semantic consistency or future token blacklisting.
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

http_response_code(200);
echo json_encode(["message" => "Выход выполнен успешно"]);
