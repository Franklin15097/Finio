<?php

class Auth {
    private $secret_key;
    private $algo;

    public function __construct() {
        $config = require __DIR__ . '/../config/security.php';
        $this->secret_key = $config['jwt_secret'];
        $this->algo = $config['jwt_algo'];
    }

    public function generateToken($user_id) {
        $header = json_encode(['typ' => 'JWT', 'alg' => $this->algo]);
        $payload = json_encode([
            'user_id' => $user_id,
            'iat' => time(),
            'exp' => time() + (3600 * 24) // 24 hours
        ]);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret_key, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public function validateToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        $header = $parts[0];
        $payload = $parts[1];
        $signature_provided = $parts[2];

        $signature = hash_hmac('sha256', $header . "." . $payload, $this->secret_key, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        if (!hash_equals($base64UrlSignature, $signature_provided)) {
            return false;
        }

        $payload_data = json_decode($this->base64UrlDecode($payload), true);
        if ($payload_data['exp'] < time()) {
            return false;
        }

        return $payload_data['user_id'];
    }

    public static function getUserIdFromHeader() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $auth = new self();
            return $auth->validateToken($matches[1]);
        }
        return false;
    }

    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
