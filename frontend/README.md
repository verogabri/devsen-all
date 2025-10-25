# Section 10: A lot of Components

in questo progetto si vuole creare un sidebar menu che ad ogni click mostra un componente diverso
e ogni componente mostra qualcosa di usabile: un dorpdown menu, un accordione, una tabella, ecc

il progetto si espanderà attraverso altre sezioni

## Button
come fare un Buttons che può essere personalizzato passando dei parametri specifici
questi parametri sono boolean e attivano o meno delle propietà
i parametri vengono definiti come "props-type"

### prop-type
https://www.npmjs.com/package/prop-types

PS: Typescripts lo fa di suo

### Tailwind.css
"Tailwind.css is a dumb!" Però ti costringe a lavorare faccendo piccoli componenti riutilizzabili,
quindi è un buon esercizio

https://tailwindcss.com/docs/guides/create-react-app

per il progetto
    $ npm install -D tailwindcss postcss autoprefixer
    $ npx tailwindcss init -p

Poi editare il file index.css
e aggiungerlo a index.js

### classnames
siccome tailwind is a dumb, usare tutte le classi e le modifche parametrizzate
può divenatre lungo e tedioso, aggiungiamo un altro componente:

    $ npm i classnames

che rende la configurazione di className più semplice

### react-icons
e per finire un po' di icone
react-icons è un componente che permette di usare le principali libbrerie di icons
senza dover installare una per una

    $ npm install --save-exact react-icons@4.6.0

### event 
uso il barbatrucco ...rest per passare tutti gli eventi all'elemento che sto creando


# sezione 11: Matering the State Design Process
come fare un accordion e come evitare problemi di ritardi con useState

non farsi troppe seghe mentali su come organizzare i propri file e compoenenti,
basta che il progetti funzioni

# sezione 12: Practing Props and State
come fare un DropBox

## Panel compponent
creo un componenet Panel che contiene cose e che posso usare liberamente nel progetto


# sezione 13: making navigation
in react un Navigator è un po' svidante e normalmente si preferisce usare qualche libreria

# section 14: Creating Portal

ma prima un nuovo componente: "modal"
o volgarmente chiamato popup, un box che si apre in pagina sopra tutto con uno o più pulsanti di azione

## ReactDOM.createPortal
react prende tutti i componenti uno in fila all'altro e genera un blocco di output html che renderizza nel componente della pagian index, psesso indicato come "root"
RecatDOM.createPOrtal invece prendere un pezzo di html e lo renderizza in qualche altro elemento della pagian ibdex.
Particolarmente indicato nel caso di Modal (popup) che deveono essere visualizzati al piena pagina e sopra tutti gli altri elementi

# section 15: Make a Feature-Full Data Table!
# section 16: getting clever with Sortable Table

# section 17: Custom Hooks in Depth
