<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

function sendResponse($status, $message, $data = null) {
    http_response_code($status);
    echo json_encode([
        "status" => $status === 200 || $status === 201 ? "success" : "error",
        "message" => $message,
        "data" => $data
    ]);
    exit();
}

switch ($method) {
    case 'GET':
        try {
            if (isset($_GET['id'])) {
                $stmt = $db->prepare("SELECT * FROM jemaat WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($data) { sendResponse(200, "Data ditemukan", $data); } 
                else { sendResponse(404, "Data tidak ditemukan"); }
            } else {
                $query = "SELECT * FROM jemaat ORDER BY nama_lengkap ASC";
                $stmt = $db->query($query);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                sendResponse(200, "Berhasil mengambil data", $data);
            }
        } catch (Exception $e) { sendResponse(500, "Error: " . $e->getMessage()); }
        break;

    case 'POST':
        try {
            $input = json_decode(file_get_contents("php://input"), true);
            if (empty($input['nama_lengkap']) || empty($input['no_kk'])) {
                sendResponse(400, "Nama Lengkap dan No. KK wajib diisi!");
            }

            $sql = "INSERT INTO jemaat (
                        no_kk, nama_lengkap, hubungan_keluarga, tanggal_perkawinan, 
                        tempat_lahir, tanggal_lahir, jenis_kelamin, 
                        status_pernikahan, status_babtis, anggota_jemaat, seksi, alamat, kelompok_doa
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                $input['no_kk'],
                $input['nama_lengkap'],
                $input['hubungan_keluarga'] ?? 'Kepala Keluarga',
                !empty($input['tanggal_perkawinan']) ? $input['tanggal_perkawinan'] : NULL,
                $input['tempat_lahir'] ?? null,
                !empty($input['tanggal_lahir']) ? $input['tanggal_lahir'] : NULL,
                $input['jenis_kelamin'] ?? 'Laki-Laki',
                $input['status_pernikahan'] ?? 'Belum Menikah',
                $input['status_babtis'] ?? 'Belum Babtis',
                $input['anggota_jemaat'] ?? 'Tetap',
                $input['seksi'] ?? 'Perkaria',
                $input['alamat'] ?? null,
                $input['kelompok_doa'] ?? 'Kalvari' // <--- TAMBAHAN KELOMPOK DOA
            ]);
            sendResponse(201, "Data Jemaat Berhasil Ditambahkan!");
        } catch (Exception $e) { sendResponse(500, "Gagal simpan: " . $e->getMessage()); }
        break;

    case 'PUT':
        try {
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;
            if (!$id) { sendResponse(400, "ID diperlukan untuk update"); }

            $sql = "UPDATE jemaat SET 
                        no_kk=?, nama_lengkap=?, hubungan_keluarga=?, tanggal_perkawinan=?, 
                        tempat_lahir=?, tanggal_lahir=?, jenis_kelamin=?, 
                        status_pernikahan=?, status_babtis=?, anggota_jemaat=?, seksi=?, alamat=?, kelompok_doa=?
                    WHERE id=?";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                $input['no_kk'],
                $input['nama_lengkap'],
                $input['hubungan_keluarga'],
                !empty($input['tanggal_perkawinan']) ? $input['tanggal_perkawinan'] : NULL,
                $input['tempat_lahir'],
                !empty($input['tanggal_lahir']) ? $input['tanggal_lahir'] : NULL,
                $input['jenis_kelamin'],
                $input['status_pernikahan'],
                $input['status_babtis'],
                $input['anggota_jemaat'],
                $input['seksi'],
                $input['alamat'] ?? null,
                $input['kelompok_doa'] ?? 'Kalvari', // <--- TAMBAHAN KELOMPOK DOA
                $id
            ]);
            sendResponse(200, "Data Jemaat Berhasil Diupdate!");
        } catch (Exception $e) { sendResponse(500, "Gagal update: " . $e->getMessage()); }
        break;

    case 'DELETE':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) { sendResponse(400, "ID diperlukan"); }
            $stmt = $db->prepare("DELETE FROM jemaat WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(200, "Data berhasil dihapus");
        } catch (Exception $e) { sendResponse(500, "Gagal hapus: " . $e->getMessage()); }
        break;
        
    default:
        sendResponse(405, "Method not allowed");
        break;
}
?>