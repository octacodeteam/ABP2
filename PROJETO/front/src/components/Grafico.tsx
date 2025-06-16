import React, { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";
import './style/Grafico.css';

interface CidadeFRP {
  Municipio: string;
  Estado: string;
  media_frp: number;
  media_dias: number;
}

interface Queimada {
  Estado: string;
  Bioma: string;
  FRP: number;
  DiaSemChuva: number;
}

interface EstadoAgrupado {
  Estado: string;
  Biomas: {
    Bioma: string;
    mediaFRP: number;
    mediaDiasSemChuva: number;
  }[];
}

export const Grafico = ({ filtros }: { filtros: { estado: string, bioma: string, dataInicio: string, dataFim: string } }) => {
  const [graficoDados, setGraficoDados] = useState<(string | number)[][]>([]);
  const [frpCidadesDados, setFrpCidadesDados] = useState<any[][]>([]);
  const [listagem, setListagem] = useState<EstadoAgrupado[]>([]);

  useEffect(() => {
    const params = new URLSearchParams({
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
    });
    if (filtros.estado !== 'todos') params.append('estado', filtros.estado);
    if (filtros.bioma !== 'todos') params.append('bioma', filtros.bioma);

    const urlQueimadas = `http://localhost:3001/api/queimadas?${params.toString()}`;
    const urlTopCidades = `http://localhost:3001/api/top-cidades-frp?${params.toString()}`;

    Promise.all([
      fetch(urlQueimadas).then(res => res.json()),
      fetch(urlTopCidades).then(res => res.json())
    ])
      .then(([dataQueimadas, dataTopCidades]: [Queimada[], CidadeFRP[]]) => {
        const totalPorEstado: Record<string, number> = {};
        const estadosMap: Record<string, EstadoAgrupado> = {};

        const frpFormatado: any[][] = [['Cidade', 'FRP Médio', { role: 'tooltip', type: 'string', p: { html: true } }]];
        dataTopCidades.forEach(cidade => {
          const frpLabel = cidade.media_frp < 0 ? "Sem dados coletados" : `${cidade.media_frp.toFixed(2)}`;
          const diasLabel = cidade.media_dias < 0 ? "Sem dados coletados" : `${cidade.media_dias.toFixed(2)}`;

          const tooltip = `
            <div style="padding:10px">
              <strong>${cidade.Municipio} - ${cidade.Estado}</strong><br/>
              FRP Médio: <b>${frpLabel}</b><br/>
              Dias sem chuva: <b>${diasLabel}</b>
            </div>
          `;
          frpFormatado.push([
            cidade.Municipio,
            cidade.media_frp < 0 ? 0 : +cidade.media_frp.toFixed(2),
            tooltip
          ]);
        });

        dataQueimadas.forEach(q => {
          totalPorEstado[q.Estado] = (totalPorEstado[q.Estado] || 0) + 1;

          const chave = `${q.Estado}-${q.Bioma}`;
          if (!estadosMap[q.Estado]) estadosMap[q.Estado] = { Estado: q.Estado, Biomas: [] };

          const biomaIndex = estadosMap[q.Estado].Biomas.findIndex(b => b.Bioma === q.Bioma);
          if (biomaIndex === -1) {
            estadosMap[q.Estado].Biomas.push({
              Bioma: q.Bioma,
              mediaFRP: q.FRP,
              mediaDiasSemChuva: q.DiaSemChuva
            });
          }
        });

        const graficoFormatado: (string | number)[][] = [['Estado', 'Total de Queimadas']];
        for (const estado in totalPorEstado) {
          graficoFormatado.push([estado, totalPorEstado[estado]]);
        }

        setGraficoDados(graficoFormatado);
        setFrpCidadesDados(frpFormatado);
        setListagem(Object.values(estadosMap));
      })
      .catch(err => {
        console.error('Erro ao buscar dados:', err);
        setGraficoDados([]);
        setFrpCidadesDados([]);
        setListagem([]);
      });
  }, [filtros]);

  return (
    <div className="dashboard-container">
      <div className="chart-row">
        <div className="chart-box">
          <h3>Total de Queimadas por Estado</h3>
          <Chart
            chartType="ColumnChart"
            width="100%"
            height="300px"
            data={graficoDados}
            options={{
              legend: { position: "none" },
              hAxis: { title: "Estado" },
              vAxis: { title: "Quantidade" },
              colors: ['#d73027']
            }}
          />
        </div>
        <div className="chart-box">
          <h3>Top 10 Cidades com Maior FRP</h3>
          <Chart
            chartType="ColumnChart"
            width="100%"
            height="300px"
            data={frpCidadesDados}
            options={{
              legend: { position: "none" },
              hAxis: { title: "Cidade" },
              vAxis: { title: "FRP Médio" },
              colors: ['#1a9850'],
              tooltip: { isHtml: true }
            }}
          />
        </div>
      </div>
      <div className="listagem">
        <h3>Intensidade das Queimadas por Estado e Bioma</h3>
        <table>
          <thead>
            <tr>
              <th>Estado</th>
              <th>Biomas</th>
              <th>FRP Médio</th>
              <th>Dias Sem Chuva Médio</th>
            </tr>
          </thead>
          <tbody>
            {listagem.map((estado, idx) => {
              const biomas = estado.Biomas.map(b => b.Bioma).join("\n");
              const frps = estado.Biomas.map(b =>
                b.mediaFRP < 0 ? "Sem dados coletados" : b.mediaFRP.toFixed(2)
              ).join("\n");
              const dias = estado.Biomas.map(b =>
                b.mediaDiasSemChuva < 0 ? "Sem dados coletados" : b.mediaDiasSemChuva.toFixed(2)
              ).join("\n");

              return (
                <tr key={idx}>
                  <td>{estado.Estado}</td>
                  <td><pre>{biomas}</pre></td>
                  <td><pre>{frps}</pre></td>
                  <td><pre>{dias}</pre></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
