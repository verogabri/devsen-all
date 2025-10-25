<?php

/**
 * Script di test per l'API Gateway
 * Questo script dimostra come utilizzare l'API per leggere dati da tabelle MySQL
 */

require_once __DIR__ . '/vendor/autoload.php';

// URL base dell'API (modifica secondo la tua configurazione)
$baseUrl = 'http://localhost/DEVSEN/backend/gateway/api.php';

function testApi(string $endpoint, string $description): void {
    echo "\n=== {$description} ===\n";
    echo "GET {$endpoint}\n";
    
    $response = file_get_contents($endpoint);
    if ($response === false) {
        echo "❌ Errore nella richiesta\n";
        return;
    }
    
    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "❌ Errore nel parsing JSON: " . json_last_error_msg() . "\n";
        return;
    }
    
    echo "✅ Risposta ricevuta:\n";
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
}

echo "🚀 Test API Gateway\n";
echo "==================\n";

// Test 1: Health check
testApi($baseUrl, 'Health Check');

// Test 2: Lettura dati da una tabella (esempio: users)
testApi($baseUrl . '/table/users', 'Lettura tabella users');

// Test 3: Lettura dati con paginazione
testApi($baseUrl . '/table/users?page=1&limit=5', 'Lettura tabella users con paginazione');

// Test 4: Lettura di un record specifico
testApi($baseUrl . '/table/users/1', 'Lettura record specifico (ID=1)');

// Test 5: Tabella inesistente
testApi($baseUrl . '/table/nonexistent', 'Test tabella inesistente');

echo "\n🎯 Test completati!\n";
echo "\nPer utilizzare l'API:\n";
echo "- Health check: GET /api\n";
echo "- Leggi tabella: GET /api/table/{nome_tabella}\n";
echo "- Leggi record: GET /api/table/{nome_tabella}/{id}\n";
echo "- Paginazione: GET /api/table/{nome_tabella}?page=1&limit=10\n";