import { useState } from 'react';
import { Filtros } from './Filtros';
import { Mapa } from './Mapa';

function App() {
  const [filtros, setFiltros] = useState({ estado: '', bioma: '', dataInicio: '', dataFim: '', tipoVisualizacao: 'focos' });

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Mapa de Queimadas</h1>
      <Filtros onFiltrar={(estado, bioma, dataInicio, dataFim, tipoVisualizacao) =>
        setFiltros({ estado, bioma, dataInicio, dataFim, tipoVisualizacao })
      } />
      <Mapa filtros={filtros} />
    </div>
  );
}

export default App;