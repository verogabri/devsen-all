<?php
require_once 'api.php';
require_once 'db.php';
require_once 'log.php';

error_log(__FILE__ . ' - starting deleteCustomer.php');

try {
    // Log dell'inizio della richiesta
    Log::info('deleteCustomer.php - Richiesta ricevuta con parametri GET: ' . json_encode($_GET));
    
    // Verifica che la richiesta sia GET
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        Log::warning('deleteCustomer.php - Metodo non consentito: ' . $_SERVER['REQUEST_METHOD']);
        Api::responseJson(405, [
            'success' => false,
            'error' => 'Method not allowed. Use GET method.'
        ]);
    }
    
    // Connessione al database usando la classe DB
    $pdo = DB::getConnection();
    
    // Recupera il parametro GET
    $id_customer = isset($_GET['id_customer']) ? trim($_GET['id_customer']) : '';
    
    Log::info('deleteCustomer.php - id_customer estratto: ' . $id_customer);
    
    // Validazione: id_customer è obbligatorio
    if (empty($id_customer)) {
        Log::warning('deleteCustomer.php - ID cliente mancante');
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter id_customer is required'
        ]);
    }
    
    // Verifica che il cliente esista e non sia già eliminato
    $checkSql = "SELECT id, name, status FROM customers WHERE id = :id_customer";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':id_customer' => $id_customer]);
    $customer = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$customer) {
        Log::warning('deleteCustomer.php - Cliente non trovato con ID: ' . $id_customer);
        Api::responseJson(404, [
            'success' => false,
            'error' => 'Customer not found'
        ]);
    }
    
    // Verifica se il cliente è già eliminato
    if (isset($customer['status']) && $customer['status'] === 'D') {
        Log::warning('deleteCustomer.php - Cliente già eliminato con ID: ' . $id_customer);
        Api::responseJson(409, [
            'success' => false,
            'error' => 'Customer already deleted',
            'data' => $customer
        ]);
    }
    
    // Esegue il soft delete aggiornando lo status a 'D'
    $deleteSql = "UPDATE customers SET status = 'D' WHERE id = :id_customer";
    
    Log::info('deleteCustomer.php - Esecuzione query: ' . $deleteSql);
    
    $deleteStmt = $pdo->prepare($deleteSql);
    $result = $deleteStmt->execute([':id_customer' => $id_customer]);
    
    // Verifica se l'aggiornamento ha avuto successo
    $affectedRows = $deleteStmt->rowCount();
    
    if ($result && $affectedRows > 0) {
        // Recupera i dati aggiornati del cliente
        $selectSql = "SELECT * FROM customers WHERE id = :id_customer";
        $selectStmt = $pdo->prepare($selectSql);
        $selectStmt->execute([':id_customer' => $id_customer]);
        $deletedCustomer = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        Log::info('deleteCustomer.php - Cliente eliminato con successo. ID: ' . $id_customer . ', Nome: ' . $customer['name']);
        
        // Risposta HTTP 200 con i dati del cliente eliminato
        Api::responseJson(200, [
            'success' => true,
            'message' => 'Customer deleted successfully',
            'data' => $deletedCustomer,
            'affected_rows' => $affectedRows
        ]);
    } else {
        Log::error('deleteCustomer.php - Errore durante l\'eliminazione del cliente con ID: ' . $id_customer);
        Api::responseJson(500, [
            'success' => false,
            'error' => 'Failed to delete customer'
        ]);
    }
    
} catch (PDOException $e) {
    // Log dell'errore database
    Log::error('deleteCustomer.php - Errore database: ' . $e->getMessage());
    
    // Errore di connessione al database
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Log dell'errore generico
    Log::error('deleteCustomer.php - Errore server: ' . $e->getMessage());
    
    // Altri errori
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>