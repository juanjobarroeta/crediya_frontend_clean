import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import Layout from '../components/Layout';
import { API_BASE_URL } from "../utils/constants";

// Function to convert image to base64
const getImageAsBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = imagePath;
  });
};

const LoanQuotes = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneType, setPhoneType] = useState('');
  const [phonePrice, setPhonePrice] = useState('');
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    // Fetch financial products
    axios.get(`${API_BASE_URL}/public/financial-products`)
      .then(res => {
        setProducts(res.data || []);
      })
      .catch(err => console.error('Error fetching financial products:', err));
  }, []);

  const generateQuote = (e) => {
    e.preventDefault();
    console.log('generateQuote fired');
    const product = products.find(p => p.id === selectedProductId);
    console.log('Selected product:', product);
    console.log('Fields:', { customerName, phoneType, phonePrice });
    if (!product || !phonePrice || !customerName || !phoneType) {
      console.log('Missing required fields or product not found');
      return;
    }

    const annualRate = parseFloat(product.interest_rate) / 100;
    const financedAmount = parseFloat(phonePrice);
    
    // Calculate weekly rate from annual rate
    const weeklyRate = annualRate / 52; // 52 weeks in a year
    
    console.log('🔢 Quote Calculation Debug:');
    console.log('Annual Rate:', product.interest_rate + '%');
    console.log('Weekly Rate:', (weeklyRate * 100).toFixed(4) + '%');
    console.log('Principal:', financedAmount);
    console.log('Term Weeks:', product.term_weeks);
    
    // Calculate weekly payment using proper amortization formula
    // PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    // where P = principal, r = weekly rate, n = number of weeks
    const weeklyPayment = financedAmount * (weeklyRate * Math.pow(1 + weeklyRate, product.term_weeks)) / 
                         (Math.pow(1 + weeklyRate, product.term_weeks) - 1);
    
    const totalRepay = weeklyPayment * product.term_weeks;
    
    console.log('Weekly Payment (calculated):', weeklyPayment.toFixed(2));
    console.log('Total Repayment:', totalRepay.toFixed(2));

    // Generate amortization schedule
    const amortizationSchedule = [];
    let balance = financedAmount; // Start with original principal
    for (let i = 1; i <= product.term_weeks; i++) {
      const interestPayment = balance * weeklyRate;
      const principalPayment = weeklyPayment - interestPayment;
      balance -= principalPayment;
      
      // Ensure balance doesn't go below zero
      if (balance < 0) balance = 0;
      
      amortizationSchedule.push({
        week: i,
        payment: weeklyPayment.toFixed(2),
        principal: principalPayment.toFixed(2),
        interest: interestPayment.toFixed(2),
        balance: balance.toFixed(2),
      });
    }

    setQuote({
      customerName,
      phoneType,
      phonePrice: financedAmount.toFixed(2),
      term: product.term_weeks,
      interestRate: annualRate * 100, // Show as percentage
      totalRepay: totalRepay.toFixed(2),
      weeklyPayment: weeklyPayment.toFixed(2),
      amortizationSchedule,
    });
  };

  const downloadPDF = async () => {
    if (!quote) return;

    const doc = new jsPDF();
    
    // Add logo
    try {
      const logoBase64 = await getImageAsBase64('/logo2.png');
      doc.addImage(logoBase64, 'PNG', 20, 5, 30, 20);
    } catch (e) {
      console.log('Logo not available, continuing without it');
    }

    // Header with CrediYa branding
    doc.setFillColor(34, 197, 94); // Green color
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CrediYa', 20, 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Cotización de Préstamo', 20, 45);
    
    // Quote details in a styled box
    doc.setFillColor(240, 240, 240);
    doc.rect(15, 55, 180, 40, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${quote.customerName}`, 20, 65);
    doc.text(`Teléfono: ${quote.phoneType}`, 20, 75);
    doc.text(`Precio: $${quote.phonePrice} MXN`, 20, 85);
    doc.text(`Plazo: ${quote.term} semanas`, 110, 65);
    doc.text(`Pago semanal: $${quote.weeklyPayment} MXN`, 110, 75);
    doc.text(`Tasa de interés: ${quote.interestRate.toFixed(2)}% anual`, 110, 85);
    
    // Summary box
    doc.setFillColor(34, 197, 94);
    doc.rect(15, 105, 180, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen del Préstamo', 20, 115);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total a pagar: $${quote.totalRepay} MXN`, 20, 125);
    doc.text(`Interés total: $${(parseFloat(quote.totalRepay) - parseFloat(quote.phonePrice)).toFixed(2)} MXN`, 110, 125);

    // Amortization table header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Calendario de Amortización', 20, 150);
    
    // Table styling
    const startY = 160;
    let y = startY;
    
    // Table header with green background
    doc.setFillColor(34, 197, 94);
    doc.rect(15, y - 5, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Semana', 20, y);
    doc.text('Pago (MXN)', 45, y);
    doc.text('Principal (MXN)', 75, y);
    doc.text('Interés (MXN)', 110, y);
    doc.text('Saldo (MXN)', 145, y);
    
    y += 8;
    
    // Table rows with alternating colors
    quote.amortizationSchedule.forEach((row, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
        
        // Repeat header on new page
        doc.setFillColor(34, 197, 94);
        doc.rect(15, y - 5, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Semana', 20, y);
        doc.text('Pago (MXN)', 45, y);
        doc.text('Principal (MXN)', 75, y);
        doc.text('Interés (MXN)', 110, y);
        doc.text('Saldo (MXN)', 145, y);
        y += 8;
      }
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y - 3, 180, 6, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(row.week.toString(), 20, y);
      doc.text(`$${row.payment}`, 45, y);
      doc.text(`$${row.principal}`, 75, y);
      doc.text(`$${row.interest}`, 110, y);
      doc.text(`$${row.balance}`, 145, y);
      y += 6;
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Página ${i} de ${pageCount}`, 20, 290);
      doc.text(`Generado el ${new Date().toLocaleDateString('es-MX')}`, 150, 290);
    }

    doc.save(`CotizacionPrestamo_${quote.customerName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto text-white">
          <h2 className="text-2xl font-bold mb-6">Generar Cotización de Préstamo</h2>
          <form
            onSubmit={generateQuote}
            className="bg-black rounded-xl shadow-lg p-6 flex flex-col gap-6 border border-crediyaGreen"
          >
            <div className="flex flex-col md:flex-row md:gap-6">
              <div className="flex-1 flex flex-col gap-2 mb-2 md:mb-0">
                <label className="font-medium">Nombre del cliente:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="bg-black text-white border border-crediyaGreen placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:ring focus:border-crediyaBlue"
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div className="flex-1 flex flex-col gap-2 mb-2 md:mb-0">
                <label className="font-medium">Tipo de teléfono:</label>
                <input
                  type="text"
                  value={phoneType}
                  onChange={e => setPhoneType(e.target.value)}
                  className="bg-black text-white border border-crediyaGreen placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:ring focus:border-crediyaBlue"
                  placeholder="Ej: iPhone 14"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:gap-6">
              <div className="flex-1 flex flex-col gap-2 mb-2 md:mb-0">
                <label className="font-medium">Precio del teléfono (MXN):</label>
                <input
                  type="number"
                  value={phonePrice}
                  onChange={e => setPhonePrice(e.target.value)}
                  className="bg-black text-white border border-crediyaGreen placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:ring focus:border-crediyaBlue"
                  placeholder="Ej: 12000"
                  min="1"
                  required
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="font-medium">Seleccione producto financiero:</label>
                <select
                  onChange={e => setSelectedProductId(Number(e.target.value))}
                  value={selectedProductId}
                  className="bg-black text-white border border-crediyaGreen placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:ring focus:border-crediyaBlue"
                  required
                >
                  <option value="">-- Elegir --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} - {p.term_weeks} semanas @ {p.interest_rate}%
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-crediyaGreen text-black font-bold rounded px-6 py-2 mt-2 hover:bg-white hover:text-crediyaGreen transition"
            >
              Generar Cotización
            </button>
          </form>
          {quote && (
            <div className="bg-black text-white border border-crediyaGreen rounded-xl shadow-md p-6 mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Cotización para {quote.customerName}:
              </h3>
              <div className="flex flex-col md:flex-row md:gap-8 mb-4">
                <div className="flex-1">
                  <p>
                    <span className="font-medium">Tipo de teléfono:</span> {quote.phoneType}
                  </p>
                  <p>
                    <span className="font-medium">Precio del teléfono:</span> ${quote.phonePrice} MXN
                  </p>
                  <p>
                    <span className="font-medium">Plazo:</span> {quote.term} semanas
                  </p>
                </div>
                <div className="flex-1">
                  <p>
                    <span className="font-medium">Pago semanal:</span> ${quote.weeklyPayment} MXN
                  </p>
                  <p>
                    <span className="font-medium">Tasa de interés:</span> {(quote.interestRate * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-base font-semibold mb-2">Tabla de Amortización</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-white border border-crediyaGreen rounded overflow-hidden">
                    <thead className="bg-crediyaGreen text-black font-semibold">
                      <tr>
                        <th className="px-2 py-1 border border-crediyaGreen">Semana</th>
                        <th className="px-2 py-1 border border-crediyaGreen">Pago (MXN)</th>
                        <th className="px-2 py-1 border border-crediyaGreen">Principal (MXN)</th>
                        <th className="px-2 py-1 border border-crediyaGreen">Interés (MXN)</th>
                        <th className="px-2 py-1 border border-crediyaGreen">Saldo (MXN)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.amortizationSchedule.map(row => (
                        <tr key={row.week} className="odd:bg-black even:bg-zinc-900">
                          <td className="px-2 py-1 border border-crediyaGreen text-center">{row.week}</td>
                          <td className="px-2 py-1 border border-crediyaGreen text-center">${row.payment}</td>
                          <td className="px-2 py-1 border border-crediyaGreen text-center">${row.principal}</td>
                          <td className="px-2 py-1 border border-crediyaGreen text-center">${row.interest}</td>
                          <td className="px-2 py-1 border border-crediyaGreen text-center">${row.balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="bg-crediyaGreen text-black font-bold rounded px-4 py-2 mt-6 hover:bg-white hover:text-crediyaGreen transition"
                  onClick={downloadPDF}
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          )}
        </div>
    </Layout>
  );
};

export default LoanQuotes;
