<?php
// apply_migration.php
require_once 'backend/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $sql = file_get_contents('database_update_v3.sql');
    
    if (!$sql) {
        die("Error: Could not read database_update_v3.sql");
    }
    
    // Split by semicolon in case of multiple statements, but strictly for basic execution
    // Simple execution for this file structure
    $db->exec($sql);
    
    echo "Migration successful: database_update_v3.sql applied.";
} catch(PDOException $e) {
    echo "Migration failed: " . $e->getMessage();
}
?>
