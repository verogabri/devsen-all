<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use DevSen\Gateway\DatabaseConnection;
use DevSen\Gateway\ApiController;
use Dotenv\Dotenv;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\RotatingFileHandler;
use Symfony\Component\HttpFoundation\Request;

try {
    // Carica le variabili d'ambiente
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Configurazione database
    $dbConfig = [
        'DB_HOST' => $_ENV['DB_HOST'] ?? 'localhost',
        'DB_PORT' => (int)($_ENV['DB_PORT'] ?? 3306),
        'DB_NAME' => $_ENV['DB_NAME'] ?? '',
        'DB_USERNAME' => $_ENV['DB_USERNAME'] ?? '',
        'DB_PASSWORD' => $_ENV['DB_PASSWORD'] ?? '',
        'DB_CHARSET' => $_ENV['DB_CHARSET'] ?? 'utf8mb4'
    ];

    // Configurazione logging
    $logger = new Logger('gateway-api');
    
    // Log su file rotante
    $logHandler = new RotatingFileHandler(
        __DIR__ . '/logs/api.log',
        0, // Mantieni tutti i file
        Logger::INFO
    );
    $logger->pushHandler($logHandler);

    // In modalità debug, log anche su console
    if (($_ENV['API_DEBUG'] ?? 'false') === 'true') {
        $logger->pushHandler(new StreamHandler('php://stdout', Logger::DEBUG));
    }

    // Inizializza connessione database
    DatabaseConnection::setConfig($dbConfig);
    DatabaseConnection::setLogger($logger);
    $db = DatabaseConnection::getInstance();

    // Crea controller API
    $apiController = new ApiController(
        $db, 
        $logger, 
        ($_ENV['API_DEBUG'] ?? 'false') === 'true'
    );

    // Gestisce la richiesta
    $request = Request::createFromGlobals();
    
    // Imposta headers CORS per API REST
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    // Gestisce preflight OPTIONS
    if ($request->getMethod() === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    // Processa la richiesta e invia la risposta
    $response = $apiController->handleRequest($request);
    $response->send();

} catch (\Exception $e) {
    // Fallback error handling
    http_response_code(500);
    
    $errorResponse = [
        'success' => false,
        'error' => 'Server configuration error',
        'timestamp' => date('c')
    ];

    // In debug mode, mostra l'errore completo
    if (($_ENV['API_DEBUG'] ?? 'false') === 'true') {
        $errorResponse['debug'] = [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ];
    }

    echo json_encode($errorResponse, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    // Log dell'errore se possibile
    if (isset($logger)) {
        $logger->emergency('Fatal error: ' . $e->getMessage());
    }
}