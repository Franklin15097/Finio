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

// Group expenses by category
// Join with categories table to get names
// If category_id is null, group as 'Uncategorized'

$query = "SELECT 
            COALESCE(c.name, 'Без категории') as category_name, 
            SUM(t.amount) as total 
          FROM transactions t 
          LEFT JOIN categories c ON t.category_id = c.id 
          WHERE t.user_id = :user_id 
          AND t.type = 'expense' 
          GROUP BY t.category_id 
          ORDER BY total DESC";

$stmt = $db->prepare($query);
$stmt->bindParam(':user_id', $user_id);
$stmt->execute();

$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

$labels = [];
$values = [];

foreach ($results as $row) {
    $labels[] = $row['category_name'];
    $values[] = $row['total'];
}

echo json_encode([
    'labels' => $labels,
    'values' => $values
]);
