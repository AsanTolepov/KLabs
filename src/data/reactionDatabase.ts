import { ReactionResult } from '../types';

// ALFAVIT TARTIBIDA kalitlar yozilishi shart: masalan "H-O", "C-H-O" (harf bo'yicha sort qilingan)
export const LOCAL_REACTIONS: Record<string, ReactionResult> = {
  // =============== 2 ELEMENTLI REAKSIYALAR ===============

  // Suv
  "H-O": {
    possible: true,
    reaction_type: "Sintez / Portlovchi yonish",
    explanation: "Vodorod va kislorod aralashmasi uchqun bilan portlab, suv hosil qiladi (2H₂ + O₂ → 2H₂O)",
    products: ["H₂O (Suv)"],
    visualization_plan: {
      template: "explosion_bubbles",
      duration_ms: 3500,
      colors: ["#3b82f6", "#ffffff"],
      effects: { bubbles: true, flash: true, explosion: true, crystals: false },
      recommended_3d_assets: { product_model: "h2o_molecule" }
    }
  },

  // Osh tuzi
  "Cl-Na": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Natriy xlor bilan shiddatli reaksiyaga kirishib, osh tuzi hosil qiladi (2Na + Cl₂ → 2NaCl)",
    products: ["NaCl (Osh tuzi)"],
    visualization_plan: {
      template: "crystal_growth",
      duration_ms: 3000,
      colors: ["#ffffff"],
      effects: { flash: true, crystals: true, smoke: true },
      recommended_3d_assets: { product_model: "nacl_crystal" }
    }
  },

  // Karbonat angidrid
  "C-O": {
    possible: true,
    reaction_type: "Yonish",
    explanation: "Ko'mir (uglerod) kislorodda yonib, karbonat angidrid gazini hosil qiladi",
    products: ["CO₂ (Karbonat angidrid)"],
    visualization_plan: {
      template: "gas_evolution",
      duration_ms: 2500,
      colors: ["#888888", "#cccccc"],
      effects: { bubbles: true, flash: true },
      recommended_3d_assets: { product_model: "co2_molecule" }
    }
  },

  // Ammiak
  "H-N": {
    possible: true,
    reaction_type: "Sintez (Haber jarayoni)",
    explanation: "Azot va vodorod yuqori bosim/harorat va katalizator yordamida ammiak hosil qiladi (N₂ + 3H₂ → 2NH₃)",
    products: ["NH₃ (Ammiak)"],
    visualization_plan: {
      template: "gas_evolution",
      duration_ms: 2800,
      colors: ["#87CEEB"],
      effects: { bubbles: true },
      recommended_3d_assets: { product_model: "nh3_molecule" }
    }
  },

  // Xlorovodorod
  "Cl-H": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Vodorod va xlor yorug‘likda portlovchi reaksiyaga kirishib, HCl hosil qiladi",
    products: ["HCl (Xlorovodorod)"],
    visualization_plan: {
      template: "flash",
      duration_ms: 1800,
      colors: ["#ffff99"],
      effects: { flash: true, bubbles: true },
      recommended_3d_assets: { product_model: "hcl_molecule" }
    }
  },

  // Metan
  "C-H": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Uglerod va vodorod metan (tabiiy gaz) hosil qiladi (Sabatye jarayoni)",
    products: ["CH₄ (Metan)"],
    visualization_plan: {
      template: "gas_evolution",
      duration_ms: 2200,
      colors: ["#87CEEB"],
      effects: { bubbles: true },
      recommended_3d_assets: { product_model: "ch4_molecule" }
    }
  },

  // Alyuminiy oksidi (korund)
  "Al-O": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Alyuminiy kislorod bilan qizdirilganda korund hosil qiladi",
    products: ["Al₂O₃ (Alyuminiy oksidi)"],
    visualization_plan: {
      template: "crystal_growth",
      duration_ms: 3200,
      colors: ["#ff4444", "#ffffff"],
      effects: { flash: true, crystals: true },
      recommended_3d_assets: { product_model: "al2o3_crystal" }
    }
  },

  // Temir oksidi (zang)
  "Fe-O": {
    possible: true,
    reaction_type: "Korrozija / Yonish",
    explanation: "Temir kislorod va namlik bilan zanglaydi (4Fe + 3O₂ → 2Fe₂O₃)",
    products: ["Fe₂O₃ (Temir(III) oksidi)"],
    visualization_plan: {
      template: "rust_growth",
      duration_ms: 5000,
      colors: ["#8B4513", "#FF4500"],
      effects: { crystals: true, slow_growth: true },
      recommended_3d_assets: { product_model: "fe2o3_rust" }
    }
  },

  // =============== 3 ELEMENTLI REAKSIYALAR ===============

  // Pishirish sodasi (Na + H + C + O)
  "C-H-Na-O": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Solvay jarayoni orqali natriy, vodorod, uglerod va kisloroddan pishirish sodasi olinadi",
    products: ["NaHCO₃ (Pishirish sodasi)"],
    visualization_plan: {
      template: "crystal_growth",
      duration_ms: 4000,
      colors: ["#ffffff"],
      effects: { crystals: true },
      recommended_3d_assets: { product_model: "nahco3_crystal" }
    }
  },

  // Ohak (Ca + C + O)
  "C-Ca-O": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Kalsiy karbonat issiqlikda parchalanib, ohak va CO₂ hosil qiladi (teskari jarayon ko'rsatilgan)",
    products: ["CaO (Ohak)", "CO₂ (Karbonat angidrid)"],
    visualization_plan: {
      template: "crystal_glow",
      duration_ms: 3500,
      colors: ["#ffffff", "#ffff99"],
      effects: { flash: true, crystals: true },
      recommended_3d_assets: { product_model: "cao_crystal" }
    }
  },

  // Glukoza (C + H + O) - fotosintez
  "C-H-O": {
    possible: true,
    reaction_type: "Fotosintez",
    explanation: "Uglerod, vodorod va kisloroddan o'simliklar quyosh nuri yordamida glukoza hosil qiladi",
    products: ["C₆H₁₂O₆ (Glyukoza)"],
    visualization_plan: {
      template: "organic_growth",
      duration_ms: 6000,
      colors: ["#90EE90", "#228B22"],
      effects: { glow: true, particles: true },
      recommended_3d_assets: { product_model: "glucose_molecule" }
    }
  },

  // Suv + Karbonat angidrid → Uglerod kislotasi
  "C-H-O": {
    possible: true,
    reaction_type: "Eruvchi reaksiya",
    explanation: "CO₂ suvda erib, uglerod kislotasini hosil qiladi (CO₂ + H₂O ⇌ H₂CO₃)",
    products: ["H₂CO₃ (Uglerod kislotasi)"],
    visualization_plan: {
      template: "gas_dissolve",
      duration_ms: 3000,
      colors: ["#3b82f6", "#888888"],
      effects: { bubbles: true },
      recommended_3d_assets: { product_model: "h2co3" }
    }
  },

  // Nitrat kislota (H + N + O)
  "H-N-O": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Azot va kislorod birikib, keyin vodorod bilan nitrat kislota hosil qiladi",
    products: ["HNO₃ (Nitrat kislota)"],
    visualization_plan: {
      template: "acid_formation",
      duration_ms: 2800,
      colors: ["#ff0000", "#ffff00"],
      effects: { flash: true, bubbles: true },
      recommended_3d_assets: { product_model: "hno3_molecule" }
    }
  },

  // Sulfat kislota (H + S + O)
  "H-O-S": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Oltingugurt kislorod bilan yonib SO₃ hosil qiladi, keyin suv bilan H₂SO₄ beradi",
    products: ["H₂SO₄ (Sulfat kislota)"],
    visualization_plan: {
      template: "acid_formation",
      duration_ms: 3200,
      colors: ["#ffff00", "#ff0000"],
      effects: { flash: true, smoke: true },
      recommended_3d_assets: { product_model: "h2so4_molecule" }
    }
  },

  // Qanday qilib ko'proq qo'shish mumkin?
  // Yangi reaksiya qo'shish uchun faqat shunday yozasan:
  // "Al-H-O": { ... }  // masalan, alyuminiy gidroksidi
  // "C-H-Cl": { ... }  // xloroform yoki boshqa organik birikmalar
};

// REAKSIYAGA KIRISHMAYDIGANLAR UCHUN STANDART JAVOB
export const NO_REACTION_TEMPLATE: ReactionResult = {
  possible: false,
  products: [],
  explanation: "Bu elementlar normal sharoitda o'zaro reaksiyaga kirishmaydi yoki barqaror birikma hosil qilmaydi.",
  why_no_reaction: "Kimyoviy bog‘lanish uchun yetarli energiya yoki mos keluvchi valentlik yo‘q.",
  visualization_plan: {
    template: "none",
    duration_ms: 1500,
    colors: ["#cccccc"],
    effects: { bubbles: false, flash: false, crystals: false },
    recommended_3d_assets: { product_model: null }
  }
};