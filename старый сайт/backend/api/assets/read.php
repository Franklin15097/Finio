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

$query = "SELECT * FROM assets WHERE user_id = :user_id ORDER BY balance DESC";
$stmt = $db->prepare($query);
$stmt->bindParam(':user_id', $user_id);
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
