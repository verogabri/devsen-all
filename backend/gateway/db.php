<?php

class DB {
    
    private static $instance = null;
    private $pdo;
    
    // Configurazione database
    private $host = 'localhost';
    private $dbname = 'devsen_db';
    private $username = 'root'; // Modifica con le tue credenziali
    private $password = '';     // Modifica con le tue credenziali
    private $charset = 'utf8';
    
    /**
     * Costruttore privato per implementare il pattern Singleton
     */
    private function __construct() {
        $this->connect();
    }
    
    /**
     * Metodo per ottenere l'istanza singleton della classe DB
     * 
     * @return DB
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Stabilisce la connessione al database
     * 
     * @throws PDOException
     */
    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch (PDOException $e) {
            throw new PDOException("Database connection failed: " . $e->getMessage());
        }
    }
    
    /**
     * Restituisce l'oggetto PDO per eseguire query
     * 
     * @return PDO
     */
    public function getPDO() {
        return $this->pdo;
    }
    
    /**
     * Metodo statico di convenienza per ottenere direttamente l'oggetto PDO
     * 
     * @return PDO
     */
    public static function getConnection() {
        return self::getInstance()->getPDO();
    }
    
    /**
     * Previene la clonazione dell'oggetto
     */
    private function __clone() {}
    
    /**
     * Previene l'unserializzazione dell'oggetto
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

?>