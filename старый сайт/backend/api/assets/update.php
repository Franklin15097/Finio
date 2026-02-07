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

if (!empty($data['id'])) {
    $data = Validator::sanitize($data);
    
    $query = "UPDATE assets SET name = :name, balance = :balance, type = :type WHERE id = :id AND user_id = :user_id";
    $stmt = $db->prepare($query);

    $balance = !empty($data['balance']) ? $data['balance'] : 0.00;
    $type = !empty($data['type']) ? $data['type'] : 'card';

    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':balance', $balance);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':user_id', $user_id);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Актив обновлен"]);
    } else {
        http_response_code(503);
        echo json_encode(["error" => "Ошибка обновления"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Не указан ID"]);
}
