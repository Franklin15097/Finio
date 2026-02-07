<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
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

$where = ["t.user_id = :user_id"];
$params = [':user_id' => $user_id];

// Search
if (!empty($_GET['search'])) {
    $search = "%" . Validator::sanitize(['s' => $_GET['search']])['s'] . "%";
    $where[] = "(t.title LIKE :search OR t.description LIKE :search)";
    $params[':search'] = $search;
}

// Category
if (!empty($_GET['category_id'])) {
    $where[] = "t.category_id = :category_id";
    $params[':category_id'] = $_GET['category_id'];
}

// Date
if (!empty($_GET['date'])) {
    $where[] = "t.transaction_date = :date";
    $params[':date'] = $_GET['date'];
} elseif (!empty($_GET['date_from']) && !empty($_GET['date_to'])) {
    // Optional range
    $where[] = "t.transaction_date BETWEEN :date_from AND :date_to";
    $params[':date_from'] = $_GET['date_from'];
    $params[':date_to'] = $_GET['date_to'];
}

$whereSQL = implode(" AND ", $where);

$query = "SELECT t.*, c.name as category_name 
          FROM transactions t 
          LEFT JOIN categories c ON t.category_id = c.id 
          WHERE $whereSQL 
          ORDER BY t.transaction_date DESC, t.id DESC
          LIMIT 50";

$stmt = $db->prepare($query);

foreach ($params as $key => $val) {
    $stmt->bindValue($key, $val);
}

$stmt->execute();

$transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($transactions);
