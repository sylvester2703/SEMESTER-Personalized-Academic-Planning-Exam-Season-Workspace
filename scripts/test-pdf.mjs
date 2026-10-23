import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

console.log('Testing PDF table generation...');
const doc = new jsPDF();

function applyTable(doc, options) {
  if (typeof autoTable === 'function') {
    autoTable(doc, options);
  } else if (typeof autoTable.default === 'function') {
    autoTable.default(doc, options);
  } else if (typeof doc.autoTable === 'function') {
    doc.autoTable(options);
  } else {
    throw new Error('jspdf-autotable is not callable');
  }
}

try {
  applyTable(doc, {
    head: [['Col 1', 'Col 2']],
    body: [['Val 1', 'Val 2']],
  });
  console.log('PDF table rendered successfully!');
  const output = doc.output('arraybuffer');
  console.log(`Generated PDF byte size: ${output.byteLength}`);
} catch (e) {
  console.error('Failed to generate table:', e);
}
