import { ReactionResult } from '../types';

// DIQQAT: Kalitlar doim ALFAVIT tartibida yozilishi shart!

export const LOCAL_REACTIONS: Record<string, ReactionResult> = {
  
  // =============== 2 ELEMENTLI REAKSIYALAR ===============

  // Uglerod + Oltingugurt (Uglerod disulfid) - SIZ SO'RAGAN QISM
  "C-S": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Uglerod va oltingugurt yuqori haroratda birikib, uglerod disulfidini hosil qiladi.",
    products: ["CS₂ (Uglerod disulfid)"],
    visualization_plan: {
      template: "gas_evolution",
      duration_ms: 2200,
      colors: ["#333333", "#ffff00"],
      effects: { bubbles: true },
      recommended_3d_assets: { product_model: "cs2_molecule" } // Bu modelType MoleculeViewer da "cs2" ni ishlatadi
    }
  },

  // Kumush + Oltingugurt
  "Ag-S": {
    possible: true,
    reaction_type: "Qorayish",
    explanation: "Kumush buyumlar havodagi oltingugurt bilan reaksiyaga kirishib qorayadi.",
    products: ["Ag₂S (Kumush sulfid)"],
    visualization_plan: {
      template: "rust_growth",
      duration_ms: 3000,
      colors: ["#C0C0C0", "#000000"],
      effects: { slow_growth: true },
      recommended_3d_assets: { product_model: "rust" }
    }
  },

  "Al-Cl": {
    possible: true,
    reaction_type: "Ekzotermik Sintez",
    explanation: "Alyuminiy xlor gazi bilan shiddatli reaksiyaga kirishib, oq tutun hosil qiladi.",
    products: ["AlCl₃ (Alyuminiy xlorid)"],
    visualization_plan: {
      template: "explosion_bubbles",
      duration_ms: 2500,
      colors: ["#ffffff"],
      effects: { smoke: true, flash: true },
      recommended_3d_assets: { product_model: "generic" }
    }
  },

  "Al-O": {
    possible: true,
    reaction_type: "Oksidlanish",
    explanation: "Alyuminiy sirti havoda darhol oksidlanadi.",
    products: ["Al₂O₃ (Alyuminiy oksidi)"],
    visualization_plan: {
      template: "crystal_growth",
      duration_ms: 2000,
      colors: ["#e0e0e0"],
      effects: { crystals: true },
      recommended_3d_assets: { product_model: "crystal" }
    }
  },

  "Au-H": {
    possible: false,
    reaction_type: "Reaksiya yo'q",
    explanation: "Oltin vodorod bilan reaksiyaga kirishmaydi.",
    products: [],
    visualization_plan: { template: "none", duration_ms: 1000, colors: [], effects: {}, recommended_3d_assets: { product_model: null } }
  },

  "Au-O": {
    possible: false,
    reaction_type: "Reaksiya yo'q",
    explanation: "Oltin asil metall bo'lgani uchun kislorodda zanglamaydi.",
    products: [],
    visualization_plan: { template: "none", duration_ms: 1000, colors: [], effects: {}, recommended_3d_assets: { product_model: null } }
  },

  "C-H": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Uglerod va vodorod Metanni hosil qiladi.",
    products: ["CH₄ (Metan)"],
    visualization_plan: {
      template: "gas_evolution",
      duration_ms: 2200,
      colors: ["#87CEEB"],
      effects: { bubbles: true },
      recommended_3d_assets: { product_model: "ch4_molecule" }
    }
  },

  "C-O": {
    possible: true,
    reaction_type: "Yonish",
    explanation: "Ko'mir kislorodda yonib, karbonat angidrid hosil qiladi.",
    products: ["CO₂ (Karbonat angidrid)"],
    visualization_plan: {
      template: "gas_evolution",
      duration_ms: 2500,
      colors: ["#888888", "#cccccc"],
      effects: { bubbles: true, flash: true },
      recommended_3d_assets: { product_model: "co2_molecule" }
    }
  },

  "Ca-O": {
    possible: true,
    reaction_type: "Yonish",
    explanation: "Kalsiy havoda yonib, ohak hosil qiladi.",
    products: ["CaO (Kalsiy oksidi)"],
    visualization_plan: {
      template: "flash",
      duration_ms: 2000,
      colors: ["#ffffff"],
      effects: { flash: true, crystals: true },
      recommended_3d_assets: { product_model: "crystal" }
    }
  },

  "Cl-H": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Vodorod va Xlor yorug'likda portlab, HCl hosil qiladi.",
    products: ["HCl (Xlorovodorod)"],
    visualization_plan: {
      template: "flash",
      duration_ms: 1800,
      colors: ["#ffff99"],
      effects: { flash: true, bubbles: true },
      recommended_3d_assets: { product_model: "hcl_molecule" }
    }
  },

  "Cl-Na": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Natriy va Xlor osh tuzini hosil qiladi.",
    products: ["NaCl (Osh tuzi)"],
    visualization_plan: {
      template: "crystal_growth",
      duration_ms: 3000,
      colors: ["#ffffff"],
      effects: { flash: true, crystals: true, smoke: true },
      recommended_3d_assets: { product_model: "nacl_crystal" }
    }
  },

  "Cu-O": {
    possible: true,
    reaction_type: "Oksidlanish",
    explanation: "Mis qizdirilganda qorayib, mis oksidi hosil qiladi.",
    products: ["CuO (Mis oksidi)"],
    visualization_plan: {
      template: "rust_growth",
      duration_ms: 3000,
      colors: ["#000000"],
      effects: { slow_growth: true },
      recommended_3d_assets: { product_model: "rust" }
    }
  },

  "Fe-O": {
    possible: true,
    reaction_type: "Korroziya",
    explanation: "Temir zanglaydi (Fe₂O₃).",
    products: ["Fe₂O₃ (Zang)"],
    visualization_plan: {
      template: "rust_growth",
      duration_ms: 5000,
      colors: ["#8B4513", "#FF4500"],
      effects: { crystals: true, slow_growth: true },
      recommended_3d_assets: { product_model: "fe2o3_rust" }
    }
  },

  "Fe-S": {
    possible: true,
    reaction_type: "Birikish",
    explanation: "Temir va oltingugurt temir sulfid hosil qiladi.",
    products: ["FeS (Temir sulfid)"],
    visualization_plan: {
      template: "crystal_glow",
      duration_ms: 3000,
      colors: ["#333333", "#ffaa00"],
      effects: { glow: true, smoke: true },
      recommended_3d_assets: { product_model: "crystal" }
    }
  },
  
  "H-N": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Azot va vodorod ammiak hosil qiladi.",
    products: ["NH₃ (Ammiak)"],
    visualization_plan: {
      template: "gas_evolution",
      duration_ms: 2800,
      colors: ["#87CEEB"],
      effects: { bubbles: true },
      recommended_3d_assets: { product_model: "nh3_molecule" }
    }
  },

  "H-O": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Vodorod va kislorod suv hosil qiladi.",
    products: ["H₂O (Suv)"],
    visualization_plan: {
      template: "explosion_bubbles",
      duration_ms: 3500,
      colors: ["#3b82f6", "#ffffff"],
      effects: { bubbles: true, flash: true, explosion: true },
      recommended_3d_assets: { product_model: "h2o_molecule" }
    }
  },

  "H-S": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Vodorod va oltingugurt vodorod sulfid gazini hosil qiladi.",
    products: ["H₂S (Vodorod sulfid)"],
    visualization_plan: {
      template: "gas_evolution",
      duration_ms: 2200,
      colors: ["#ffffff", "#ffff00"],
      effects: { bubbles: true },
      recommended_3d_assets: { product_model: "h2s_molecule" }
    }
  },

  "He-O": {
    possible: false,
    reaction_type: "Reaksiya yo'q",
    explanation: "Geliy asil gaz.",
    products: [],
    visualization_plan: { template: "none", duration_ms: 1000, colors: [], effects: {}, recommended_3d_assets: { product_model: null } }
  },

  "Mg-O": {
    possible: true,
    reaction_type: "Yonish",
    explanation: "Magniy oq yorug'lik bilan yonib, magniy oksidi hosil qiladi.",
    products: ["MgO (Magniy oksidi)"],
    visualization_plan: {
      template: "flash",
      duration_ms: 2000,
      colors: ["#ffffff", "#ffffcc"],
      effects: { flash: true, smoke: true },
      recommended_3d_assets: { product_model: "crystal" }
    }
  },

  "Ne-O": {
    possible: false,
    reaction_type: "Reaksiya yo'q",
    explanation: "Neon inert gaz.",
    products: [],
    visualization_plan: { template: "none", duration_ms: 1000, colors: [], effects: {}, recommended_3d_assets: { product_model: null } }
  },

  // 3 ELEMENTLILAR
  "C-H-O": {
    possible: true,
    reaction_type: "Organik sintez",
    explanation: "Glukoza hosil bo'lishi.",
    products: ["C₆H₁₂O₆ (Glyukoza)"],
    visualization_plan: {
      template: "organic_growth",
      duration_ms: 6000,
      colors: ["#90EE90", "#228B22"],
      effects: { glow: true, particles: true },
      recommended_3d_assets: { product_model: "generic" }
    }
  },

  // C2H2 (Asetilen)
  "C-H-C": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Asetilen gazi.",
    products: ["C₂H₂ (Asetilen)"],
    visualization_plan: {
      template: "gas_evolution",
      duration_ms: 2200,
      colors: ["#333333", "#ffffff"],
      effects: { bubbles: true },
      recommended_3d_assets: { product_model: "c2h2_molecule" }
    }
  },

  "H-N-O": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Azot kislotasi.",
    products: ["HNO₃ (Azot kislota)"],
    visualization_plan: {
      template: "acid_formation",
      duration_ms: 3000,
      colors: ["#3b82f6", "#ff0000"],
      effects: { bubbles: true, smoke: true },
      recommended_3d_assets: { product_model: "generic" }
    }
  },

  "H-O-S": {
    possible: true,
    reaction_type: "Sintez",
    explanation: "Sulfat kislota.",
    products: ["H₂SO₄ (Sulfat kislota)"],
    visualization_plan: {
      template: "acid_formation",
      duration_ms: 3000,
      colors: ["#ffff00", "#ff0000"],
      effects: { bubbles: true, smoke: true },
      recommended_3d_assets: { product_model: "generic" }
    }
  }
};

export const NO_REACTION_TEMPLATE: ReactionResult = {
  possible: false,
  products: [],
  reaction_type: "Reaksiya aniqlanmadi",
  explanation: "Ushbu elementlar reaksiyaga kirishmaydi.",
  visualization_plan: {
    template: "none",
    duration_ms: 1500,
    colors: ["#cccccc"],
    effects: {},
    recommended_3d_assets: { product_model: null }
  }
};