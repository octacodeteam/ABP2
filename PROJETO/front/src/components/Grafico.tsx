import React, { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";

interface Queimada {
  Estado: string;
}

export const Grafico = ({ filtros }: { filtros: { estado: string, bioma:string, dataInicio: string, dataFim: string } }) => {
  const [dados, setDados] = useState<(string | number)[][]>([]);

  useEffect(() => {
    const params = new URLSearchParams({
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
    });

    if (filtros.estado && filtros.estado !== 'todos') {
      params.append('estado', filtros.estado);
    }

    if (filtros.bioma && filtros.bioma !== 'todos') {
      params.append('bioma', filtros.bioma);
    }

    const url = `http://localhost:3001/api/queimadas?${params.toString()}`;
    fetch(url)
      .then(res => res.json())
      .then((data: Queimada[]) => {
        const contagem: Record<string, number> = {};

        data.forEach(q => {
          contagem[q.Estado] = (contagem[q.Estado] || 0) + 1;
        });

        const resultado: (string | number)[][] = [['Estado', 'Total de Queimadas']];
        for (const estado in contagem) {
          resultado.push([estado, contagem[estado]]);
        }

        setDados(resultado);
      })
      .catch(err => {
        console.error('Erro ao buscar dados para gráfico:', err);
        setDados([]);
      });
  }, [filtros]);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      {dados.length > 1 ? (
        <Chart
          chartType="ColumnChart"
          width="1300px"
          height="500px"
          data={dados}
          options={{
            title: "Total de Queimadas por Estado e Bioma",
            legend: { position: "none" },
            hAxis: { title: "Estado" },
            vAxis: { title: "Quantidade" },
            colors: ['#d73027'],
          }}
        />
      ) : (
        <p>Nenhuma queimada encontrada com os filtros atuais.</p>
      )}
    </div>
  );
};
