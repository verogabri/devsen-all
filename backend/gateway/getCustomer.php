<?php
require_once 'api.php';
require_once 'db.php';
require_once 'log.php';

try {
    // Log dell'inizio della richiesta
    Log::info('getCustomer.php - Richiesta ricevuta con parametri: ' . json_encode($_GET));
    
    // Connessione al database usando la classe DB
    $pdo = DB::getConnection();
    
    // Recupera il parametro GET
    $name_customer = isset($_GET['name_customer']) ? trim($_GET['name_customer']) : '';
    
    // Costruisce la query SQL
    $sql = "SELECT * FROM customers";
    $params = [];
    
    // Se name_customer è valorizzato, aggiunge la condizione WHERE
    if (!empty($name_customer)) {
        $sql .= " WHERE name = :name_customer";
        $params[':name_customer'] = $name_customer;
    }
    
    // Prepara ed esegue la query
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Recupera i risultati
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Log del successo
    Log::info('getCustomer.php - Query eseguita con successo. Trovati ' . count($customers) . ' clienti');
    
    // Risposta HTTP 200 con JSON usando la classe Api
    Api::responseJson(200, [
        'success' => true,
        'data' => $customers,
        'count' => count($customers)
    ]);
    
} catch (PDOException $e) {
    // Log dell'errore database
    Log::error('getCustomer.php - Errore database: ' . $e->getMessage());
    
    // Errore di connessione al database
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Database connection error: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Log dell'errore generico
    Log::error('getCustomer.php - Errore server: ' . $e->getMessage());
    
    // Altri errori
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>