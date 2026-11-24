// WBS 4.1.3 — PDF and Excel Report Export
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// services/exportService.js - gumagawa ng totoong PDF at Excel files (4.1.3)
// sections = [{ title, columns: ['Item', 'Value'], rows: [[...], [...]] }]
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const safeName = (t) => String(t || 'report').replace(/[^a-z0-9-_ ]/gi, '').replace(/\s+/g, '-');

async function sendExcel(res, title, sections) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Report');

  ws.addRow([title]).font = { bold: true, size: 16 };
  for (const sec of sections) {
    ws.addRow([]);
    ws.addRow([sec.title]).font = { bold: true, size: 13 };
    const head = ws.addRow(sec.columns);
    head.font = { bold: true };
    head.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F3EA' } }; });
    sec.rows.forEach((r) => ws.addRow(r));
  }
  ws.columns.forEach((c) => { c.width = 24; }); // lapad ng bawat column

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName(title)}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
}

function sendPdf(res, title, sections) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName(title)}.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).text(title);
  doc.fontSize(9).fillColor('#666').text(`Generated ${new Date().toLocaleString()}`).fillColor('#000');

  const left = 40;
  const width = doc.page.width - 80;

  for (const sec of sections) {
    doc.moveDown(1).fontSize(13).font('Helvetica-Bold').text(sec.title);
    doc.moveDown(0.4);
    const colW = width / sec.columns.length;

    // isang row ng table. fixed ang taas para madaling i-page break
    const drawRow = (cells, bold) => {
      if (doc.y > doc.page.height - 70) doc.addPage();
      const y = doc.y;
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10);
      cells.forEach((c, i) => {
        doc.text(String(c ?? ''), left + i * colW, y, { width: colW - 8, height: 14, ellipsis: true, lineBreak: false });
      });
      doc.y = y + 18;
    };

    drawRow(sec.columns, true);
    doc.moveTo(left, doc.y - 4).lineTo(left + width, doc.y - 4).strokeColor('#bbb').stroke();
    sec.rows.forEach((r) => drawRow(r, false));
  }
  doc.end();
}

module.exports = { sendExcel, sendPdf };
