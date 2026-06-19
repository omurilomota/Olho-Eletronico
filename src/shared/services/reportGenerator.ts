import type { Position } from '../../modules/saot/store/useSaotStore';
import type { OffsideResult } from '../../modules/saot/services/OffsideCalculator';

export interface ReportData {
  attacker: Position;
  defender: Position;
  goalkeeper: Position;
  result: OffsideResult;
  timestamp: Date;
}

export async function generatePDF(data: ReportData): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Relatorio de Analise de Impedimento', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Olho Eletronico — Impedimento Milimetrico 4.0', 20, 28);
  doc.text(`Data: ${data.timestamp.toLocaleDateString('pt-BR')} ${data.timestamp.toLocaleTimeString('pt-BR')}`, 20, 34);

  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.line(20, 38, 190, 38);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Posicoes dos Jogadores', 20, 48);

  autoTable(doc, {
    startY: 52,
    head: [['Jogador', 'Numero', 'Posicao X', 'Posicao Z']],
    body: [
      ['Atacante', '9', `${data.attacker.x.toFixed(2)} m`, `${data.attacker.z.toFixed(2)} m`],
      ['Defensor', '4', `${data.defender.x.toFixed(2)} m`, `${data.defender.z.toFixed(2)} m`],
      ['Goleiro', '1', `${data.goalkeeper.x.toFixed(2)} m`, `${data.goalkeeper.z.toFixed(2)} m`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 10 },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultado da Analise', 20, finalY);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Parametro', 'Valor']],
    body: [
      ['Resultado', data.result.isOffside ? 'IMPEDIDO' : 'LEGAL'],
      ['Margem', `${Math.abs(data.result.marginCm).toFixed(2)} cm`],
      ['Posicao do Atacante (X)', `${data.attacker.x.toFixed(2)} m`],
      ['Linha de Impedimento (X)', `${data.defender.x.toFixed(2)} m`],
    ],
    theme: 'grid',
    headStyles: { fillColor: data.result.isOffside ? [239, 68, 68] : [34, 197, 94] },
    styles: { fontSize: 10 },
  });

  const footerY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128);
  doc.text(
    'Relatorio gerado automaticamente pelo sistema Olho Eletronico — Copa do Mundo FIFA 2026',
    20,
    footerY,
  );

  doc.save(`relatorio-impedimento-${data.timestamp.toISOString().slice(0, 10)}.pdf`);
}
