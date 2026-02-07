<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>PHP Working!</h1>";
echo "<p>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p>Current Script: " . __FILE__ . "</p>";

$db_config = 'backend/config/database.php';
if (file_exists($db_config)) {
    echo "<p style='color:green'>Database config found at $db_config</p>";
    $config = require $db_config;
    echo "<pre>";
    print_r($config);
    echo "</pre>";
    
    // Test Connection
    try {
        $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";
        $pdo = new PDO($dsn, $config['username'], $config['password']);
        echo "<p style='color:green'>Database Connection SUCCESS!</p>";
    } catch (PDOException $e) {
        echo "<p style='color:red'>Database Connection FAILED: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p style='color:red'>Database config NOT found at $db_config</p>";
    echo "<p>Current directory content:</p><pre>";
    print_r(scandir('.'));
    echo "</pre>";
}
?>
