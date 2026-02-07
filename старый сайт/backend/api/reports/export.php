<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/csv; charset=UTF-8");
header("Content-Disposition: attachment; filename=transactions_export.csv");

require_once '../../config/database.php';
require_once '../../config/security.php';
require_once '../../lib/Database.php';
require_once '../../lib/Auth.php';
require_once '../../lib/Validator.php';

// Auth via Token in URL for simplicity in file download (or check Cookie/Header if using fetch blob)
// Since this is a direct link usually, we might need a token in GET param 'token'
$token = $_GET['token'] ?? '';
$auth = new Auth();
$user_id = $auth->validateToken($token);

if (!$user_id) {
    http_response_code(401);
    echo "Unauthorized";
    exit;
}

$database = Database::getInstance();
$db = $database->getConnection();

$where = ["t.user_id = :user_id"];
$params = [':user_id' => $user_id];

// Re-use logic for filters if passed
if (!empty($_GET['category_id'])) {
    $where[] = "t.category_id = :category_id";
    $params[':category_id'] = $_GET['category_id'];
}
if (!empty($_GET['date_from']) && !empty($_GET['date_to'])) {
    $where[] = "t.transaction_date BETWEEN :date_from AND :date_to";
    $params[':date_from'] = $_GET['date_from'];
    $params[':date_to'] = $_GET['date_to'];
}

$whereSQL = implode(" AND ", $where);

$query = "SELECT t.transaction_date, t.title, t.type, t.amount, c.name as category_name, t.description 
          FROM transactions t 
          LEFT JOIN categories c ON t.category_id = c.id 
          WHERE $whereSQL 
          ORDER BY t.transaction_date DESC";

$stmt = $db->prepare($query);
foreach ($params as $key => $val) {
    $stmt->bindValue($key, $val);
}
$stmt->execute();

$output = fopen('php://output', 'w');

// BOM for Excel
fputs($output, "\xEF\xBB\xBF");

// Header
fputcsv($output, ['Дата', 'Название', 'Тип', 'Сумма', 'Категория', 'Описание']);

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    fputcsv($output, [
        $row['transaction_date'],
        $row['title'],
        $row['type'] === 'income' ? 'Доход' : 'Расход',
        $row['amount'],
        $row['category_name'] ?? 'Без категории',
        $row['description']
    ]);
}

fclose($output);
