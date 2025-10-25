<?php

class Api {
    
    /**
     * Invia una risposta HTTP in formato JSON
     * 
     * @param int $code Codice di stato HTTP
     * @param mixed $data Dati da restituire in formato JSON
     */
    public static function responseJson($code, $data) {
        // Imposta gli headers per JSON e CORS
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        // Imposta il codice di stato HTTP
        http_response_code($code);
        
        // Converte i dati in JSON e li invia
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        
        // Termina l'esecuzione dello script
        exit;
    }
    
    /**
     * Metodo di utilità per risposta di successo
     * 
     * @param mixed $data Dati da restituire
     * @param int $code Codice HTTP (default 200)
     */
    public static function success($data, $code = 200) {
        self::responseJson($code, [
            'success' => true,
            'data' => $data
        ]);
    }
    
    /**
     * Metodo di utilità per risposta di errore
     * 
     * @param string $message Messaggio di errore
     * @param int $code Codice HTTP (default 500)
     */
    public static function error($message, $code = 500) {
        self::responseJson($code, [
            'success' => false,
            'error' => $message
        ]);
    }
}

?>