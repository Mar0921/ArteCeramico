"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingCart, ChevronLeft, ChevronRight, Package, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface Product {
  name: string
  price: string
}

interface Category {
  id: string
  title: string
  items: Product[]
}

let categories: Category[] = [
  {
    id: "yesos",
    title: "YESOS",
    items: [
      { name: "DUPLICADO MODELO", price: "$45.000" },
      { name: "MATRIZ SILICONA", price: "$55.000" },
      { name: "MODELO CON ENCIA", price: "$65.000" },
      { name: "MODELO YESO ANTAGONISTA TIPO 3", price: "$30.000" },
      { name: "MODELO YESO IV", price: "$42.000" },
    ]
  },
  {
    id: "metal",
    title: "METAL",
    items: [
      { name: "BARRA TITANIO", price: "$1.800.000" },
      { name: "CENTRAL UNICO", price: "$330.000" },
      { name: "COFIA ATORNILLADA", price: "$220.000" },
      { name: "COFIA METAL", price: "$160.000" },
      { name: "COLLAR", price: "$60.000" },
      { name: "CORONA METAL PORCELANA", price: "$315.000" },
      { name: "GINGIVAS ESTRATIFICADA", price: "$210.000" },
      { name: "HIBRIDA METAL-ACRILICO", price: "$3.200.000" },
      { name: "NUCLEO", price: "$90.000" },
      { name: "PORCELANA HIBRIDA UNIDAD", price: "$600.000" },
    ]
  },
  {
    id: "acrilicos",
    title: "ACRILICOS",
    items: [
      { name: "PLATO BASE Y RODETE", price: "$45.000" },
      { name: "PROVISIONAL PMMA", price: "$100.000" },
      { name: "PROVISIONAL SOBRE IMPLANTE PMMA", price: "$210.000" },
      { name: "HIBRIDA PMMA UNIDAD", price: "$210.000" },
    ]
  },
  {
    id: "encerados",
    title: "ENCERADOS",
    items: [
      { name: "ENCERADO DX", price: "$40.000" },
      { name: "ENCERADO GUIA", price: "$35.000" },
    ]
  },
  {
    id: "resinas-impresas",
    title: "RESINAS IMPRESAS",
    items: [
      { name: "CARILLA", price: "$180.000" },
      { name: "CORONA", price: "$200.000" },
      { name: "INCRUSTACION", price: "$180.000" },
      { name: "MODELOS 3D COMPLETOS", price: "$100.000" },
      { name: "MODELOS 3D MEDIA ARCADA", price: "$60.000" },
    ]
  },
  {
    id: "libre-metal",
    title: "LIBRE DE METAL",
    items: [
      { name: "APOYO DISILICATO", price: "$115.000" },
      { name: "APOYO, BALCON ZIRCONIO", price: "$85.000" },
      { name: "CARILLA DISILICATO", price: "$310.000" },
      { name: "CENTRAL UNICO DISILICATO", price: "$380.000" },
      { name: "CENTRAL UNICO EN ZIRCONIO", price: "$380.000" },
      { name: "CORONA DISILICATO ESTRATIFICADA", price: "$365.000" },
      { name: "CORONA DISILICATO MAQUILADA", price: "$330.000" },
      { name: "CORONA ZIRCONIO ESTRATIFICADA", price: "$365.000" },
      { name: "CORONA ZIRCONIO MAQUILADA", price: "$340.000" },
      { name: "GINGIVA ESTRATIFICADA", price: "$210.000" },
      { name: "INCRUSTACION DISILICATO", price: "$300.000" },
      { name: "INCRUSTACION ZIRCONIO", price: "$315.000" },
    ]
  },
  {
    id: "implantologia",
    title: "IMPLANTOLOGIA",
    items: [
      { name: "CORONA ATORNILLADA DISILICATO", price: "$380.000" },
      { name: "CORONA ATORNILLADA ZIRCONIO", price: "$380.000" },
      { name: "CORONA MP ATORNILLADA", price: "$320.000" },
      { name: "FRESADO MONTURA", price: "$70.000" },
      { name: "MICROFRESADO", price: "$130.000" },
      { name: "OPACADO DE ABUTMENT CERAMIZADO", price: "$70.000" },
      { name: "OPACADO DE ABUTMENT POLIMERIZADO", price: "$55.000" },
    ]
  },
  {
    id: "uclas",
    title: "UCLAS ANILLO EN CROMO",
    items: [
      { name: "BH - ZIMMER 3.5 - 4.5", price: "$210.000" },
      { name: "BH 3.0", price: "$230.000" },
      { name: "STRAUMANN", price: "$300.000" },
    ]
  },
]

// Ordenar categorías por título
categories = categories.sort((a, b) => a.title.localeCompare(b.title))

