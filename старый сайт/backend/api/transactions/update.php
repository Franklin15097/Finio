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

if (!empty($data['id']) && !empty($data['amount']) && !empty($data['title'])) {
    
    $query = "UPDATE transactions 
              SET type = :type, amount = :amount, category_id = :category_id, 
                  title = :title, description = :description, transaction_date = :transaction_date 
              WHERE id = :id AND user_id = :user_id";
    
    $stmt = $db->prepare($query);

    // Sanitize
    $data = Validator::sanitize($data);

    $category_id = !empty($data['category_id']) ? $data['category_id'] : null;
    $date = !empty($data['transaction_date']) ? $data['transaction_date'] : date('Y-m-d');
    $desc = !empty($data['description']) ? $data['description'] : '';

    $stmt->bindParam(':type', $data['type']);
    $stmt->bindParam(':amount', $data['amount']);
    $stmt->bindParam(':category_id', $category_id);
    $stmt->bindParam(':title', $data['title']);
    $stmt->bindParam(':description', $desc);
    $stmt->bindParam(':transaction_date', $date);
    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':user_id', $user_id);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(["message" => "Транзакция обновлена"]);
        } else {
            // Could mean no changes were made or ID not found
            // Let's assume success if no error, but checking if it existed is better.
            // For simplicity, returning success message or 'No changes'
            echo json_encode(["message" => "Транзакция обновлена (или нет изменений)"]);
        }
    } else {
        http_response_code(503);
        echo json_encode(["error" => "Ошибка при обновлении"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Неполные данные"]);
}
