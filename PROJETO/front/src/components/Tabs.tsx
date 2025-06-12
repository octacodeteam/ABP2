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
  tipoVisualizacao: string; // Adicione esta linha
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
    tipoVisualizacao: 'focos', // Adicione esta linha
  });

  // const tableStyle = {
  //   justifyContent: "center",
  //   display: "flex",
  //   padding: "0",
  //   backgroundColor: "transparent",
  //   border: "1px solid #000",
  //   borderRadius: "8px",
  // };
  //
  // const FRP1Style = {
  //   color: "#f2b705"
  // };
  //
  // const FRP2Style = {
  //   color: "#d97904"
  // };
  //
  // const FRP3Style = {
  //   color: "#bf2604"
  // };
  //
  // const FRP4Style = {
  //   color: "#730202"
  // };
  //
  // const FRP5Style = {
  //   color: "#260101"
  // };

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
        <Filtros
          onFiltrar={(
            estado: string,
            bioma: string,
            dataInicio: string,
            dataFim: string,
            tipoVisualizacao: string // Novo parâmetro
          ) =>
            setFiltros({ estado, bioma, dataInicio, dataFim, tipoVisualizacao })
          }
        />
        {activeTab === "mapas" ? (
          <Mapa filtros={filtros} />
        ) : (
          <Grafico filtros={filtros} />
        )}

        {/* 
        <p style={{ textAlign: 'center' }}>FRP (Fire rate power)</p>

        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={FRP1Style}>0 a 200</td>
              <td style={FRP2Style}>201 a 400</td>
              <td style={FRP3Style}>401 a 600</td>
              <td style={FRP4Style}>601 a 800</td>
              <td style={FRP5Style}>801 a 8000</td>
            </tr>
          </tbody>
        </table>
        */}

      </div>
    </div>
  );
}

export default Tabs;
