<?php

class Log {
    
    private static $logDir = 'logs';
    
    /**
     * Scrive un messaggio nel file di log
     * 
     * @param string $message Il messaggio da scrivere nel log
     * @param string $level Il livello di log (INFO, ERROR, WARNING, etc.)
     */
    public static function write($message, $level = 'INFO') {
        try {
            // Ottiene la data e l'ora correnti
            $currentYear = date('Y');
            $currentDate = date('Ymd');
            $currentTime = date('H:i:s');
            
            // Costruisce il percorso della cartella logs/anno
            $logPath = self::$logDir . DIRECTORY_SEPARATOR . $currentYear;
            
            // Crea le cartelle se non esistono
            if (!file_exists(self::$logDir)) {
                mkdir(self::$logDir, 0755, true);
            }
            
            if (!file_exists($logPath)) {
                mkdir($logPath, 0755, true);
            }
            
            // Nome del file di log: gateway_yyyymmdd.log
            $logFileName = 'gateway_' . $currentDate . '.log';
            $logFilePath = $logPath . DIRECTORY_SEPARATOR . $logFileName;
            
            // Formatta il messaggio: [H:i:s] LEVEL: message
            $logEntry = '[' . $currentTime . '] ' . strtoupper($level) . ': ' . $message . PHP_EOL;
            
            // Scrive il messaggio nel file (aggiunge in coda)
            file_put_contents($logFilePath, $logEntry, FILE_APPEND | LOCK_EX);
            
        } catch (Exception $e) {
            // In caso di errore nella scrittura del log, evita loop infiniti
            error_log('Log write error: ' . $e->getMessage());
        }
    }
    
    /**
     * Metodi di convenienza per diversi livelli di log
     */
    
    public static function info($message) {
        self::write($message, 'INFO');
    }
    
    public static function error($message) {
        self::write($message, 'ERROR');
    }
    
    public static function warning($message) {
        self::write($message, 'WARNING');
    }
    
    public static function debug($message) {
        self::write($message, 'DEBUG');
    }
    
    /**
     * Imposta una cartella personalizzata per i log
     * 
     * @param string $dir Il percorso della cartella di log
     */
    public static function setLogDirectory($dir) {
        self::$logDir = $dir;
    }
    
    /**
     * Ottiene il percorso completo del file di log corrente
     * 
     * @return string
     */
    public static function getCurrentLogFile() {
        $currentYear = date('Y');
        $currentDate = date('Ymd');
        $logPath = self::$logDir . DIRECTORY_SEPARATOR . $currentYear;
        $logFileName = 'gateway_' . $currentDate . '.log';
        
        return $logPath . DIRECTORY_SEPARATOR . $logFileName;
    }
}

?>