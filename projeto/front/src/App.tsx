import './App.css';
import { useState } from 'react';
import Footer from './components/Footer';
import Tabs from './components/Tabs';

function App() {
  const [showTabs, setShowTabs] = useState(false);
  const [activeTab, setActiveTab] = useState<'mapas' | 'imagens' | 'relatorios'>('mapas');

  return (
    <div className="app">
      {/* Barra de navegação superior */}
      <nav className="navbar">
        <div className="nav-links">
          <button
            className={`nav-button ${!showTabs ? 'active' : ''}`}
            onClick={() => setShowTabs(false)}
          >
            Página Inicial
          </button>
          <button
            className={`nav-button ${showTabs ? 'active' : ''}`}
            onClick={() => setShowTabs(true)}
          >
            Monitoramento
          </button>
        </div>
      </nav>

      {/* Renderização condicional do conteúdo */}
      {!showTabs ? (
        <main className="main-content">
          <div className="hero-section">
            <div className="hero-text">
              <h1 className="title">Queimadas em Foco</h1>
              <p className="description">
                Site dedicado ao monitoramento e divulgação de informações sobre incêndios
                florestais e queimadas em diversas regiões. Ele oferece dados atualizados por meio
                de mapas interativos, imagens de satélite e relatórios técnicos, auxiliando na
                prevenção e combate ao fogo.
              </p>
              <button className="learn-more">Saiba Mais</button>
            </div>
            <div className="hero-image">
              <img src="./public/Illustration.png" alt="Imagem de queimadas" />
            </div>
          </div>
        </main>
      ) : (
        <Tabs activeTab={activeTab} onTabChange={(tab: string) => setActiveTab(tab as 'mapas' | 'imagens' | 'relatorios')} />
      )}

      {/* Footer como componente */}
      <Footer companyName="OCTACODE" projectName="Queimadas em Foco" />
    </div>
  );
}

export default App;