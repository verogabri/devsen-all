<?php
require_once 'api.php';
require_once 'db.php';
require_once 'log.php';

try {
    // Log dell'inizio della richiesta
    Log::info('updateOrderStatus.php - Richiesta ricevuta con parametri GET: ' . json_encode($_GET));
    
    // Verifica che la richiesta sia GET
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        Log::warning('updateOrderStatus.php - Metodo non consentito: ' . $_SERVER['REQUEST_METHOD']);
        Api::responseJson(405, [
            'success' => false,
            'error' => 'Method not allowed. Use GET method.'
        ]);
    }
    
    // Connessione al database usando la classe DB
    $pdo = DB::getConnection();
    
    // Recupera i parametri GET
    $id_order = isset($_GET['id_order']) ? trim($_GET['id_order']) : '';
    $id_status = isset($_GET['id_status']) ? trim($_GET['id_status']) : '';
    
    Log::info('updateOrderStatus.php - Parametri estratti - id_order: ' . $id_order . ', id_status: ' . $id_status);
    
    // Validazione: id_order è obbligatorio
    if (empty($id_order)) {
        Log::warning('updateOrderStatus.php - ID ordine mancante');
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter id_order is required'
        ]);
    }
    
    // Validazione: id_status è obbligatorio
    if (empty($id_status)) {
        Log::warning('updateOrderStatus.php - ID status mancante');
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter id_status is required'
        ]);
    }
    
    // Converte i parametri in numeri
    $id_order_num = intval($id_order);
    $id_status_num = intval($id_status);
    
    if ($id_order_num <= 0) {
        Log::warning('updateOrderStatus.php - ID ordine non valido: ' . $id_order);
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter id_order must be a positive number'
        ]);
    }
    
    if ($id_status_num < 0) {
        Log::warning('updateOrderStatus.php - ID status non valido: ' . $id_status);
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter id_status must be a non-negative number'
        ]);
    }
    
    // Verifica che l'ordine esista e recupera i suoi dati
    $checkSql = "SELECT id, id_customer, id_status, total_amount, date FROM orders WHERE id = :id_order";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':id_order' => $id_order_num]);
    $order = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        Log::warning('updateOrderStatus.php - Ordine non trovato con ID: ' . $id_order_num);
        Api::responseJson(404, [
            'success' => false,
            'error' => 'Order not found'
        ]);
    }
    
    // Verifica che il nuovo status sia maggiore di quello corrente
    $currentStatus = intval($order['id_status']);
    if ($id_status_num <= $currentStatus) {
        Log::warning('updateOrderStatus.php - Nuovo status non valido. Corrente: ' . $currentStatus . ', Richiesto: ' . $id_status_num . ', ID ordine: ' . $id_order_num);
        Api::responseJson(409, [
            'success' => false,
            'error' => 'New status must be greater than current status (current: ' . $currentStatus . ', requested: ' . $id_status_num . ')',
            'data' => [
                'current_status' => $currentStatus,
                'requested_status' => $id_status_num,
                'order' => $order
            ]
        ]);
    }
    
    // Esegue l'aggiornamento dello status
    $updateSql = "UPDATE orders SET id_status = :id_status WHERE id = :id_order";
    
    Log::info('updateOrderStatus.php - Esecuzione query: ' . $updateSql . ' - Status da ' . $currentStatus . ' a ' . $id_status_num);
    
    $updateStmt = $pdo->prepare($updateSql);
    $result = $updateStmt->execute([
        ':id_status' => $id_status_num,
        ':id_order' => $id_order_num
    ]);
    
    // Verifica se l'aggiornamento ha avuto successo
    $affectedRows = $updateStmt->rowCount();
    
    if ($result && $affectedRows > 0) {
        // Recupera i dati aggiornati dell'ordine
        // $selectSql = "SELECT * FROM orders WHERE id = :id_order";
        $selectSql = "SELECT o.*, os.status_label, c.name, c.surname FROM orders as o JOIN orders_status as os ON o.id_status = os.id ";
        $selectSql .= "JOIN customers AS c ON c.id = o.id_customer "; 
        $selectSql .= "WHERE o.id = :id_order"; 
        $selectStmt = $pdo->prepare($selectSql);
        $selectStmt->execute([':id_order' => $id_order_num]);
        $updatedOrder = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        Log::info('updateOrderStatus.php - Status ordine aggiornato con successo. ID: ' . $id_order_num . ', Cliente: ' . $order['id_customer'] . ', Status: ' . $currentStatus . ' → ' . $id_status_num);
        
        // Risposta HTTP 200 con i dati dell'ordine aggiornato
        Api::responseJson(200, [
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $updatedOrder,
            'affected_rows' => $affectedRows,
            'status_change' => [
                'previous' => $currentStatus,
                'current' => $id_status_num
            ]
        ]);
    } else {
        Log::error('updateOrderStatus.php - Errore durante l\'aggiornamento dello status dell\'ordine con ID: ' . $id_order_num);
        Api::responseJson(500, [
            'success' => false,
            'error' => 'Failed to update order status'
        ]);
    }
    
} catch (PDOException $e) {
    // Log dell'errore database
    Log::error('updateOrderStatus.php - Errore database: ' . $e->getMessage());
    
    // Errore di connessione al database
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Log dell'errore generico
    Log::error('updateOrderStatus.php - Errore server: ' . $e->getMessage());
    
    // Altri errori
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>