<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/database.php';
require_once '../../config/security.php';
require_once '../../lib/Database.php';
require_once '../../lib/Auth.php';

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
    
    $query = "DELETE FROM transactions WHERE id = :id AND user_id = :user_id";
    $stmt = $db->prepare($query);

    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':user_id', $user_id);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(["message" => "Транзакция удалена"]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Транзакция не найдена"]);
        }
    } else {
        http_response_code(503);
        echo json_encode(["error" => "Ошибка удаления"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Не указан ID"]);
}
