import React, { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";
import './style/Grafico.css';

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
  const [frpDados, setFrpDados] = useState<(string | number)[][]>([]);
  const [listagem, setListagem] = useState<EstadoAgrupado[]>([]);

  useEffect(() => {
    const params = new URLSearchParams({
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
    });
    if (filtros.estado !== 'todos') params.append('estado', filtros.estado);
    if (filtros.bioma !== 'todos') params.append('bioma', filtros.bioma);

    const url = `http://localhost:3001/api/queimadas?${params.toString()}`;
    fetch(url)
      .then(res => res.json())
      .then((data: Queimada[]) => {
        const totalPorEstado: Record<string, number> = {};
        const frpPorEstado: Record<string, number[]> = {};
        const agrupamento: Record<string, { frps: number[]; dias: number[] }> = {};

        data.forEach(q => {
          totalPorEstado[q.Estado] = (totalPorEstado[q.Estado] || 0) + 1;
          if (!frpPorEstado[q.Estado]) frpPorEstado[q.Estado] = [];
          frpPorEstado[q.Estado].push(q.FRP);

          const chave = `${q.Estado}-${q.Bioma}`;
          if (!agrupamento[chave]) agrupamento[chave] = { frps: [], dias: [] };
          agrupamento[chave].frps.push(q.FRP);
          agrupamento[chave].dias.push(q.DiaSemChuva);
        });

        const graficoFormatado: (string | number)[][] = [['Estado', 'Total de Queimadas']];
        const frpFormatado: (string | number)[][] = [['Estado', 'FRP Médio']];
        const estadosMap: Record<string, EstadoAgrupado> = {};

        for (const estado in totalPorEstado) {
          // Filtra apenas FRPs positivos
          const frps = frpPorEstado[estado].filter(frp => frp > 0);
          const mediaFRP = frps.length > 0 ? frps.reduce((a, b) => a + b, 0) / frps.length : 0;
          graficoFormatado.push([estado, totalPorEstado[estado]]);
          frpFormatado.push([estado, +mediaFRP.toFixed(2)]);
        }

        for (const chave in agrupamento) {
          const [estado, bioma] = chave.split('-');
          const grupo = agrupamento[chave];
          // Filtra apenas valores positivos
          const frpsPositivos = grupo.frps.filter(frp => frp > 0);
          const diasPositivos = grupo.dias.filter(dia => dia > 0);

          const mediaFRP = frpsPositivos.length > 0 ? frpsPositivos.reduce((a, b) => a + b, 0) / frpsPositivos.length : 0;
          const mediaDias = diasPositivos.length > 0 ? diasPositivos.reduce((a, b) => a + b, 0) / diasPositivos.length : 0;

          if (!estadosMap[estado]) {
            estadosMap[estado] = { Estado: estado, Biomas: [] };
          }

          estadosMap[estado].Biomas.push({
            Bioma: bioma,
            mediaFRP: +mediaFRP.toFixed(2),
            mediaDiasSemChuva: +mediaDias.toFixed(2)
          });
        }

        const listagemFinal = Object.values(estadosMap);

        setGraficoDados(graficoFormatado);
        setFrpDados(frpFormatado);
        setListagem(listagemFinal);
      })
      .catch(err => {
        console.error('Erro ao buscar dados:', err);
        setGraficoDados([]);
        setFrpDados([]);
        setListagem([]);
      });
  }, [filtros]);

  return (
    <div className="dashboard-container">
      <div className="chart-row">
        <div className="chart-box">
          <h3>Total de Queimadas</h3>
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
          <h3>FRP Médio por Estado</h3>
          <Chart
            chartType="ColumnChart"
            width="100%"
            height="300px"
            data={frpDados}
            options={{
              legend: { position: "none" },
              hAxis: { title: "Estado" },
              vAxis: { title: "FRP Médio" },
              colors: ['#1a9850']
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
              const frps = estado.Biomas.map(b => b.mediaFRP).join("\n");
              const dias = estado.Biomas.map(b => b.mediaDiasSemChuva).join("\n");
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