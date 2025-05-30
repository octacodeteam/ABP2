import './App.css';
import { useState } from 'react';
import Footer from './components/Footer';
import Tabs from './components/Tabs';

function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [activeTab, setActiveTab] = useState<'mapas' | 'imagens'>('mapas');

  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };

  return (
    <div className="app">
      {showAbout ? (
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
            </div>
            <div className="hero-image">
              <img src="./Illustration.png" alt="Imagem de queimadas" />
            </div>
          </div>
        </main>
      ) : (
        <Tabs 
          activeTab={activeTab} 
          onTabChange={(tab: string) => {
            if (tab === 'mapas' || tab === 'imagens') setActiveTab(tab);
          }} 
        />
      )}

      <Footer 
        companyName="OCTACODE" 
        projectName="Queimadas em Foco" 
        onCompanyClick={toggleAbout}
      />
    </div>
  );
}

export default App;