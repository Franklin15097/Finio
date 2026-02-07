<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

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
    $query = "DELETE FROM assets WHERE id = :id AND user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':user_id', $user_id);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Актив удален"]);
    } else {
        http_response_code(503);
        echo json_encode(["error" => "Ошибка удаления"]);
    }
}
