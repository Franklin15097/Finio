<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

try {
    require_once '../../lib/Database.php';
    require_once '../../lib/Auth.php';

    // Verify User
    $user_id = Auth::getUserIdFromHeader();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }

    $database = Database::getInstance();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->name) || empty($data->type)) {
        http_response_code(400);
        echo json_encode(["error" => "Name and Type are required"]);
        exit;
    }

    // Insert Category
    $query = "INSERT INTO categories (user_id, name, type, color) VALUES (:user_id, :name, :type, '#9CA3AF')";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->bindParam(":name", $data->name);
    $stmt->bindParam(":type", $data->type);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Category created", "id" => $db->lastInsertId()]);
    } else {
        http_response_code(503);
        $errorInfo = $stmt->errorInfo();
        echo json_encode(["error" => "Unable to create category", "details" => $errorInfo[2]]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error", "details" => $e->getMessage()]);
}
?>
