# Gateway API - Backend Scripts

Questo repository contiene gli script PHP per il gateway API che gestisce operazioni su clienti e ordini.

## Struttura del Progetto

```
gateway/
├── api.php              # Classe per gestire risposte HTTP JSON
├── db.php               # Classe per connessione database (Singleton)
├── log.php              # Classe per logging strutturato
├── logs/                # Directory per file di log
├── README.md            # Documentazione (questo file)
└── scripts/             # Script API endpoints
```

## Classi di Utilità

### `api.php`
Classe per gestire le risposte HTTP in formato JSON.
- **Metodi principali:**
  - `responseJson($code, $data)` - Invia risposta HTTP con codice e dati JSON
  - `success($data, $code = 200)` - Risposta di successo
  - `error($message, $code = 500)` - Risposta di errore

### `db.php`
Classe per gestione connessione database con pattern Singleton.
- **Configurazione:** Database `devsen_db` su localhost
- **Metodi:**
  - `getConnection()` - Ottiene connessione PDO
  - `getInstance()` - Istanza singleton

### `log.php`
Classe per logging strutturato con rotazione giornaliera.
- **Struttura:** `logs/YYYY/gateway_YYYYMMDD.log`
- **Formato:** `[HH:mm:ss] LEVEL: messaggio`
- **Metodi:** `info()`, `error()`, `warning()`, `debug()`

## API Endpoints

### Gestione Clienti

#### `getCustomer.php` - Lettura Clienti
**Metodo:** GET
**Parametri:**
- `name_customer` (opzionale) - Nome del cliente da cercare

**Funzionalità:**
- Se `name_customer` è valorizzato: restituisce clienti con quel nome
- Se vuoto: restituisce tutti i clienti
- Risposta include array clienti e conteggio

#### `addCustomer.php` - Creazione Cliente
**Metodo:** POST (JSON/form-data)
**Parametri richiesti:**
- `name` - Nome cliente (obbligatorio, deve essere univoco)

**Parametri opzionali:**
- `surname` - Cognome
- `address` - Indirizzo  
- `city` - Città
- `phone` - Telefono
- `email` - Email
- `token` - Token di accesso

**Funzionalità:**
- Verifica univocità del nome
- Inserisce nuovo cliente
- Restituisce record creato con ID

#### `updateCustomer.php` - Aggiornamento Cliente
**Metodo:** POST (JSON/form-data)
**Parametri:**
- `id_customer` (obbligatorio) - ID del cliente da aggiornare
- Campi da modificare (nome, cognome, indirizzo, etc.)

**Funzionalità:**
- Verifica esistenza cliente
- Aggiorna solo campi valorizzati
- Restituisce record aggiornato

#### `deleteCustomer.php` - Eliminazione Cliente (Soft Delete)
**Metodo:** GET
**Parametri:**
- `id_customer` (obbligatorio) - ID del cliente da eliminare

**Funzionalità:**
- Soft delete: imposta `status = 'D'`
- Verifica se già eliminato
- Restituisce record con status aggiornato

### Gestione Ordini

#### `getOrders.php` - Lettura Ordini
**Metodo:** GET
**Parametri:**
- `id_customer` (opzionale) - ID cliente
- `id_order` (opzionale) - ID ordine specifico

**Logica:**
- Nessun parametro: primi 10 ordini
- Solo `id_customer`: tutti gli ordini del cliente
- `id_customer` + `id_order`: ordine specifico del cliente
- Solo `id_order`: errore (richiede id_customer)

**Funzionalità:**
- Include dati cliente quando `id_customer` è fornito
- Risposta con filtri applicati e conteggio

#### `addOrder.php` - Creazione Ordine
**Metodo:** POST (JSON/form-data)
**Parametri richiesti:**
- `id_customer` - ID cliente (deve esistere)
- `date` - Data ordine (ISO 8601: `2025-10-26T00:00:00.000Z`)
- `total_amount` - Importo totale (numero positivo)

**Funzionalità:**
- Verifica esistenza cliente
- Valida formato data (supporta ISO 8601 e YYYY-MM-DD)
- Imposta automaticamente `id_status = 1`
- Restituisce ordine creato

#### `updateOrderStatus.php` - Aggiornamento Status Ordine
**Metodo:** GET
**Parametri:**
- `id_order` (obbligatorio) - ID ordine
- `id_status` (obbligatorio) - Nuovo status

**Regole Business:**
- Nuovo status deve essere > status corrente
- Impedisce regressioni di stato
- Restituisce ordine aggiornato con cronologia cambiamento

#### `deleteOrder.php` - Eliminazione Ordine
**Metodo:** GET
**Parametri:**
- `id_order` (obbligatorio) - ID ordine da eliminare

**Regole Business:**
- Eliminabile solo se `id_status < 3`
- Imposta `id_status = 4` (eliminato)
- Restituisce ordine con nuovo status

## Formati di Risposta

### Successo
```json
{
    "success": true,
    "data": { ... },
    "count": 5,
    "message": "Operation completed successfully"
}
```

### Errore
```json
{
    "success": false,
    "error": "Error message description"
}
```

## Codici HTTP

- **200** - Operazione completata
- **201** - Risorsa creata
- **400** - Parametri non validi
- **404** - Risorsa non trovata
- **405** - Metodo non consentito
- **409** - Conflitto (duplicati, regole business)
- **500** - Errore server

## Sicurezza

- **Prepared Statements** - Prevenzione SQL injection
- **Validazione Input** - Controllo parametri
- **Logging** - Tracciamento operazioni
- **Gestione Errori** - Risposta strutturata

## Configurazione Database

Modificare credenziali in `db.php`:
```php
private $host = 'localhost';
private $dbname = 'devsen_db';
private $username = 'root';
private $password = '';
```

## Esempi di Utilizzo

### Creare un cliente
```bash
curl -X POST -H "Content-Type: application/json" \
     -d '{"name":"Mario","surname":"Rossi","email":"mario@email.com"}' \
     http://localhost/gateway/addCustomer.php
```

### Ottenere ordini di un cliente
```bash
curl "http://localhost/gateway/getOrders.php?id_customer=123"
```

### Creare un ordine
```bash
curl -X POST -H "Content-Type: application/json" \
     -d '{"id_customer":"123","date":"2025-10-26T10:00:00.000Z","total_amount":"99.99"}' \
     http://localhost/gateway/addOrder.php
```

## Log

I log sono salvati in `logs/YYYY/gateway_YYYYMMDD.log` con formato:
```
[14:30:25] INFO: getCustomer.php - Richiesta ricevuta con parametri: {"name_customer":"Mario"}
[14:30:25] ERROR: addCustomer.php - Cliente già esistente con nome: Mario
```

## Note

- Tutti gli script supportano CORS
- Parsing automatico JSON e form-data
- Soft delete per mantenere integrità dati
- Stati ordini progressivi (no regressioni)
- Logging dettagliato per debugging