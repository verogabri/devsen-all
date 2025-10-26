<?php
require_once 'api.php';
require_once 'db.php';
require_once 'log.php';

try {
    // Log dell'inizio della richiesta
    Log::info('deleteOrder.php - Richiesta ricevuta con parametri GET: ' . json_encode($_GET));
    
    // Verifica che la richiesta sia GET
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        Log::warning('deleteOrder.php - Metodo non consentito: ' . $_SERVER['REQUEST_METHOD']);
        Api::responseJson(405, [
            'success' => false,
            'error' => 'Method not allowed. Use GET method.'
        ]);
    }
    
    // Connessione al database usando la classe DB
    $pdo = DB::getConnection();
    
    // Recupera il parametro GET
    $id_order = isset($_GET['id_order']) ? trim($_GET['id_order']) : '';
    
    Log::info('deleteOrder.php - id_order estratto: ' . $id_order);
    
    // Validazione: id_order è obbligatorio
    if (empty($id_order)) {
        Log::warning('deleteOrder.php - ID ordine mancante');
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter id_order is required'
        ]);
    }
    
    // Converte id_order in numero
    $id_order_num = intval($id_order);
    if ($id_order_num <= 0) {
        Log::warning('deleteOrder.php - ID ordine non valido: ' . $id_order);
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter id_order must be a positive number'
        ]);
    }
    
    // Verifica che l'ordine esista e recupera i suoi dati
    $checkSql = "SELECT id, id_customer, id_status, total_amount FROM orders WHERE id = :id_order";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':id_order' => $id_order_num]);
    $order = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        Log::warning('deleteOrder.php - Ordine non trovato con ID: ' . $id_order_num);
        Api::responseJson(404, [
            'success' => false,
            'error' => 'Order not found'
        ]);
    }
    
    // Verifica che l'ordine non sia già in uno stato finale (id_status >= 3)
    $currentStatus = intval($order['id_status']);
    if ($currentStatus >= 3) {
        Log::warning('deleteOrder.php - Ordine non eliminabile, status: ' . $currentStatus . ', ID: ' . $id_order_num);
        Api::responseJson(409, [
            'success' => false,
            'error' => 'Order cannot be deleted. Status must be less than 3 (current status: ' . $currentStatus . ')',
            'data' => $order
        ]);
    }
    
    // Esegue l'aggiornamento dello status a 4 (eliminato)
    $deleteSql = "UPDATE orders SET id_status = 4 WHERE id = :id_order";
    
    Log::info('deleteOrder.php - Esecuzione query: ' . $deleteSql);
    
    $deleteStmt = $pdo->prepare($deleteSql);
    $result = $deleteStmt->execute([':id_order' => $id_order_num]);
    
    // Verifica se l'aggiornamento ha avuto successo
    $affectedRows = $deleteStmt->rowCount();
    
    if ($result && $affectedRows > 0) {
        // Recupera i dati aggiornati dell'ordine
        // $selectSql = "SELECT * FROM orders WHERE id = :id_order";
        $selectSql = "SELECT o.*, os.status_label, c.name, c.surname FROM orders as o JOIN orders_status as os ON o.id_status = os.id ";
        $selectSql .= "JOIN customers AS c ON c.id = o.id_customer "; 
        $selectSql .= "WHERE o.id = :id_order"; 
        $selectStmt = $pdo->prepare($selectSql);
        $selectStmt->execute([':id_order' => $id_order_num]);
        $deletedOrder = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        Log::info('deleteOrder.php - Ordine eliminato con successo. ID: ' . $id_order_num . ', Cliente: ' . $order['id_customer'] . ', Importo: ' . $order['total_amount']);
        
        // Risposta HTTP 200 con i dati dell'ordine eliminato
        Api::responseJson(200, [
            'success' => true,
            'message' => 'Order deleted successfully',
            'data' => $deletedOrder,
            'affected_rows' => $affectedRows,
            'previous_status' => $currentStatus,
            'new_status' => 4
        ]);
    } else {
        Log::error('deleteOrder.php - Errore durante l\'eliminazione dell\'ordine con ID: ' . $id_order_num);
        Api::responseJson(500, [
            'success' => false,
            'error' => 'Failed to delete order'
        ]);
    }
    
} catch (PDOException $e) {
    // Log dell'errore database
    Log::error('deleteOrder.php - Errore database: ' . $e->getMessage());
    
    // Errore di connessione al database
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Log dell'errore generico
    Log::error('deleteOrder.php - Errore server: ' . $e->getMessage());
    
    // Altri errori
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>