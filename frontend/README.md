# Cliente per Gestione Clienti e Ordini

Questo è il client frontend che mostra le funzionalità di una possibile applicazione per la gestione di clienti e ordini. L'applicazione è sviluppata in React e fornisce un'interfaccia utente completa per la gestione dei dati aziendali.

## Funzionalità Principali

### Gestione Clienti
L'applicazione permette di:
- **Visualizzare la lista dei clienti** con tutti i loro dati principali
- **Aggiungere un nuovo cliente** tramite un form dedicato
- **Modificare i dati** di un cliente esistente
- **Cancellare un cliente** dal sistema (quando necessario)

### Gestione Ordini
Per gli ordini è possibile:
- **Visualizzare la lista degli ordini** con informazioni dettagliate (data, cliente, totale, stato)
- **Aggiornare lo stato** degli ordini (In Attesa → In Lavorazione → Completato)
- **Annullare un ordine** (se lo stato lo permette - non disponibile per ordini con stato >= 3)
- **Aggiungere un nuovo ordine** nella apposita pagina di creazione

## Architettura Tecnica

### Stack Tecnologico
- **React 18.3.1** - Framework principale
- **React Router DOM 6.23.1** - Gestione routing client-side
- **Axios 1.12.2** - Client HTTP per chiamate API
- **Context API** - Gestione stato globale
- **Tailwind CSS** - Styling e responsive design

### Struttura delle Pagine
- **Home** (`/`) - Pagina principale con sidebar di navigazione
- **Clienti** (`/customers`) - Lista e gestione clienti
- **Ordini** (`/orders`) - Lista e gestione ordini
- **Nuovo Ordine** (`/order/createnew`) - Form per creare ordini

## Integrazione API

Tutte le operazioni sui dati sono eseguite chiamando apposite URL del servizio API:

### Operazioni Clienti
- `GET /customers` - Recupera lista clienti
- `POST /customers` - Crea nuovo cliente
- `PUT /customers/:id` - Aggiorna cliente esistente
- `DELETE /customers/:id` - Elimina cliente

### Operazioni Ordini
- `GET /orders` - Recupera lista ordini
- `GET /orders/:id_customer` - Recupera ordini per cliente specifico
- `POST /orders` - Crea nuovo ordine
- `PUT /orders/:id` - Aggiorna ordine (principalmente per cambio stato)
- `DELETE /orders/:id` - Elimina/annulla ordine

## Configurazione

Il server API va configurato nel file `src/config/config.js`. 

Esempio di configurazione:
```javascript
export const HOST_SERVER = 'http://localhost:3003';
```

## Installazione e Avvio

1. Installa le dipendenze:
```bash
npm install
```

2. Configura l'endpoint API nel file `config/config.js`

3. Avvia l'applicazione:
```bash
npm start
```

L'applicazione sarà disponibile su `http://localhost:3000`

## Note Tecniche

- L'applicazione utilizza il Context API per la gestione dello stato globale
- Tutte le chiamate API includono gestione degli errori con messaggi informativi
- L'interfaccia è responsive e ottimizzata per dispositivi mobili
- I componenti sono modulari e riutilizzabili
- Validazione PropTypes implementata per type safety
