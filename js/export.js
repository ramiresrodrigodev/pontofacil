// ── Exportação de relatório (PDF e Excel) ─────────────────────────
// Geração no próprio navegador (jsPDF + SheetJS via CDN, carregados sob
// demanda). Funciona com ou sem backend — inclusive no demo do GitHub Pages.

import { calcMins, fmtH } from './helpers.js';

const CDN = {
  jspdf:     'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
  autotable: 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js',
  xlsx:      'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
};

/** Carrega um script externo uma única vez. */
function carregarScript(src) {
  return new Promise((resolve, reject) => {
    if ([...document.scripts].some(s => s.src === src)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Falha ao carregar biblioteca de exportação.'));
    document.head.appendChild(s);
  });
}

const arquivoBase = rel => `relatorio_${rel.funcNome.replace(/\s+/g, '_')}_${rel.mes}`;

/** Linhas do resumo (métrica → valor formatado). */
function linhasResumo(rel) {
  const bh = (rel.bh >= 0 ? '+' : '−') + fmtH(Math.abs(rel.bh));
  return [
    ['Horas trabalhadas', fmtH(rel.tot)],
    ['Horas extras',      fmtH(rel.ext)],
    ['Horas faltantes',   fmtH(rel.fal)],
    ['Banco de horas',    bh],
    ['Dias trabalhados',  String(rel.dt)],
    ['Dias de folga',     String(rel.df)],
    ['Atrasos',           String(rel.atr)],
  ];
}

/** Linhas dos registros diários. */
function linhasRegistros(rel) {
  return [...rel.registros]
    .sort((a, b) => a.data.localeCompare(b.data))
    .map(p => {
      const m = calcMins(p);
      return [
        p.data,
        p.entrada || '—',
        p.alSaida || '—',
        p.alRetorno || '—',
        p.saida || '—',
        m > 0 ? fmtH(m) : '—',
        p.status || '—',
      ];
    });
}

// ── PDF ───────────────────────────────────────────────────────────

export async function exportarPDF(rel) {
  await carregarScript(CDN.jspdf);
  await carregarScript(CDN.autotable);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229);
  doc.text('PontoFácil — Relatório Mensal', 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(40);
  doc.text(`Funcionário: ${rel.funcNome}`, 14, 28);
  if (rel.funcCargo) doc.text(`Cargo: ${rel.funcCargo}`, 14, 34);
  doc.text(`Mês de referência: ${rel.mes}`, 14, 40);

  doc.autoTable({
    startY: 46,
    head: [['Resumo', 'Valor']],
    body: linhasResumo(rel),
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 10 },
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Data', 'Entrada', 'S. Almoço', 'Retorno', 'Saída', 'Total', 'Status']],
    body: linhasRegistros(rel),
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 },
  });

  const fim = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, fim);

  doc.save(`${arquivoBase(rel)}.pdf`);
}

// ── Excel ─────────────────────────────────────────────────────────

export async function exportarExcel(rel) {
  await carregarScript(CDN.xlsx);
  const XLSX = window.XLSX;
  const wb = XLSX.utils.book_new();

  const resumo = [
    ['PontoFácil — Relatório Mensal'],
    ['Funcionário', rel.funcNome],
    ['Cargo', rel.funcCargo || ''],
    ['Mês de referência', rel.mes],
    [],
    ['Resumo', 'Valor'],
    ...linhasResumo(rel),
  ];
  const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
  wsResumo['!cols'] = [{ wch: 22 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

  const registros = [
    ['Data', 'Entrada', 'S. Almoço', 'Retorno', 'Saída', 'Total (min)', 'Status'],
    ...[...rel.registros]
      .sort((a, b) => a.data.localeCompare(b.data))
      .map(p => [
        p.data, p.entrada || '', p.alSaida || '', p.alRetorno || '', p.saida || '',
        calcMins(p), p.status || '',
      ]),
  ];
  const wsReg = XLSX.utils.aoa_to_sheet(registros);
  wsReg['!cols'] = [{ wch: 12 }, { wch: 9 }, { wch: 10 }, { wch: 9 }, { wch: 9 }, { wch: 11 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsReg, 'Registros');

  XLSX.writeFile(wb, `${arquivoBase(rel)}.xlsx`);
}
