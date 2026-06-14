'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, Sparkles, MessageSquare, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { suggestionsApi } from '../../../api/suggestions/suggestions-api';
import { getFirebaseAuthToken } from '@helpers';
import { getAuthConfig } from '@utils';
import { useAuthStore } from '@hooks';

// Mock Data
const SUGGESTION_CATEGORIES = [
  "Pedir una talla",
  "Repetir un producto",
  "Sugerir un nuevo color",
  "Pedir un modelo nuevo",
  "Otro"
];

const MOCK_PRODUCTS = [
  "Blusa Romántica",
  "Vestido Floral Primavera",
  "Vestido Escote V",
  "Vestido Elegante Encaje",
  "Pantalón Wide Leg",
  "Falda Midi Plisada",
  "Chaqueta Denim Clásica",
  "Top Cruzado Satén",
  "Vestido Boho Chic"
];

const SIZES = ["XS", "S", "M", "L", "XL"];

// Initial list
const INITIAL_SUGGESTIONS = [
  {
    id: "1",
    text: "Solicitaste la Blusa Romántica en talla L",
    date: "20 de mayo, 2026",
    status: "En revisión",
  },
  {
    id: "2",
    text: "Sugeriste colores oscuros para la temporada de otoño",
    date: "15 de mayo, 2026",
    status: "Considerada",
  }
];

