<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

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

$method = $_SERVER['REQUEST_METHOD'];

// Handle GET (Read)
if ($method === 'GET') {
    // Join with assets to get asset name
    $query = "SELECT r.*, a.name as asset_name 
              FROM savings_rules r 
              JOIN assets a ON r.asset_id = a.id 
              WHERE r.user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Handle POST (Create/Update/Delete)
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'POST') {
    if (isset($data['action']) && $data['action'] === 'delete') {
        // DELETE
        if (!empty($data['id'])) {
            $query = "DELETE FROM savings_rules WHERE id = :id AND user_id = :user_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data['id']);
            $stmt->bindParam(':user_id', $user_id);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Правило удалено"]);
            } else {
                http_response_code(503);
                echo json_encode(["error" => "Ошибка удаления"]);
            }
        }
    } else {
        // CREATE / UPDATE
        if (!empty($data['asset_id']) && isset($data['percentage'])) {
            
            if (!empty($data['id'])) {
                // UPDATE
                $query = "UPDATE savings_rules SET asset_id = :asset_id, percentage = :percentage WHERE id = :id AND user_id = :user_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $data['id']);
            } else {
                // CREATE
                $query = "INSERT INTO savings_rules (user_id, asset_id, percentage) VALUES (:user_id, :asset_id, :percentage)";
                $stmt = $db->prepare($query);
            }

            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':asset_id', $data['asset_id']);
            $stmt->bindParam(':percentage', $data['percentage']);

            if ($stmt->execute()) {
                echo json_encode(["message" => "Правило сохранено"]);
            } else {
                http_response_code(503);
                echo json_encode(["error" => "Ошибка сохранения"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Неполные данные"]);
        }
    }
}
