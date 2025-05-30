import "./style/Tabs.css";
import { useState } from 'react';
import { Filtros } from './Filtros';
import { Mapa } from './Mapa';
import { Grafico } from './Grafico';

interface FiltrosProps {
  estado: string;
  bioma: string;
  dataInicio: string;
  dataFim: string;
}

function Tabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const [filtros, setFiltros] = useState<FiltrosProps>({
    estado: 'todos',
    bioma: 'todos',
    dataInicio: '2025-04-01',
    dataFim: '2025-04-07',
  });

  const navbarStyle = {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    padding: "var(--space-md) 0",
    backgroundColor: "transparent",
  };

  return (
    <div className="tabs-container">
      <div className="tabs-header" style={navbarStyle}>
        <button
          className={activeTab === "mapas" ? "active" : ""}
          onClick={() => onTabChange("mapas")}
        >
          Mapa
        </button>
        <button
          className={activeTab === "imagens" ? "active" : ""}
          onClick={() => onTabChange("imagens")}
        >
          Gráfico
        </button>
      </div>
      <div>
        <h1 style={{ textAlign: 'center' }}>
          {activeTab === "mapas" ? "Mapa de Queimadas" : "Gráfico de Queimadas"}
        </h1>
        <Filtros onFiltrar={(estado: string, bioma:string, dataInicio: string, dataFim: string) =>
          setFiltros({ estado, bioma, dataInicio, dataFim })
        } />
        {activeTab === "mapas" ? (
          <Mapa filtros={filtros} />
        ) : (
          <Grafico filtros={filtros} />
        )}
      </div>
    </div>
  );
}

export default Tabs;
