import { useState } from 'react';
import { Filtros } from './Filtros';
import { Mapa } from './Mapa';

function App() {
  const [filtros, setFiltros] = useState({ estado: '', dataInicio: '', dataFim: '' });

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Mapa de Queimadas</h1>
      <Filtros onFiltrar={(estado, dataInicio, dataFim) => setFiltros({ estado, dataInicio, dataFim })} />
      <Mapa filtros={filtros} />
    </div>
  );
}

export default App;