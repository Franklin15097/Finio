<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/database.php';
require_once '../../lib/Database.php';
require_once '../../lib/Validator.php';

$database = Database::getInstance();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['full_name']) && !empty($data['email']) && !empty($data['password'])) {
    
    // Sanitize
    $email = Validator::sanitize(['email' => $data['email']])['email'];
    $full_name = Validator::sanitize(['full_name' => $data['full_name']])['full_name'];
    $password = $data['password'];

    // Validate
    if (!Validator::validateEmail($email)) {
        http_response_code(400);
        echo json_encode(["error" => "Некорректный формат email"]);
        exit;
    }

    if (!Validator::validatePassword($password)) {
        http_response_code(400);
        echo json_encode(["error" => "Пароль должен быть не менее 8 символов и содержать буквы и цифры"]);
        exit;
    }

    // Check if email exists
    $check_query = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($check_query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["error" => "Email уже зарегистрирован"]);
        exit;
    }

    // Create User
    $query = "INSERT INTO users (full_name, email, password_hash) VALUES (:full_name, :email, :password_hash)";
    $stmt = $db->prepare($query);

    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt->bindParam(':full_name', $full_name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password_hash', $password_hash);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Пользователь успешно создан"]);
    } else {
        http_response_code(503);
        echo json_encode(["error" => "Не удалось создать пользователя"]);
    }

} else {
    http_response_code(400);
    echo json_encode(["error" => "Неполные данные"]);
}