// Ordenar productos dentro de cada categoría
categories = categories.map(category => ({
  ...category,
  items: [...category.items].sort((a, b) => a.name.localeCompare(b.name))
}))

function CategorySection({ category, onProductClick, showCarousel = true }: { category: Category; onProductClick: (product: Product, categoryTitle: string) => void; showCarousel?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const itemsPerView = 4
  const maxIndex = Math.max(0, category.items.length - itemsPerView)

  const scroll = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentIndex(prev => Math.max(0, prev - 1))
    } else {
      setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      {/* Category Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={24} className="text-primary" />
          <h3 className="text-2xl font-bold text-foreground">
            {category.title}
          </h3>
          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-primary">
            {category.items.length} servicios
          </span>
        </div>
        {showCarousel && category.items.length > itemsPerView && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={currentIndex === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-foreground shadow-md transition-all hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={currentIndex >= maxIndex}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-foreground shadow-md transition-all hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Products Grid or Carousel */}
      {showCarousel && category.items.length > itemsPerView ? (
        <div className="relative">
          <div className="flex gap-4 py-2 overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{ x: -currentIndex * (300 + 16) }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {category.items.map((item, index) => (
                <ProductCard 
                  key={`${category.id}-${index}`} 
                  item={item} 
                  categoryTitle={category.title}
                  onClick={onProductClick}
                />
              ))}
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.items.map((item, index) => (
            <ProductCard 
              key={index} 
              item={item} 
              categoryTitle={category.title}
              onClick={onProductClick}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function ProductCard({ item, categoryTitle, onClick }: { item: Product; categoryTitle: string; onClick: (product: Product, categoryTitle: string) => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item, categoryTitle)}
      className="group flex h-[220px] w-[300px] flex-col items-start rounded-xl bg-card p-5 text-left shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Package size={20} className="text-primary" />
      </div>
      <h4 className="mb-2 line-clamp-2 min-h-[3.5rem] text-base font-semibold text-foreground leading-tight">
        {item.name}
      </h4>
      <div className="mt-auto pt-2">
        <p className="text-lg font-bold text-primary">
          {item.price}
        </p>
        <div className="mt-3 flex items-center text-primary text-sm font-medium">
          <ShoppingCart size={14} className="mr-1" />
          Comprar
        </div>
      </div>
    </motion.button>
  )
}

export function ServicesSection() {
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; price: string; category: string } | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const router = useRouter()

  const handleComprar = () => {
    const isLoggedIn = sessionStorage.getItem("clienteEmail") || localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push('/login?redirect=formulario')
    } else {
      router.push('/formulario')
    }
  }

  const handleProductClick = (product: Product, categoryTitle: string) => {
    setSelectedProduct({
      name: product.name,
      price: product.price,
      category: categoryTitle
    })
  }

  const filteredCategories = filterCategory === "all"
    ? categories
    : categories.filter(cat => cat.id === filterCategory)

  return (
    <>
      <section id="servicios" className="bg-background py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header con Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="mb-4 inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-primary-dark">
              Nuestros Servicios
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Portafolio de Servicios
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              Lista de precios actualizada - Mayo 2026
            </p>

            {/* Filtros */}
            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-4">
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex h-11 appearance-none items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-base font-medium text-foreground shadow-md transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer pr-10"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  size={18} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
              </div>

              <button
                onClick={() => setFilterCategory("all")}
                className={`flex items-center gap-2 rounded-xl px-5 py-3 text-base font-medium shadow-md transition-all ${
                  filterCategory === "all" 
                    ? "bg-primary text-primary-foreground hover:bg-primary-dark" 
                    : "bg-card border border-border text-foreground hover:border-primary"
                }`}
              >
                <Package size={18} />
                TODO
              </button>
            </div>
          </motion.div>

          {/* Category Sections */}
          <AnimatePresence mode="wait">
            {filteredCategories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <CategorySection 
                  category={category} 
                  onProductClick={handleProductClick}
                  showCarousel={filterCategory === "all"}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Mensaje cuando no hay resultados */}
          {filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <p className="text-lg text-muted-foreground">
                No hay servicios en esta categoría.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow-lg transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="border-b border-border p-6">
                <span className="mb-2 inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-primary">
                  {selectedProduct.category}
                </span>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {selectedProduct.name}
                </h3>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {selectedProduct.price}
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Product placeholder */}
                <div className="mb-6 flex h-40 items-center justify-center rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground">
                    Imagen del producto
                  </p>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleComprar}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-center font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-primary-dark hover:shadow-xl"
                  >
                    <ShoppingCart size={18} />
                    Comprar
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="rounded-lg border border-border bg-transparent px-6 py-3 text-center font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
