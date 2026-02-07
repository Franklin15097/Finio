<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

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

$query = "SELECT SUM(amount) as total_income FROM transactions WHERE user_id = :user_id AND type = 'income'";
$stmt = $db->prepare($query);
$stmt->bindParam(':user_id', $user_id);
$stmt->execute();

$row = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode(['total_income' => $row['total_income'] ?? 0]);
