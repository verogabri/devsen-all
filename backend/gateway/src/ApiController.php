<?php

namespace DevSen\Gateway;

use PDO;
use PDOException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Monolog\Logger;

class ApiController
{
    private PDO $db;
    private Logger $logger;
    private bool $debug;

    public function __construct(PDO $db, Logger $logger, bool $debug = false)
    {
        $this->db = $db;
        $this->logger = $logger;
        $this->debug = $debug;
    }

    public function handleRequest(Request $request): JsonResponse
    {
        try {
            $method = $request->getMethod();
            $path = trim($request->getPathInfo(), '/');
            
            $this->logger->info("API Request: {$method} /{$path}");

            // Route per leggere dati da una tabella
            // GET /table/{tableName} - legge tutti i record
            // GET /table/{tableName}/{id} - legge un record specifico
            if (preg_match('/^table\/([a-zA-Z_][a-zA-Z0-9_]*)(?:\/(\d+))?$/', $path, $matches)) {
                if ($method === 'GET') {
                    $tableName = $matches[1];
                    $id = $matches[2] ?? null;
                    
                    return $this->getTableData($tableName, $id);
                }
            }

            // Route di default per test
            if ($path === '' || $path === 'health') {
                return $this->healthCheck();
            }

            return $this->errorResponse('Endpoint not found', 404);

        } catch (\Exception $e) {
            $this->logger->error('API Error: ' . $e->getMessage());
            
            $message = $this->debug ? $e->getMessage() : 'Internal server error';
            return $this->errorResponse($message, 500);
        }
    }

    private function getTableData(string $tableName, ?string $id = null): JsonResponse
    {
        try {
            // Validazione nome tabella per prevenire SQL injection
            if (!$this->isValidTableName($tableName)) {
                return $this->errorResponse('Invalid table name', 400);
            }

            // Verifica che la tabella esista
            if (!$this->tableExists($tableName)) {
                return $this->errorResponse('Table not found', 404);
            }

            if ($id !== null) {
                // Leggi un record specifico
                $sql = "SELECT * FROM `{$tableName}` WHERE id = :id LIMIT 1";
                $stmt = $this->db->prepare($sql);
                $stmt->bindParam(':id', $id, PDO::PARAM_INT);
                $stmt->execute();
                
                $data = $stmt->fetch();
                
                if (!$data) {
                    return $this->errorResponse('Record not found', 404);
                }
                
                $this->logger->info("Retrieved record {$id} from table {$tableName}");
                
                return new JsonResponse([
                    'success' => true,
                    'data' => $data,
                    'table' => $tableName,
                    'timestamp' => date('c')
                ], 200);
            } else {
                // Leggi tutti i record con paginazione
                $page = max(1, (int)($_GET['page'] ?? 1));
                $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
                $offset = ($page - 1) * $limit;

                // Count totale
                $countSql = "SELECT COUNT(*) as total FROM `{$tableName}`";
                $countStmt = $this->db->prepare($countSql);
                $countStmt->execute();
                $total = (int)$countStmt->fetch()['total'];

                // Dati con limit
                $sql = "SELECT * FROM `{$tableName}` LIMIT :limit OFFSET :offset";
                $stmt = $this->db->prepare($sql);
                $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
                
                $data = $stmt->fetchAll();
                
                $this->logger->info("Retrieved {$limit} records from table {$tableName} (page {$page})");
                
                return new JsonResponse([
                    'success' => true,
                    'data' => $data,
                    'table' => $tableName,
                    'pagination' => [
                        'page' => $page,
                        'limit' => $limit,
                        'total' => $total,
                        'pages' => ceil($total / $limit)
                    ],
                    'timestamp' => date('c')
                ], 200);
            }

        } catch (PDOException $e) {
            $this->logger->error("Database error in getTableData: " . $e->getMessage());
            return $this->errorResponse('Database error', 500);
        }
    }

    private function isValidTableName(string $tableName): bool
    {
        // Permette solo lettere, numeri e underscore, deve iniziare con lettera o underscore
        return preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $tableName) === 1;
    }

    private function tableExists(string $tableName): bool
    {
        try {
            $sql = "SHOW TABLES LIKE :tableName";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':tableName', $tableName);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            $this->logger->error("Error checking table existence: " . $e->getMessage());
            return false;
        }
    }

    private function healthCheck(): JsonResponse
    {
        try {
            // Test connessione database
            $stmt = $this->db->query('SELECT 1');
            $dbStatus = $stmt !== false ? 'connected' : 'error';
        } catch (PDOException $e) {
            $dbStatus = 'error';
        }

        return new JsonResponse([
            'success' => true,
            'status' => 'healthy',
            'database' => $dbStatus,
            'php_version' => PHP_VERSION,
            'timestamp' => date('c')
        ], 200);
    }

    private function errorResponse(string $message, int $code = 400): JsonResponse
    {
        return new JsonResponse([
            'success' => false,
            'error' => $message,
            'code' => $code,
            'timestamp' => date('c')
        ], $code);
    }
}