<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
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

// Calculate totals for current month (implicit requirement usually, or all time? 
// Spec says "Block 1: General statistics for the month".
// Let's filter by current month.

$start_date = date('Y-m-01');
$end_date = date('Y-m-t');

$query = "SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
          FROM transactions 
          WHERE user_id = :user_id 
          AND transaction_date BETWEEN :start_date AND :end_date";

$stmt = $db->prepare($query);
$stmt->bindParam(':user_id', $user_id);
$stmt->bindParam(':start_date', $start_date);
$stmt->bindParam(':end_date', $end_date);
$stmt->execute();

$row = $stmt->fetch(PDO::FETCH_ASSOC);

$income = $row['income'] ?? 0;
$expense = $row['expense'] ?? 0;
$balance = $income - $expense; // Simplified balance calculation (Income - Expense for this month). 
// Note: Real balance should probably be all-time, but spec says "Stats for month". 
// Usually Balance is total asset. I will calculate Balance as ALL TIME income - ALL TIME expense, 
// but Income/Expense only for this month. 

// Let's get all time balance separately
$queryBalance = "SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_balance
          FROM transactions 
          WHERE user_id = :user_id";
$stmtB = $db->prepare($queryBalance);
$stmtB->bindParam(':user_id', $user_id);
$stmtB->execute();
$rowB = $stmtB->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    'income' => $income,
    'expense' => $expense,
    'balance' => $rowB['total_balance'] ?? 0
]);
