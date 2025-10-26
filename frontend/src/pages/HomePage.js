function HomePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Benvenuto nell'applicazione</h1>
      <p className="text-gray-600 mb-4">
        Questa è la homepage dell'applicazione di gestione clienti e ordini.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Clienti</h2>
          <p className="text-blue-600">Gestisci i tuoi clienti, aggiungi nuovi contatti e modifica le informazioni esistenti.</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Ordini</h2>
          <p className="text-green-600">Visualizza e gestisci tutti gli ordini dei tuoi clienti.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
