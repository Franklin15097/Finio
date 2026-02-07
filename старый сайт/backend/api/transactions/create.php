<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

if (!empty($data['amount']) && !empty($data['title']) && !empty($data['type'])) {
    
    $query = "INSERT INTO transactions 
              (user_id, type, amount, category_id, title, description, transaction_date) 
              VALUES (:user_id, :type, :amount, :category_id, :title, :description, :transaction_date)";
    
    $stmt = $db->prepare($query);

    // Sanitize
    $data = Validator::sanitize($data);

    $category_id = !empty($data['category_id']) ? $data['category_id'] : null;
    $date = !empty($data['transaction_date']) ? $data['transaction_date'] : date('Y-m-d');
    $desc = !empty($data['description']) ? $data['description'] : '';

    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':type', $data['type']);
    $stmt->bindParam(':amount', $data['amount']);
    $stmt->bindParam(':category_id', $category_id);
    $stmt->bindParam(':title', $data['title']);
    $stmt->bindParam(':description', $desc);
    $stmt->bindParam(':transaction_date', $date);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Транзакция создана"]);
    } else {
        http_response_code(503);
        echo json_encode(["error" => "Ошибка при создании"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Неполные данные"]);
}
