<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Wrap everything in try-catch to ensure we always return valid JSON
try {
    require_once '../../lib/Database.php';
    require_once '../../lib/Auth.php';

    // Get user ID from auth token
    $user_id = Auth::getUserIdFromHeader();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }

    $database = Database::getInstance();
    $db = $database->getConnection();

    $method = $_SERVER['REQUEST_METHOD'];

    // Auto-migration: Ensure table exists
    $createTableSql = "CREATE TABLE IF NOT EXISTS recurring_expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    try {
        $db->exec($createTableSql);
    } catch (Exception $e) {
        // Table might already exist or FK constraint issue - continue
    }

    if ($method === 'GET') {
        // Read Recurring Expenses
        $query = "SELECT * FROM recurring_expenses WHERE user_id = :user_id ORDER BY amount DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($items);

    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));

        if (isset($data->action) && $data->action === 'delete') {
            // DELETE
            if (!isset($data->id)) {
                http_response_code(400);
                echo json_encode(["error" => "No ID provided"]);
                exit;
            }
            $query = "DELETE FROM recurring_expenses WHERE id = :id AND user_id = :user_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $data->id);
            $stmt->bindParam(":user_id", $user_id);
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "Item deleted"]);
            } else {
                http_response_code(503);
                echo json_encode(["error" => "Unable to delete item"]);
            }
        } elseif (isset($data->id) && !empty($data->id)) {
            // UPDATE
            if (empty($data->title) || !isset($data->amount)) {
                http_response_code(400);
                echo json_encode(["error" => "Incomplete data"]);
                exit;
            }

            $query = "UPDATE recurring_expenses SET title = :title, amount = :amount WHERE id = :id AND user_id = :user_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":title", $data->title);
            $stmt->bindParam(":amount", $data->amount);
            $stmt->bindParam(":id", $data->id);
            $stmt->bindParam(":user_id", $user_id);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "Item updated"]);
            } else {
                http_response_code(503);
                echo json_encode(["error" => "Unable to update item"]);
            }
        } else {
            // CREATE
            if (empty($data->title) || !isset($data->amount)) {
                http_response_code(400);
                echo json_encode(["error" => "Incomplete data"]);
                exit;
            }

            $query = "INSERT INTO recurring_expenses (user_id, title, amount) VALUES (:user_id, :title, :amount)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":title", $data->title);
            $stmt->bindParam(":amount", $data->amount);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["message" => "Created"]);
            } else {
                http_response_code(503);
                $errorInfo = $stmt->errorInfo();
                echo json_encode([
                    "error" => "Unable to create",
                    "details" => $errorInfo[2] ?? "Unknown SQL error"
                ]);
            }
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Server error",
        "details" => $e->getMessage()
    ]);
}
?>
