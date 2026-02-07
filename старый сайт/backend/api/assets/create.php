<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/database.php';
require_once '../../config/security.php';
require_once '../../lib/Database.php';
require_once '../../lib/Auth.php';
require_once '../../lib/Validator.php';

$user_id = Auth::getUserIdFromHeader();
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$database = Database::getInstance();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['name'])) {
    $data = Validator::sanitize($data);
    
    $query = "INSERT INTO assets (user_id, name, balance, type) VALUES (:user_id, :name, :balance, :type)";
    $stmt = $db->prepare($query);

    $balance = !empty($data['balance']) ? $data['balance'] : 0.00;
    $type = !empty($data['type']) ? $data['type'] : 'card';

    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':balance', $balance);
    $stmt->bindParam(':type', $type);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Актив создан"]);
    } else {
        http_response_code(503);
        echo json_encode(["error" => "Ошибка создания"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Не указано название"]);
}
