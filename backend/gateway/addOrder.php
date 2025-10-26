<?php
require_once 'api.php';
require_once 'db.php';
require_once 'log.php';

try {
    // Verifica che la richiesta sia POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Log::warning('addOrders.php - Metodo non consentito: ' . $_SERVER['REQUEST_METHOD']);
        Api::responseJson(405, [
            'success' => false,
            'error' => 'Method not allowed. Use POST method.'
        ]);
    }
    
    // Legge il raw input del POST
    $rawInput = file_get_contents('php://input');
    Log::info('addOrders.php - Raw input ricevuto: ' . $rawInput);
    
    // Parsing dei dati POST
    $postData = [];
    $postData = json_decode(file_get_contents('php://input'), true);
    
    // Determina il Content-Type
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    
    // Log dei dati POST parsati
    Log::info('addOrders.php - Dati POST parsati: ' . json_encode($postData));
    
    // Connessione al database usando la classe DB
    $pdo = DB::getConnection();
    
    // Recupera i parametri POST dai dati parsati
    $id_customer = isset($postData['id_customer']) ? trim($postData['id_customer']) : '';
    $date = isset($postData['date']) ? trim($postData['date']) : '';
    $total_amount = isset($postData['total_amount']) ? trim($postData['total_amount']) : '';
    
    Log::info('addOrders.php - Parametri estratti - id_customer: ' . $id_customer . ', date: ' . $date . ', total_amount: ' . $total_amount);
    
    // Validazioni: campi obbligatori
    if (empty($id_customer)) {
        Log::warning('addOrders.php - ID cliente mancante');
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter id_customer is required'
        ]);
    }
    
    if (empty($date)) {
        Log::warning('addOrders.php - Data ordine mancante');
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter date is required'
        ]);
    }
    
    if (empty($total_amount)) {
        Log::warning('addOrders.php - Importo totale mancante');
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter total_amount is required'
        ]);
    }
    
    // Converte id_customer in numero
    $id_customer_num = intval($id_customer);
    if ($id_customer_num <= 0) {
        Log::warning('addOrders.php - ID cliente non valido: ' . $id_customer);
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter id_customer must be a positive number'
        ]);
    }
    
    // Verifica che il cliente esista
    $checkCustomerSql = "SELECT COUNT(*) FROM customers WHERE id = :id_customer";
    $checkCustomerStmt = $pdo->prepare($checkCustomerSql);
    $checkCustomerStmt->execute([':id_customer' => $id_customer_num]);
    $customerExists = $checkCustomerStmt->fetchColumn();
    
    if (!$customerExists) {
        Log::warning('addOrders.php - Cliente non trovato con ID: ' . $id_customer_num);
        Api::responseJson(404, [
            'success' => false,
            'error' => 'Customer not found'
        ]);
    }
    
    // Validazione formato data (assumendo formato ISO 8601: 2025-10-26T00:00:00.000Z)
    $dateObj = DateTime::createFromFormat('Y-m-d\TH:i:s.u\Z', $date);
    if (!$dateObj) {
        // Prova anche il formato senza millisecondi: 2025-10-26T00:00:00Z
        $dateObj = DateTime::createFromFormat('Y-m-d\TH:i:s\Z', $date);
    }
    if (!$dateObj) {
        // Prova anche il formato semplice YYYY-MM-DD come fallback
        $dateObj = DateTime::createFromFormat('Y-m-d', $date);
    }
    
    if (!$dateObj) {
        Log::warning('addOrder.php - Formato data non valido: ' . $date);
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Invalid date format. Use ISO 8601 format (2025-10-26T00:00:00.000Z) or YYYY-MM-DD'
        ]);
    }
    
    // Converte la data nel formato per il database (YYYY-MM-DD)
    $dbDate = $dateObj->format('Y-m-d');
    
    // Validazione importo (deve essere numerico)
    if (!is_numeric($total_amount) || floatval($total_amount) < 0) {
        Log::warning('addOrders.php - Importo non valido: ' . $total_amount);
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter total_amount must be a valid positive number'
        ]);
    }
    
    // Costruisce e esegue la query di inserimento
    $sql = "INSERT INTO orders (id_customer, date, total_amount, id_status) VALUES (:id_customer, :date, :total_amount, 1)";
    $params = [
        ':id_customer' => $id_customer_num,
        ':date' => $dbDate,
        ':total_amount' => floatval($total_amount)
    ];
    
    Log::info('addOrders.php - Esecuzione query: ' . $sql);
    Log::info('addOrders.php - Parametri query: ' . json_encode($params));
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($params);
    
    // Verifica se l'inserimento ha avuto successo
    if ($result) {
        // Ottiene l'ID del record appena inserito
        $newOrderId = $pdo->lastInsertId();
        
        // Recupera i dati del nuovo ordine
        $selectSql = "SELECT * FROM orders WHERE id = :id";
        $selectStmt = $pdo->prepare($selectSql);
        $selectStmt->execute([':id' => $newOrderId]);
        $newOrder = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        Log::info('addOrders.php - Ordine creato con successo. ID: ' . $newOrderId . ', Cliente: ' . $id_customer_num);
        
        // Risposta HTTP 201 (Created) con i dati del nuovo ordine
        Api::responseJson(201, [
            'success' => true,
            'message' => 'Order created successfully',
            'data' => $newOrder,
            'id' => $newOrderId
        ]);
    } else {
        Log::error('addOrders.php - Errore durante l\'inserimento dell\'ordine');
        Api::responseJson(500, [
            'success' => false,
            'error' => 'Failed to create order'
        ]);
    }
    
} catch (PDOException $e) {
    // Log dell'errore database
    Log::error('addOrders.php - Errore database: ' . $e->getMessage());
    
    // Errore di connessione al database
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Log dell'errore generico
    Log::error('addOrders.php - Errore server: ' . $e->getMessage());
    
    // Altri errori
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>