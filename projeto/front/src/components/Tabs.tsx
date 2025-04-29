import "./style/Tabs.css";

function Tabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
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
          Focos de calor
        </button>
        <button
          className={activeTab === "imagens" ? "active" : ""}
          onClick={() => onTabChange("imagens")}
        >
          Área queimada
        </button>
        <button
          className={activeTab === "relatorios" ? "active" : ""}
          onClick={() => onTabChange("relatorios")}
        >
          Risco de Fogo
        </button>
      </div>
      <div className="tabs-content">
        <div className="card">
          <h3>Focos de calor</h3>
          <p>Informações sobre os focos de calor detectados.</p>
          <div className="select-button">
            Selecione
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M10 17l5-5-5-5v10z" />
            </svg>
          </div>
        </div>
        <div className="card area-queimada-card">
          <div className="card-content">
            <div className="card-text">
              <h3>Área queimada</h3>
            </div>
            <div className="card-image">
              <img
                src="./public/area-queimada-card.svg"
                alt="Gráficos Área Queimada"
              />
            </div>
            <div className="select-button">
              <img src="./public/icon-area-queimada.svg" alt="Área Queimada" />
              <span>Selecione</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Risco de Fogo</h3>
          <p>Previsões e análises sobre o risco de fogo.</p>
          <div className="select-button">
            Selecione
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M10 17l5-5-5-5v10z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tabs;