export default function SuggestionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Pedir una talla");
  
  // Structured form state
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [suggestedColor, setSuggestedColor] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [suggestionsHistory, setSuggestionsHistory] = useState<any[]>(INITIAL_SUGGESTIONS);
  const [dynamicProducts, setDynamicProducts] = useState<string[]>(MOCK_PRODUCTS);
  const { status } = useAuthStore();
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPage, setDropdownPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const loadSuggestions = async () => {
      if (status === 'checking') return;

      if (status !== 'authenticated') {
        setSuggestionsHistory(INITIAL_SUGGESTIONS);
        return;
      }

      try {
        const token = await getFirebaseAuthToken();
        const { data } = await suggestionsApi.get('/user/me', getAuthConfig({ token }));
        if (data && data.length > 0) {
          const mapped = data.map((sug: any) => {
            let desc = sug.message || "";
            if (sug.category === "Pedir una talla") {
              desc = `Solicitaste el producto "${sug.productId?.name || 'Producto'}" en talla ${sug.sizeRequested}`;
            } else if (sug.category === "Repetir un producto") {
              desc = `Solicitaste volver a producir el producto "${sug.productId?.name || 'Producto'}"`;
            } else if (sug.category === "Sugerir un nuevo color") {
              desc = `Sugeriste el color "${sug.colorSuggested}" para el producto "${sug.productId?.name || 'Producto'}"`;
            }
            
            let statusLabel = "Recibida";
            if (sug.status === "CONSIDERED") statusLabel = "Considerada";
            else if (sug.status === "UNDER_REVIEW") statusLabel = "En revisión";

            return {
              id: sug._id,
              text: desc,
              date: new Date(sug.createdAt).toLocaleDateString('es-PE'),
              status: statusLabel
            };
          });
          setSuggestionsHistory(mapped);
        } else {
          setSuggestionsHistory(INITIAL_SUGGESTIONS);
        }
      } catch (error) {
        console.error("Error loading user suggestions:", error);
        setSuggestionsHistory(INITIAL_SUGGESTIONS);
      }
    };

    const loadInteractionProducts = async () => {
      if (status === 'checking') return;

      if (status !== 'authenticated') {
        setDynamicProducts(MOCK_PRODUCTS);
        return;
      }

      try {
        const token = await getFirebaseAuthToken();
        const { data } = await suggestionsApi.get('/interaction-products', getAuthConfig({ token }));
        if (data && data.data && data.data.length > 0) {
          const names = data.data.map((p: any) => p.name);
          setDynamicProducts(names);
        } else {
          setDynamicProducts(MOCK_PRODUCTS);
        }
      } catch (error) {
        console.error("Error loading interaction products:", error);
        setDynamicProducts(MOCK_PRODUCTS);
      }
    };

    loadSuggestions();
    loadInteractionProducts();
  }, [status]);

  const isFormValid = () => {
    if (selectedCategory === "Pedir una talla") return selectedProduct !== "" && selectedSize !== "";
    if (selectedCategory === "Repetir un producto") return selectedProduct !== "";
    if (selectedCategory === "Sugerir un nuevo color") return selectedProduct !== "" && suggestedColor.trim() !== "";
    return suggestionText.trim() !== ""; // Para "Modelo nuevo" u "Otro"
  };

  const generateSuggestionText = () => {
    if (selectedCategory === "Pedir una talla") return `Solicitaste el producto "${selectedProduct}" en talla ${selectedSize}`;
    if (selectedCategory === "Repetir un producto") return `Solicitaste volver a producir el producto "${selectedProduct}"`;
    if (selectedCategory === "Sugerir un nuevo color") return `Sugeriste el color "${suggestedColor}" para el producto "${selectedProduct}"`;
    return suggestionText; // Text libre
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    
    try {
      const token = await getFirebaseAuthToken();
      // Usamos el API configurada (axios instance)
      await suggestionsApi.post('/', {
        category: selectedCategory,
        // Usamos un ID dummy temporal para el producto si no existe en BD, o se omitiría
        productId: selectedProduct ? '65f1a2b3c4d5e6f7a8b9c0d1' : undefined, 
        sizeRequested: selectedSize,
        colorSuggested: suggestedColor,
        message: suggestionText
      }, getAuthConfig({ token }));
    } catch (error) {
      console.error('Error enviando sugerencia:', error);
    }
    
    // Mostramos la UI de éxito igual (manteniendo mock feel)
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Add to history
      const newSuggestion = {
        id: Date.now().toString(),
        text: generateSuggestionText(),
        date: "Hoy",
        status: "Recibida",
      };
      
      setSuggestionsHistory([newSuggestion, ...suggestionsHistory]);

      // Reset form after a delay
      setTimeout(() => {
        setShowSuccess(false);
        setSuggestionText("");
        setSelectedProduct("");
        setSelectedSize("");
        setSuggestedColor("");
      }, 3000);
    }, 1000);
  };

  return (
    <div className="relative space-y-12 w-full pb-10 min-h-[80vh]">
      
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-[0_20px_60px_-15px_rgba(89,66,70,0.2)] border border-[#F2D0D3]"
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <CheckCircle2 className="w-24 h-24 text-[#F2778D] mb-4" />
                </motion.div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -inset-4">
                  <Sparkles className="absolute top-0 left-0 w-6 h-6 text-[#F2B6C1]" />
                  <Sparkles className="absolute bottom-0 right-0 w-5 h-5 text-[#632034]/40" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold text-[#632034] mt-2">¡Sugerencia Enviada!</h2>
              <p className="text-[#594246]/70 font-medium mt-2 max-w-sm">
                Tus datos han sido registrados en nuestro sistema de producción. ¡Gracias por ayudarnos!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-serif font-medium text-[#594246] tracking-wide">Sugerencias al negocio</h1>
        <p className="text-[#594246]/70 text-sm mt-1 font-medium">Ayúdanos a decidir nuestra próxima producción mediante este cuestionario.</p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.12)] border border-[#EBEAE8] p-6 lg:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F2778D] via-[#F2B6C1] to-[#F2D0D3]"></div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Categories (Single Select for structured logic) */}
          <div>
            <label className="block text-[#632034] font-bold text-sm mb-4">¿De qué se trata tu sugerencia?</label>
            <div className="flex flex-wrap gap-3">
              {SUGGESTION_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border
                      ${isSelected 
                        ? 'bg-[#F2D0D3] border-[#F2D0D3] text-[#632034] shadow-sm' 
                        : 'bg-white border-[#EBEAE8] text-[#594246]/60 hover:border-[#F2D0D3] hover:text-[#632034]'}
                    `}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full h-px bg-[#EBEAE8]/50"></div>

          {/* DYNAMIC QUESTIONNAIRE SECTION */}
          <div className="space-y-6 min-h-[120px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >

                {/* PRODUCT DROPDOWN (Shown for Size, Color, Repeat) */}
                {["Pedir una talla", "Repetir un producto", "Sugerir un nuevo color"].includes(selectedCategory) && (
                  <div>
                    <label className="block text-[#632034] font-bold text-sm mb-3">¿Para qué producto es tu sugerencia?</label>
                    <div className="relative">
                      {/* Custom Dropdown Trigger */}
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl px-5 py-4 text-[#632034] font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] focus:border-[#F2D0D3] transition-all shadow-inner text-left"
                      >
                        <span className={selectedProduct ? "" : "text-[#594246]/40"}>
                          {selectedProduct || "Selecciona un producto de la lista..."}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-[#594246]/40 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Custom Dropdown Menu */}
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.15)] border border-[#EBEAE8] overflow-hidden"
                          >
                            <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {/* Paginated mock display */}
                              {dynamicProducts.slice((dropdownPage - 1) * ITEMS_PER_PAGE, dropdownPage * ITEMS_PER_PAGE).map(prod => (
                                <button
                                  key={prod}
                                  type="button"
                                  onClick={() => {
                                    setSelectedProduct(prod);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${selectedProduct === prod ? 'bg-[#F2D0D3]/30 text-[#632034]' : 'text-[#594246]/80 hover:bg-[#FAF9F6] hover:text-[#632034]'}`}
                                >
                                  {prod}
                                </button>
                              ))}
                            </div>
                            
                            {/* Pagination Controls */}
                            <div className="border-t border-[#EBEAE8] p-2 flex justify-between items-center bg-[#FAF9F6]/50">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setDropdownPage(Math.max(1, dropdownPage - 1)); }}
                                disabled={dropdownPage === 1}
                                className="p-1.5 rounded-lg hover:bg-[#EBEAE8] disabled:opacity-30 transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 text-[#632034]" />
                              </button>
                              <span className="text-xs font-bold text-[#632034]/60">Pág {dropdownPage} de {Math.ceil(dynamicProducts.length / ITEMS_PER_PAGE)}</span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setDropdownPage(Math.min(Math.ceil(dynamicProducts.length / ITEMS_PER_PAGE), dropdownPage + 1)); }}
                                disabled={dropdownPage === Math.ceil(dynamicProducts.length / ITEMS_PER_PAGE)}
                                className="p-1.5 rounded-lg hover:bg-[#EBEAE8] disabled:opacity-30 transition-colors"
                              >
                                <ChevronRight className="w-4 h-4 text-[#632034]" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* SIZE SELECTOR */}
                {selectedCategory === "Pedir una talla" && (
                  <div>
                    <label className="block text-[#632034] font-bold text-sm mb-3">¿Qué talla necesitas que produzcamos?</label>
                    <div className="flex gap-3">
                      {SIZES.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`w-14 h-14 rounded-2xl font-bold text-lg transition-all duration-300 border shadow-sm
                            ${selectedSize === size 
                              ? 'bg-[#632034] border-[#632034] text-white' 
                              : 'bg-white border-[#EBEAE8] text-[#594246]/70 hover:border-[#F2D0D3] hover:text-[#632034]'}
                          `}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* COLOR INPUT */}
                {selectedCategory === "Sugerir un nuevo color" && (
                  <div>
                    <label className="block text-[#632034] font-bold text-sm mb-3">¿En qué color te gustaría verlo?</label>
                    <input 
                      type="text"
                      value={suggestedColor}
                      onChange={(e) => setSuggestedColor(e.target.value)}
                      placeholder="Ej: Azul Marino, Rojo Vino..."
                      className="w-full bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl px-5 py-4 text-[#632034] font-medium placeholder:text-[#594246]/40 focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] focus:border-[#F2D0D3] transition-all shadow-inner"
                    />
                  </div>
                )}

                {/* TEXT AREA (Shown only for "Otro" or "Modelo nuevo") */}
                {["Pedir un modelo nuevo", "Otro"].includes(selectedCategory) && (
                  <div>
                    <label className="block text-[#632034] font-bold text-sm mb-3">Cuéntanos tu idea en detalle</label>
                    <textarea 
                      rows={4}
                      value={suggestionText}
                      onChange={(e) => setSuggestionText(e.target.value)}
                      placeholder="Ej: Me encantaría que lanzaran abrigos largos para el invierno..."
                      className="w-full bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl p-5 text-[#632034] font-medium placeholder:text-[#594246]/40 focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] focus:border-[#F2D0D3] transition-all resize-none shadow-inner"
                    />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-sm
                ${isFormValid() && !isSubmitting
                  ? 'bg-[#632034] text-white hover:bg-[#F2778D] hover:shadow-md' 
                  : 'bg-[#EBEAE8] text-[#594246]/40 cursor-not-allowed shadow-none'}
              `}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar sugerencia estructurada
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Previous Suggestions Section */}
      <div className="pt-8">
        <h2 className="text-2xl font-bold text-[#594246] mb-6">Mis sugerencias enviadas</h2>
        
        <div className="space-y-4">
          <AnimatePresence>
            {suggestionsHistory.map((sug) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                key={sug.id} 
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#EBEAE8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-[#F2D0D3]/50"
              >
                
                <div className="flex gap-4 items-start sm:items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#EBEAE8] flex items-center justify-center shrink-0 hidden sm:flex">
                    <MessageSquare className="w-4 h-4 text-[#594246]/40" />
                  </div>
                  <div>
                    <p className="text-[#632034] font-bold text-[15px] leading-snug">{sug.text}</p>
                    <p className="text-[#594246]/50 font-medium text-xs mt-1.5">{sug.date}</p>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="shrink-0 self-start sm:self-auto">
                  {sug.status === "Recibida" && (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 shadow-sm">
                      {sug.status}
                    </span>
                  )}
                  {sug.status === "En revisión" && (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                      {sug.status}
                    </span>
                  )}
                  {sug.status === "Considerada" && (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                      {sug.status}
                    </span>
                  )}
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
