# Gateway API - REST API per lettura dati MySQL

API REST in PHP 8.2+ per leggere dati da tabelle MySQL e restituirli in formato JSON.

## 🚀 Caratteristiche

- ✅ Compatibile con PHP 8.2+
- ✅ Connessione sicura a MySQL con PDO
- ✅ Configurazione tramite file `.env`
- ✅ Logging con Monolog
- ✅ Gestione errori robusta
- ✅ Paginazione automatica
- ✅ Protezione da SQL injection
- ✅ Headers CORS per API REST
- ✅ Validazione nomi tabelle
- ✅ Response HTTP 200 per successo

## 📦 Dipendenze (Composer)

```json
{
    "php": ">=8.2",
    "ext-pdo": "*",
    "ext-pdo_mysql": "*",
    "vlucas/phpdotenv": "^5.5",
    "monolog/monolog": "^3.4",
    "symfony/http-foundation": "^6.3"
}
```

## 🛠️ Installazione

1. **Clona o scarica i file del progetto**

2. **Installa le dipendenze con Composer:**
   ```bash
   composer install
   ```

3. **Configura il database:**
   ```bash
   # Copia il file di configurazione
   copy .env.example .env
   
   # Modifica .env con i tuoi dati del database
   ```

4. **Configura il database MySQL:**
   ```bash
   # Esegui lo script SQL per creare il database di test
   mysql -u root -p < database_setup.sql
   ```

5. **Configura il web server:**
   - Apache: il file `.htaccess` è già configurato
   - Nginx: configura le regole di rewrite per le API

## ⚙️ Configurazione

### File `.env`
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gateway_db
DB_USERNAME=root
DB_PASSWORD=your_password
DB_CHARSET=utf8mb4

# API Configuration
API_DEBUG=true
LOG_LEVEL=info
```

## 🔗 Endpoint API

### Health Check
```http
GET /api
GET /api/health
```

**Risposta:**
```json
{
    "success": true,
    "status": "healthy",
    "database": "connected",
    "php_version": "8.2.0",
    "timestamp": "2025-10-25T10:30:00+00:00"
}
```

### Lettura dati tabella
```http
GET /api/table/{nome_tabella}
```

**Parametri query opzionali:**
- `page`: numero pagina (default: 1)
- `limit`: record per pagina (default: 20, max: 100)

**Esempio:**
```http
GET /api/table/users?page=1&limit=10
```

**Risposta:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "nome": "Mario Rossi",
            "email": "mario.rossi@email.com",
            "telefono": "+39 123 456 7890",
            "data_creazione": "2025-10-25 10:30:00",
            "attivo": true
        }
    ],
    "table": "users",
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 5,
        "pages": 1
    },
    "timestamp": "2025-10-25T10:30:00+00:00"
}
```

### Lettura record specifico
```http
GET /api/table/{nome_tabella}/{id}
```

**Esempio:**
```http
GET /api/table/users/1
```

**Risposta:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "nome": "Mario Rossi",
        "email": "mario.rossi@email.com",
        "telefono": "+39 123 456 7890",
        "data_creazione": "2025-10-25 10:30:00",
        "attivo": true
    },
    "table": "users",
    "timestamp": "2025-10-25T10:30:00+00:00"
}
```

## 🧪 Testing

Esegui lo script di test:
```bash
php test_api.php
```

## 📁 Struttura del progetto

```
gateway/
├── src/
│   ├── DatabaseConnection.php  # Gestione connessione DB
│   └── ApiController.php       # Controller principale API
├── logs/                       # File di log (auto-creati)
├── vendor/                     # Dipendenze Composer
├── .env                        # Configurazione database
├── .env.example               # Template configurazione
├── .htaccess                  # Configurazione Apache
├── api.php                    # Entry point API
├── composer.json              # Dipendenze PHP
├── database_setup.sql         # Script setup database
├── test_api.php              # Script di test
└── README.md                 # Questo file
```

## 🔒 Sicurezza

- ✅ Prepared statements per prevenire SQL injection
- ✅ Validazione nomi tabelle
- ✅ Configurazione database protetta in `.env`
- ✅ File sensibili nascosti via `.htaccess`
- ✅ Gestione errori senza esposizione di informazioni sensibili

## 📝 Logging

I log vengono salvati in `logs/api.log` con rotazione automatica.

Livelli di log disponibili:
- `DEBUG`: Informazioni dettagliate (solo in modalità debug)
- `INFO`: Operazioni normali
- `ERROR`: Errori gestiti
- `EMERGENCY`: Errori critici

## 🌐 CORS

L'API è configurata per accettare richieste da qualsiasi origine (`*`).
Per ambiente di produzione, modifica i headers CORS in `api.php`.

## 🚨 Gestione errori

Tutte le risposte di errore seguono il formato:
```json
{
    "success": false,
    "error": "Messaggio di errore",
    "code": 404,
    "timestamp": "2025-10-25T10:30:00+00:00"
}
```

## 🔧 Troubleshooting

### Errore di connessione al database
1. Verifica le credenziali in `.env`
2. Controlla che MySQL sia in esecuzione
3. Verifica i permessi dell'utente database

### Errore 500
1. Controlla i log in `logs/api.log`
2. Attiva `API_DEBUG=true` in `.env`
3. Verifica le dipendenze Composer

### URL rewriting non funziona
1. Verifica che mod_rewrite sia abilitato in Apache
2. Controlla i permessi del file `.htaccess`
3. Per Nginx, configura manualmente le regole di rewrite