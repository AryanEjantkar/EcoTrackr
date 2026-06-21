"use client";

import { useState } from "react";
import { 
  Bell, 
  Upload, 
  Camera, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Check, 
  AlertCircle,
  HelpCircle,
  Clock,
  Coins
} from "lucide-react";
import { api } from "@/utils/api";

interface PresetTemplate {
  name: string;
  type: string;
  filename: string;
  icon: string;
}

const templates: PresetTemplate[] = [
  { name: "Electricity Utility Bill", type: "Utility Bill", filename: "electric_utility_june.pdf", icon: "utility" },
  { name: "Delta Flight Ticket", type: "Travel Ticket", filename: "boarding_pass_flight.jpg", icon: "ticket" },
  { name: "Trader Joe's Grocery", type: "Store Receipt", filename: "organic_market_receipt.png", icon: "receipt" }
];

export default function OCRScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  const [result, setResult] = useState<any>(null);
  
  // Editable form states
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Energy");
  const [subcategory, setSubcategory] = useState("Electricity");
  const [quantity, setQuantity] = useState(0);
  const [quantityUnit, setQuantityUnit] = useState("kWh");
  const [cost, setCost] = useState(0);
  
  const [saved, setSaved] = useState(false);

  const simulateOCR = async (fileName: string) => {
    setScanning(true);
    setResult(null);
    setSaved(false);
    
    // Create a dummy file for the scan API
    const dummyFile = new File(["dummy"], fileName, { type: "image/png" });
    
    // Simulate multi-step OCR parsing logs
    const steps = ["Reading document layers...", "Extracting OCR text boundaries...", "Scanning line-by-line...", "Identifying carbon-heavy items...", "Running emission estimations..."];
    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise(r => setTimeout(r, 650));
    }
    
    try {
      const response = await api.scanReceipt(dummyFile);
      if (response.success && response.extracted_data) {
        const data = response.extracted_data;
        setResult(data);
        setItemName(data.item_name);
        setCategory(data.category);
        setSubcategory(data.subcategory);
        setQuantity(data.quantity);
        setQuantityUnit(data.quantity_unit);
        setCost(data.total_cost);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
      setScanStep("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    // Create a visual blob url for image preview
    setPreviewUrl(URL.createObjectURL(uploadedFile));
    simulateOCR(uploadedFile.name);
  };

  const handlePresetSelect = (template: PresetTemplate) => {
    // Simulated preset upload
    setFile(new File(["dummy"], template.filename));
    setPreviewUrl(null); // No actual file preview URL, we can display a mock document mockup instead
    simulateOCR(template.filename);
  };

  const handleSaveToLogs = async () => {
    if (!category || quantity <= 0) return;
    
    setScanning(true); // show loader spinner
    try {
      await api.logActivity({
        category,
        subcategory,
        quantity,
        notes: `Extracted from scanned: ${itemName} ($${cost.toFixed(2)})`
      });
      setSaved(true);
      setResult(null);
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 animate-fade-in max-w-5xl mx-auto w-full">
      
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">AI Receipt & Bill Scanner</h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5 font-sans">Extract products and billing metrics into carbon values</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-zinc-100 transition relative">
            <Bell size={18} />
          </button>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            YU
          </div>
        </div>
      </header>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Drag-drop Zone & Preset list (40% width) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* File Upload zone */}
          <div className="glass-card rounded-2xl p-6 text-center border-dashed border-white/10 hover:border-emerald-500/35 transition cursor-pointer relative overflow-hidden group">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={scanning}
            />
            
            <div className="flex flex-col items-center justify-center p-6 gap-3">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl group-hover:scale-105 transition-transform duration-200">
                <Upload size={28} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-200">Upload Receipt or Bill</h3>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed max-w-[200px] mx-auto">
                  Drag and drop PNG, JPG, or PDF. Max file size: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Test Presets list */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
              <Sparkles size={12} className="text-emerald-400" />
              <span>Sandbox Test Templates</span>
            </div>

            <div className="space-y-2">
              {templates.map((temp, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(temp)}
                  disabled={scanning}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.01] transition text-left cursor-pointer group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition">
                        {temp.name}
                      </h4>
                      <p className="text-[9px] text-zinc-500 font-medium mt-0.5">{temp.type}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-zinc-500 group-hover:text-emerald-400 transition" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Document view, Scanner and Form values (70% width) */}
        <div className="lg:col-span-7">
          
          {/* Laser scanning panel */}
          {scanning ? (
            <div className="glass-card rounded-2xl p-12 min-h-[350px] flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
              {/* Laser Line Animation */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-400/80 shadow-[0_0_8px_4px_rgba(16,185,129,0.4)] animate-bounce" style={{ animationDuration: "3.5s" }}></div>
              
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Camera size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-200">AI OCR Scanner Active</h3>
                <p className="text-xs text-zinc-500 font-mono mt-1 animate-pulse">{scanStep}</p>
              </div>
            </div>
          ) : saved ? (
            <div className="glass-card rounded-2xl p-12 min-h-[350px] flex flex-col items-center justify-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Check size={26} strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Carbon Log Approved</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-[250px] mx-auto">
                  Receipt values have been registered. Your carbon analytics and scores are now updated.
                </p>
              </div>
              <button 
                onClick={() => setSaved(false)}
                className="mt-2 text-xs font-bold text-emerald-400 underline cursor-pointer"
              >
                Scan another document
              </button>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Results editing form layout */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div>
                    <h3 className="text-sm font-extrabold tracking-widest text-emerald-400 uppercase">Scanned Details</h3>
                    <p className="text-[9px] text-zinc-500 font-medium">Review and modify the values below</p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.75 rounded-md font-mono font-bold">
                    Confidence: {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Item Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Vendor / Item Name</label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="glass-input p-3 text-xs sm:text-sm"
                    />
                  </div>

                  {/* Price */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Price Paid ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={cost}
                      onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                      className="glass-input p-3 text-xs sm:text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="glass-input p-3 text-xs sm:text-sm"
                    >
                      <option value="Transportation" className="bg-zinc-900">Transportation</option>
                      <option value="Food" className="bg-zinc-900">Food</option>
                      <option value="Energy" className="bg-zinc-900">Energy</option>
                      <option value="Shopping" className="bg-zinc-900">Shopping</option>
                      <option value="Travel" className="bg-zinc-900">Travel</option>
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Quantity</label>
                    <input
                      type="number"
                      step="any"
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                      className="glass-input p-3 text-xs sm:text-sm font-mono"
                    />
                  </div>

                  {/* Unit */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Unit</label>
                    <input
                      type="text"
                      value={quantityUnit}
                      onChange={(e) => setQuantityUnit(e.target.value)}
                      className="glass-input p-3 text-xs sm:text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Estimate footprint display panel */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Estimated Carbon Impact</h4>
                      <p className="text-[9px] text-zinc-500 font-medium">Calculated dynamically using factors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-rose-300 font-mono">
                      {(quantity * (category === "Energy" ? 0.82 : category === "Transportation" ? 0.15 : 0.6)).toFixed(1)}kg
                    </span>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider font-mono">CO₂e</p>
                  </div>
                </div>

                <button
                  onClick={handleSaveToLogs}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs sm:text-sm cursor-pointer transition shadow-lg shadow-emerald-500/10"
                >
                  <Check size={16} />
                  <span>Approved & Save to Logs</span>
                </button>

              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 min-h-[350px] flex flex-col items-center justify-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-300">OCR Extractor Idle</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-[220px] mx-auto">
                  Upload a bill or select a test preset template to begin AI carbon extraction.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
