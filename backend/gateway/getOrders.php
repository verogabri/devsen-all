<?php
require_once 'api.php';
require_once 'db.php';
require_once 'log.php';

try {
    // Log dell'inizio della richiesta
    Log::info('getOrders.php - Richiesta ricevuta con parametri: ' . json_encode($_GET));
    
    // Connessione al database usando la classe DB
    $pdo = DB::getConnection();
    
    // Recupera i parametri GET
    $id_customer = isset($_GET['id_customer']) ? trim($_GET['id_customer']) : '';
    $id_order = isset($_GET['id_order']) ? trim($_GET['id_order']) : '';
    
    // Converte i parametri in numeri per i confronti
    $id_customer_num = !empty($id_customer) ? intval($id_customer) : 0;
    $id_order_num = !empty($id_order) ? intval($id_order) : 0;
    
    Log::info('getOrders.php - Parametri: id_customer=' . $id_customer_num . ', id_order=' . $id_order_num);
    
    // Validazione: se c'è id_order ma non id_customer, errore
    if ($id_order_num > 0 && $id_customer_num <= 0) {
        Log::warning('getOrders.php - id_order fornito senza id_customer');
        Api::responseJson(400, [
            'success' => false,
            'error' => 'Parameter id_customer is required when id_order is provided'
        ]);
    }
    
    // Costruisce la query SQL in base ai parametri
    $sql = "SELECT o.*, os.status_label FROM orders as o JOIN orders_status as os ON o.id_status = os.id ";
    $params = [];
    $limit = '';
    
    if ($id_customer_num > 0) {
        // Se c'è id_customer, filtra per cliente
        $sql .= " WHERE id_customer = :id_customer";
        $params[':id_customer'] = $id_customer_num;
        
        if ($id_order_num > 0) {
            // Se c'è anche id_order, aggiunge la condizione
            $sql .= " AND id = :id_order";
            $params[':id_order'] = $id_order_num;
        }
        // Nessun limit quando si filtra per cliente
    } else {
        // Se non ci sono parametri, limit 10
        $limit = " LIMIT 10";
    }
    
    // Aggiunge il limit se necessario
    $sql .= $limit;
    
    Log::info('getOrders.php - Query SQL: ' . $sql);
    Log::info('getOrders.php - Parametri query: ' . json_encode($params));
    
    // Prepara ed esegue la query
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Recupera i risultati
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Log del successo
    Log::info('getOrders.php - Query eseguita con successo. Trovati ' . count($orders) . ' ordini');
    
    // Se c'è id_customer, recupera anche i dati del cliente
    $customer = null;
    if ($id_customer_num > 0) {
        $customerSql = "SELECT * FROM customers WHERE id = :id_customer";
        $customerStmt = $pdo->prepare($customerSql);
        $customerStmt->execute([':id_customer' => $id_customer_num]);
        $customer = $customerStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($customer) {
            Log::info('getOrders.php - Dati cliente recuperati per ID: ' . $id_customer_num . ', Nome: ' . ($customer['name'] ?? 'N/A'));
        } else {
            Log::warning('getOrders.php - Cliente non trovato con ID: ' . $id_customer_num);
        }
    }
    
    // Prepara la risposta
    $response = [
        'success' => true,
        'data' => $orders,
        'count' => count($orders),
        'filters' => [
            'id_customer' => $id_customer_num > 0 ? $id_customer_num : null,
            'id_order' => $id_order_num > 0 ? $id_order_num : null,
            'limit_applied' => empty($params)
        ]
    ];
    
    // Aggiunge i dati del cliente se disponibili
    if ($customer !== null) {
        $response['customer'] = $customer;
    }
    
    // Risposta HTTP 200 con JSON usando la classe Api
    Api::responseJson(200, $response);
    
} catch (PDOException $e) {
    // Log dell'errore database
    Log::error('getOrders.php - Errore database: ' . $e->getMessage());
    
    // Errore di connessione al database
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Database connection error: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Log dell'errore generico
    Log::error('getOrders.php - Errore server: ' . $e->getMessage());
    
    // Altri errori
    Api::responseJson(500, [
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>