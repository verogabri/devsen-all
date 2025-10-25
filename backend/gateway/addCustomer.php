<?php
require_once 'api.php';
require_once 'db.php';
require_once 'log.php';

error_log(__FILE__ . ' - starting addCustomer.php');

try {
    // Verifica che la richiesta sia POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Log::warning('addCustomer.php - Metodo non consentito: ' . $_SERVER['REQUEST_METHOD']);
        Api::responseJson(405, [
            'success' => false,
            'error' => 'Method not allowed. Use POST method.'
        ]);
    }
    
    // Legge il raw input del POST
    $rawInput = file_get_contents('php://input');
    Log::info('addCustomer.php - Raw input ricevuto: ' . $rawInput);
    
    // Parsing dei dati POST
    $postData = [];
    $postData = json_decode(file_get_contents('php://input'), true);
    
    // Determina il Content-Type
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    
    // Log dei dati POST parsati
    Log::info('addCustomer.php - Dati POST parsati: ' . json_encode($postData));
    
    // Connessione al database usando la classe DB
    $pdo = DB::getConnection();
    
    // Recupera i parametri POST dai dati parsati
    $name = isset($postData['name']) ? trim($postData['name']) : '';
    $surname = isset($postData['surname']) ? trim($postData['surname']) : '';
    $address_text = isset($postData['address_text']) ? trim($postData['address_text']) : '';
    $city = isset($postData['city']) ? trim($postData['city']) : '';
    $phone = isset($postData['phone']) ? trim($postData['phone']) : '';
    $email = isset($postData['email']) ? trim($postData['email']) : '';
    $token = isset($postData['token']) ? trim($postData['token']) : '';
    
    Log::info('addCustomer.php - name estratto: ' . $name);
    
    // Validazione: name è obbligatorio
    if (empty($name)) {
        Log::warning('addCustomer.php - Nome cliente mancante');
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter name is required'
        ]);
    }
    
    // Verifica che non esista già un cliente con lo stesso nome
    $checkSql = "SELECT COUNT(*) FROM customers WHERE name = :name";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':name' => $name]);
    $customerExists = $checkStmt->fetchColumn();
    
    if ($customerExists > 0) {
        Log::warning('addCustomer.php - Cliente già esistente con nome: ' . $name);
        Api::responseJson(409, [
            'success' => false,
            'error' => 'Customer with this name already exists'
        ]);
    }
    
    // Costruisce la query di inserimento dinamicamente
    $insertFields = ['name'];
    $insertValues = [':name'];
    $params = [':name' => $name];
    
    if (!empty($surname)) {
        $insertFields[] = 'surname';
        $insertValues[] = ':surname';
        $params[':surname'] = $surname;
    }
    
    if (!empty($address_text)) {
        $insertFields[] = 'address_text';
        $insertValues[] = ':address_text';
        $params[':address_text'] = $address_text;
    }
    
    if (!empty($city)) {
        $insertFields[] = 'city';
        $insertValues[] = ':city';
        $params[':city'] = $city;
    }
    
    if (!empty($phone)) {
        $insertFields[] = 'phone';
        $insertValues[] = ':phone';
        $params[':phone'] = $phone;
    }
    
    if (!empty($email)) {
        $insertFields[] = 'email';
        $insertValues[] = ':email';
        $params[':email'] = $email;
    }
   
    
    // Costruisce e esegue la query di inserimento
    $sql = "INSERT INTO customers (" . implode(', ', $insertFields) . ") VALUES (" . implode(', ', $insertValues) . ")";
    
    Log::info('addCustomer.php - Esecuzione query: ' . $sql);
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($params);
    
    // Verifica se l'inserimento ha avuto successo
    if ($result) {
        // Ottiene l'ID del record appena inserito
        $newCustomerId = $pdo->lastInsertId();
        
        // Recupera i dati del nuovo cliente
        $selectSql = "SELECT * FROM customers WHERE id = :id";
        $selectStmt = $pdo->prepare($selectSql);
        $selectStmt->execute([':id' => $newCustomerId]);
        $newCustomer = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        Log::info('addCustomer.php - Cliente creato con successo. ID: ' . $newCustomerId);
        
        // Risposta HTTP 201 (Created) con i dati del nuovo cliente
        Api::responseJson(201, [
            'success' => true,
            'message' => 'Customer created successfully',
            'data' => $newCustomer,
            'id' => $newCustomerId
        ]);
    } else {
        Log::error('addCustomer.php - Errore durante l\'inserimento del cliente');
        Api::responseJson(500, [
            'success' => false,
            'error' => 'Failed to create customer'
        ]);
    }
    
} catch (PDOException $e) {
    // Log dell'errore database
    Log::error('addCustomer.php - Errore database: ' . $e->getMessage());
    
    // Errore di connessione al database
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Log dell'errore generico
    Log::error('addCustomer.php - Errore server: ' . $e->getMessage());
    
    // Altri errori
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>