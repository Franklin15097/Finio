<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/database.php';
require_once '../../config/security.php';
require_once '../../lib/Database.php';
require_once '../../lib/Auth.php';
require_once '../../lib/Validator.php';

$database = Database::getInstance();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['email']) && !empty($data['password'])) {
    $email = $data['email'];
    $password = $data['password'];

    $query = "SELECT id, full_name, password_hash FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (password_verify($password, $row['password_hash'])) {
            $auth = new Auth();
            $token = $auth->generateToken($row['id']);

            http_response_code(200);
            echo json_encode([
                "message" => "Успешный вход",
                "token" => $token,
                "user" => [
                    "id" => $row['id'],
                    "name" => $row['full_name'],
                    "email" => $email
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Неверный пароль"]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Пользователь не найден"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Неполные данные"]);
}
