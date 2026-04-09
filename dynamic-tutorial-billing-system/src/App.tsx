import React, { useState, useRef, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  School, 
  User, 
  Calendar, 
  Hash, 
  CreditCard,
  FileText,
  ChevronRight,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2pdf from 'html2pdf.js';

interface BillItem {
  id: string;
  description: string;
  amount: number;
}

interface BillData {
  centerName: string;
  centerAddress: string;
  centerContact: string;
  centerLogo: string;
  signatureImage: string; // Added for permanent signature
  studentName: string;
  studentClass: string;
  rollNumber: string;
  billDate: string;
  billNumber: string;
  items: BillItem[];
  discount: number;
  taxRate: number;
  notes: string;
}

const initialData: BillData = {
  centerName: 'Dynamic Tutorial',
  centerAddress: '102/11 Vijay Nagar, Kanpur - 208005',
  centerContact: '+91 9598747692 | contact@dynamictutorial.in',
  // INSERT LOGO LINK BELOW
  centerLogo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiZO3-szpYL5vsyoxXvpHdf3YFOCH-G8Yss5YdTHtjpRUbFfhp8u-YOIio-3ODh7OrN8-WYeQ9DqD4pUZwLff2pu-GXXKLD3z6n9gz2f_qc4c5VSvfMApfalYssJJlQpf95UvJD87S4DETdVjilsk6T569cPzeG0OFxnfPiiUoyaqx9Vvr486BMhQjBHPhr/s320/Dynamic%20Tutorial%20Logo.png", 
  // INSERT SIGNATURE IMAGE LINK BELOW
  signatureImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhLhh29EHogcVMJHb9L9cjln6xmCD-DZS4dAgFPNyVDeUTocbU14M30kfzLJFan1W0jaAvNGlBAZU_Pwz8LPR95VJNmSG5f2Q6bWe4H95tkfYssFSYBwCrIot3TAZhhGwaJRPx5I7AYlCoZN5jYFLDN2woYCu_YyOl_iAYDiWahtjFuhI2lmMRw3pJOB0qO/s320/Harsh%20Kumar%20Resume.jpg", 
  studentName: '',
  studentClass: '',
  rollNumber: '',
  billDate: new Date().toISOString().split('T')[0],
  billNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
  items: [
    { id: '1', description: 'Monthly Tuition Fee', amount: 2500 },
  ],
  discount: 0,
  taxRate: 0,
  notes: 'Thank you for your payment. Please keep this receipt for your records.'
};

export default function App() {
  const [data, setData] = useState<BillData>(initialData);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const printRef = useRef<HTMLDivElement>(null);

  const subtotal = useMemo(() => {
    return data.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [data.items]);

  const taxAmount = useMemo(() => {
    return (subtotal * (Number(data.taxRate) || 0)) / 100;
  }, [subtotal, data.taxRate]);

  const total = useMemo(() => {
    return subtotal + taxAmount - (Number(data.discount) || 0);
  }, [subtotal, taxAmount, data.discount]);

  const addItem = () => {
    const newItem: BillItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      amount: 0
    };
    setData({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    setData({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  const updateItem = (id: string, field: keyof BillItem, value: string | number) => {
    setData({
      ...data,
      items: data.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, centerLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (printRef.current) {
      const element = printRef.current;
      const opt = {
        margin: 0,
        filename: `${data.studentName || 'Bill'}_${data.billNumber}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 no-print">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.centerLogo ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100">
                <img 
                  src={data.centerLogo} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="bg-indigo-600 p-2 rounded-lg">
                <School className="text-white w-5 h-5" />
              </div>
            )}
            <h1 className="font-bold text-xl tracking-tight text-slate-800">CoachBill</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'edit' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Edit Bill
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'preview' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Preview
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Bill
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print"
            >
              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Coaching Center Info */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-6 text-indigo-600">
                    <Settings className="w-5 h-5" />
                    <h2 className="font-semibold text-lg">Coaching Center Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Center Name</label>
                      <input
                        type="text"
                        value={data.centerName}
                        onChange={(e) => setData({ ...data, centerName: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. Excellence Academy"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Center Logo (Circular)</label>
                      <div className="flex items-center gap-3">
                        {data.centerLogo && (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                            <img src={data.centerLogo} alt="Logo Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Contact Info</label>
                      <input
                        type="text"
                        value={data.centerContact}
                        onChange={(e) => setData({ ...data, centerContact: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="Phone, Email"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Address</label>
                      <textarea
                        value={data.centerAddress}
                        onChange={(e) => setData({ ...data, centerAddress: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-20"
                        placeholder="Full Address"
                      />
                    </div>
                  </div>
                </section>

                {/* Student Info */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-6 text-indigo-600">
                    <User className="w-5 h-5" />
                    <h2 className="font-semibold text-lg">Student Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Student Name</label>
                      <input
                        type="text"
                        value={data.studentName}
                        onChange={(e) => setData({ ...data, studentName: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Class/Grade</label>
                      <input
                        type="text"
                        value={data.studentClass}
                        onChange={(e) => setData({ ...data, studentClass: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. 10th Standard"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Roll Number</label>
                      <input
                        type="text"
                        value={data.rollNumber}
                        onChange={(e) => setData({ ...data, rollNumber: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. 101"
                      />
                    </div>
                  </div>
                </section>

                {/* Fee Items */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <CreditCard className="w-5 h-5" />
                      <h2 className="font-semibold text-lg">Fee Items</h2>
                    </div>
                    <button
                      onClick={addItem}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {data.items.map((item, index) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 items-end"
                      >
                        <div className="flex-1 space-y-1">
                          {index === 0 && <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>}
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Tuition Fee"
                          />
                        </div>
                        <div className="w-32 space-y-1">
                          {index === 0 && <label className="text-xs font-semibold text-slate-500 uppercase">Amount</label>}
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="0.00"
                          />
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={data.items.length === 1}
                          className="p-2.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column: Summary & Settings */}
              <div className="space-y-6">
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
                  <div className="flex items-center gap-2 mb-6 text-indigo-600">
                    <FileText className="w-5 h-5" />
                    <h2 className="font-semibold text-lg">Bill Summary</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Tax Rate (%)</span>
                        <input
                          type="number"
                          value={data.taxRate}
                          onChange={(e) => setData({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-right outline-none"
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tax Amount</span>
                        <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Discount (₹)</span>
                        <input
                          type="number"
                          value={data.discount}
                          onChange={(e) => setData({ ...data, discount: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-right outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">Total Amount</span>
                        <span className="text-xl font-bold text-indigo-600">₹{total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Bill Date</label>
                        <input
                          type="date"
                          value={data.billDate}
                          onChange={(e) => setData({ ...data, billDate: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Bill Number</label>
                        <input
                          type="text"
                          value={data.billNumber}
                          onChange={(e) => setData({ ...data, billNumber: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('preview')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      Generate Preview
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex justify-center"
            >
              <div 
                ref={printRef}
                className="bg-white w-full max-w-[800px] shadow-2xl rounded-sm p-12 border border-slate-100 min-h-[1000px] flex flex-col"
              >
                {/* Bill Header */}
                <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-8 mb-8">
                  <div className="flex gap-4 items-center">
                    {data.centerLogo && (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 flex-shrink-0">
                        <img 
                          src={data.centerLogo} 
                          alt="Logo" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-1 uppercase tracking-tight leading-tight">{data.centerName}</h1>
                      <p className="text-slate-500 max-w-xs text-xs leading-relaxed">{data.centerAddress}</p>
                      <p className="text-slate-600 font-medium mt-1 text-xs">{data.centerContact}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-indigo-600 text-white px-4 py-1 inline-block font-bold text-xl mb-4">INVOICE</div>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-400">Invoice No: <span className="text-slate-900 font-bold">{data.billNumber}</span></p>
                      <p className="text-slate-400">Date: <span className="text-slate-900 font-bold">{new Date(data.billDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                    </div>
                  </div>
                </div>

                {/* Bill To */}
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h3 className="text-xs font-bold text-indigo-600 uppercase mb-3 tracking-widest">Bill To Student</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <p className="font-bold text-slate-800 text-lg">{data.studentName || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-600">Class: <span className="font-semibold">{data.studentClass || 'N/A'}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-600">Roll No: <span className="font-semibold">{data.rollNumber || 'N/A'}</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-end">
                    <div className="text-right">
                      <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-tighter">Amount Due</p>
                      <p className="text-4xl font-black text-indigo-600">₹{total.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="flex-grow">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="py-4 font-bold text-slate-800 uppercase text-xs tracking-widest">#</th>
                        <th className="py-4 font-bold text-slate-800 uppercase text-xs tracking-widest">Description</th>
                        <th className="py-4 font-bold text-slate-800 uppercase text-xs tracking-widest text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item, index) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="py-4 text-slate-500 font-mono text-sm">{index + 1}</td>
                          <td className="py-4 text-slate-800 font-medium">{item.description || 'Untitled Fee'}</td>
                          <td className="py-4 text-slate-800 font-bold text-right">₹{item.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-8 flex justify-end">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-slate-500 text-sm">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-slate-500 text-sm">
                        <span>Tax ({data.taxRate}%)</span>
                        <span className="font-bold text-slate-800">₹{taxAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {data.discount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span>Discount</span>
                        <span className="font-bold">-₹{data.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t-2 border-indigo-600 flex justify-between items-center">
                      <span className="font-bold text-slate-900">Grand Total</span>
                      <span className="text-2xl font-black text-indigo-600">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-20 pt-10 border-t border-slate-100 grid grid-cols-2 gap-10">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Notes & Terms</h4>
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      {data.notes}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end justify-end">
                    {data.signatureImage && (
                      <div className="mb-2">
                        <img 
                          src={data.signatureImage} 
                          alt="Signature" 
                          className="h-12 w-auto object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="w-40 border-b border-slate-300 mb-2"></div>
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">Authorized Signatory</p>
                    <p className="text-[10px] text-slate-400 mt-1">Computer Generated Receipt</p>
                  </div>
                </div>
              </div>

              {/* Floating Action Bar for Preview */}
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 no-print">
                <button
                  onClick={() => setActiveTab('edit')}
                  className="text-slate-600 hover:text-indigo-600 font-medium text-sm px-4 py-2 transition-colors"
                >
                  Back to Edit
                </button>
                <div className="w-px h-6 bg-slate-200"></div>
                <button
                  onClick={handleDownloadPDF}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Print Only View (Hidden in UI) */}
      <div className="print-only p-8">
        {/* This will be rendered only when printing */}
        {/* The print stylesheet handles the visibility */}
      </div>
    </div>
  );
}
