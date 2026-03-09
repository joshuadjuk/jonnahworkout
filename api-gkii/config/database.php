<?php
// config/database.php

// 1. Izinkan React mengakses API ini (CORS Policy)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. Tangani Request Preflight (Penting untuk method POST/PUT/DELETE dari React)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. Konfigurasi Database
$host = "localhost";
$db_name = "gkiilongloreh";
$username = "root";     // Default XAMPP/Laragon
$password = "";         // Default XAMPP biasanya kosong, MAMP biasanya "root"

try {
    // Menggunakan PDO agar lebih aman dari SQL Injection
    $db = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    
    // Set mode error agar muncul notifikasi jika query salah
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Opsi: Uncomment baris bawah ini untuk tes koneksi di browser, lalu comment lagi
    // echo json_encode(["message" => "Koneksi ke database gkiilongloreh berhasil!"]);

} catch(PDOException $e) {
    // Jika gagal, kirim pesan error dalam format JSON
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Koneksi Database Gagal: " . $e->getMessage()
    ]);
    exit();
}
?>