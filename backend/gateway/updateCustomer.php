<?php
require_once 'api.php';
require_once 'db.php';
require_once 'log.php';

error_log(__FILE__ . ' - starting updateCustomer.php');

try {
    // Verifica che la richiesta sia POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Log::warning('updateCustomer.php - Metodo non consentito: ' . $_SERVER['REQUEST_METHOD']);
        Api::responseJson(405, [
            'success' => false,
            'error' => 'Method not allowed. Use POST method.'
        ]);
    }
    
    // Legge il raw input del POST
    $rawInput = file_get_contents('php://input');
    Log::info('updateCustomer.php - Raw input ricevuto: ' . $rawInput);
    
    // Parsing dei dati POST
    $postData = [];
    $postData = json_decode(file_get_contents('php://input'), true);
    
    // Determina il Content-Type
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    // Log dei dati POST parsati
    Log::info('updateCustomer.php - Dati POST parsati: ' . json_encode($postData));
    
    // Connessione al database usando la classe DB
    $pdo = DB::getConnection();
    
    // Recupera i parametri POST dai dati parsati
    $id_customer = isset($postData['id_customer']) ? trim($postData['id_customer']) : '';
    $name = isset($postData['name']) ? trim($postData['name']) : '';
    $surname = isset($postData['surname']) ? trim($postData['surname']) : '';
    $address_text = isset($postData['address_text']) ? trim($postData['address_text']) : '';
    $city = isset($postData['city']) ? trim($postData['city']) : '';
    $phone = isset($postData['phone']) ? trim($postData['phone']) : '';
    $email = isset($postData['email']) ? trim($postData['email']) : '';
    // $token = isset($postData['token']) ? trim($postData['token']) : '';
    
    Log::info('updateCustomer.php - id_customer estratto: ' . $id_customer);

    // Validazione: id_customer è obbligatorio
    if (empty($id_customer)) {
        Log::warning('updateCustomer.php - ID cliente mancante');
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter id_customer is required'
        ]);
    }
    
    // Verifica che il cliente esista
    $checkSql = "SELECT COUNT(*) FROM customers WHERE id = :id_customer";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':id_customer' => $id_customer]);
    $customerExists = $checkStmt->fetchColumn();
    
    if (!$customerExists) {
        Log::warning('updateCustomer.php - Cliente non trovato con ID: ' . $id_customer);
        Api::responseJson(404, [
            'success' => false,
            'error' => 'Customer not found'
        ]);
    }
    
    // Costruisce la query di aggiornamento dinamicamente
    $updateFields = [];
    $params = [':id_customer' => $id_customer];
    
    if (!empty($name)) {
        $updateFields[] = "name = :name";
        $params[':name'] = $name;
    }
    
    if (!empty($surname)) {
        $updateFields[] = "surname = :surname";
        $params[':surname'] = $surname;
    }
    
    if (!empty($address_text)) {
        $updateFields[] = "address_text = :address_text";
        $params[':address_text'] = $address_text;
    }
    
    if (!empty($city)) {
        $updateFields[] = "city = :city";
        $params[':city'] = $city;
    }
    
    if (!empty($phone)) {
        $updateFields[] = "phone = :phone";
        $params[':phone'] = $phone;
    }
    
    if (!empty($email)) {
        $updateFields[] = "email = :email";
        $params[':email'] = $email;
    }
    
    // Se non ci sono campi da aggiornare
    if (empty($updateFields)) {
        Log::warning('updateCustomer.php - Nessun campo da aggiornare per ID: ' . $id_customer);
        Api::responseJson(400, [
            'success' => false,
            'error' => 'No fields to update'
        ]);
    }
    
    // Costruisce e esegue la query di aggiornamento
    $sql = "UPDATE customers SET " . implode(', ', $updateFields) . " WHERE id = :id_customer";
    
    Log::info('updateCustomer.php - Esecuzione query: ' . $sql);
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($params);
    
    // Verifica se l'aggiornamento ha avuto successo
    $affectedRows = $stmt->rowCount();
    
    if ($affectedRows > 0) {
        // Recupera i dati aggiornati del cliente
        $selectSql = "SELECT * FROM customers WHERE id = :id_customer";
        $selectStmt = $pdo->prepare($selectSql);
        $selectStmt->execute([':id_customer' => $id_customer]);
        $updatedCustomer = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        Log::info('updateCustomer.php - Cliente aggiornato con successo. ID: ' . $id_customer);
        
        // Risposta HTTP 200 con i dati aggiornati
        Api::responseJson(200, [
            'success' => true,
            'message' => 'Customer updated successfully',
            'data' => $updatedCustomer,
            'affected_rows' => $affectedRows
        ]);
    } else {
        Log::warning('updateCustomer.php - Nessuna riga modificata per ID: ' . $id_customer);
        Api::responseJson(200, [
            'success' => true,
            'message' => 'No changes made',
            'affected_rows' => 0
        ]);
    }
    
} catch (PDOException $e) {
    // Log dell'errore database
    Log::error('updateCustomer.php - Errore database: ' . $e->getMessage());
    
    // Errore di connessione al database
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Log dell'errore generico
    Log::error('updateCustomer.php - Errore server: ' . $e->getMessage());
    
    // Altri errori
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>