# DEVSEN API REST

API REST per la gestione di ordini e clienti che funge da gateway verso un server backend PHP.

## Descrizione

Questo servizio REST API espone una serie di endpoint per operazioni su ordini e clienti. L'architettura è basata su un pattern gateway: ogni richiesta ricevuta dall'API viene inoltrata a un server gateway esterno che esegue materialmente le operazioni sui dati del database.

## Caratteristiche

- **API Gateway Pattern**: Tutte le operazioni sui dati vengono proxate al server gateway
- **Autenticazione Bearer Token**: Ogni endpoint richiede un header di autorizzazione
- **RESTful Design**: Endpoint semanticamente corretti con codici di stato HTTP appropriati
- **Multi-environment**: Configurazioni separate per development, staging e production

## Autenticazione

Ogni richiesta deve includere un header di autorizzazione Bearer Token:

```
Authorization: Bearer <your_token>
```

Il token può essere:
- Un JWT (JSON Web Token) per validare l'utente
- Un token di accesso specifico dell'applicazione

## Endpoint Disponibili

### Clienti
- `POST /customers` - Crea un nuovo cliente
- `PUT /customers/:id_customer` - Aggiorna un cliente esistente
- `GET /customers/get` - Ottieni tutti i clienti
- `GET /customers/get/:name_customer` - Ottieni un cliente specifico
- `DELETE /customers/:name_customer` - Elimina un cliente

### Ordini  
- `POST /orders/add` - Crea un nuovo ordine
- `GET /orders/get/:name_customer` - Ottieni ordini di un cliente
- `GET /orders/get/:name_customer/:id_order` - Ottieni un ordine specifico
- `POST /orders/status/:id_order/:status` - Aggiorna stato ordine
- `DELETE /orders/:id_order` - Elimina un ordine

### Sistema
- `GET /version` - Versione dell'API
- `GET /health-check` - Controllo stato servizio

## Tecnologie

- **Node.js** v8.12.0+ con ES6/Babel
- **Express.js** per il server web
- **Winston** per logging
- **Helmet** per sicurezza HTTP
- **CORS** per richieste cross-origin

## Gateway Configuration

Il server gateway è configurato tramite le variabili:
- `gateway_url`: URL del server gateway
- `gateway_port`: Porta del server gateway

## Avvio e Sviluppo

```bash

# Avvio produzione o in locale
npm start

L'applicazione sarà disponibile su `http://localhost:3003`

```

## Configurazione Ambienti

- `config.json` - Development
- `config.staging.json` - Staging  
- `config.production.json` - Production

L'ambiente viene selezionato tramite la variabile `NODE_ENV`.

## Codici di Stato HTTP

- `200` - Operazione riuscita
- `400` - Dati mancanti o non validi
- `401` - Non autorizzato (token mancante/invalido)
- `404` - Risorsa non trovata
- `500` - Errore interno del server/gateway
