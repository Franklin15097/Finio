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

// Get last 6 months data
$query = "SELECT 
            DATE_FORMAT(transaction_date, '%Y-%m') as month, 
            SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income, 
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense 
          FROM transactions 
          WHERE user_id = :user_id 
          AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) 
          GROUP BY month 
          ORDER BY month ASC";

$stmt = $db->prepare($query);
$stmt->bindParam(':user_id', $user_id);
$stmt->execute();

$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

$labels = [];
$income_data = [];
$expense_data = [];

foreach ($results as $row) {
    $dateObj = DateTime::createFromFormat('!Y-m', $row['month']);
    $labels[] = $dateObj->format('M Y');
    $income_data[] = $row['income'];
    $expense_data[] = $row['expense'];
}

echo json_encode([
    'labels' => $labels,
    'income' => $income_data,
    'expense' => $expense_data
]);
