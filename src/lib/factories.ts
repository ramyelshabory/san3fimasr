import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FactoryStatus = "pending" | "approved" | "rejected" | "suspended";

export type Machine = { type: string; count: number };

export type PriceTier = { min: number; max: number | null; price: number };

export type Product = {
  id: string;
  name: string;
  category: string;
  fabric: string;
  image: string;
  tiers: PriceTier[];
};

export type Factory = {
  id: string;
  name: string;
  sectionId: string;
  ownerUserId: string;
  area: string;
  address: string;
  phone: string;
  qualityCode: string;
  status: FactoryStatus;
  dailyCapacity: number;
  rating: number;
  cover: string;
  specialties: string[];
  machines: Machine[];
  products: Product[];
  notes: string;
};

export type Section = { id: string; name: string; blurb: string };

export const SECTIONS: Section[] = [
  { id: "clothes", name: "ملابس", blurb: "قص وخياطة وطباعة وتطريز" },
  { id: "furniture", name: "أثاث", blurb: "خشب وتنجيد ومفروشات" },
  { id: "food", name: "أغذية", blurb: "تصنيع وتعبئة غذائية" },
  { id: "plastic", name: "بلاستيك", blurb: "حقن وتشكيل عبوات" },
  { id: "metal", name: "معادن", blurb: "تشغيل وتشكيل معادن" },
  { id: "packaging", name: "تعبئة وتغليف", blurb: "كراتين وطباعة تغليف" },
  { id: "leather", name: "جلود ومنتجات جلدية", blurb: "أحذية وشنط وإكسسوارات جلد" },
  { id: "chemicals", name: "كيماويات ومنظفات", blurb: "تصنيع منظفات ومستحضرات كيميائية" },
  { id: "paper", name: "ورق وطباعة", blurb: "طباعة دفاتر وكتالوجات ومطبوعات" },
  { id: "glass_ceramics", name: "زجاج وسيراميك", blurb: "تشكيل زجاج وخزف وبلاط" },
  { id: "electronics", name: "إلكترونيات وكهربائيات", blurb: "تجميع أجهزة ولوحات كهربائية" },
];

export const SPECIALTIES = [
  "تيشيرت",
  "هودي",
  "جينز",
  "أطفال",
  "يونيفورم",
  "ملابس رياضية",
] as const;

export const MACHINE_TYPES = ["أوفر", "أوفرلوك", "تطريز", "طباعة", "مكواة بخار"] as const;

const seed: Factory[] = [
  {
    id: "kheir",
    name: "مصنع الخير للملابس",
    sectionId: "clothes",
    ownerUserId: "",
    area: "شبرا الخيمة — بيجام",
    address: "أعلى محل جيمي الحلاق، شارع المعز، بيجام",
    phone: "01155999410",
    qualityCode: "SM-2026-014",
    status: "approved",
    dailyCapacity: 4000,
    rating: 4.5,
    cover: "/media/workshop-1.jpg",
    specialties: ["تيشيرت", "هودي"],
    machines: [
      { type: "أوفر", count: 45 },
      { type: "أوفرلوك", count: 20 },
      { type: "تطريز", count: 8 },
      { type: "طباعة", count: 4 },
    ],
    products: [
      {
        id: "tee-plain",
        name: "تيشيرت قطن سادة",
        category: "تيشيرت",
        fabric: "قطن 100%",
        image: "/media/tee.jpg",
        tiers: [
          { min: 50, max: 99, price: 120 },
          { min: 100, max: 299, price: 105 },
          { min: 300, max: null, price: 90 },
        ],
      },
      {
        id: "hoodie",
        name: "هودي قطن ثقيل",
        category: "هودي",
        fabric: "قطن 320 جم",
        image: "/media/hoodie.jpg",
        tiers: [
          { min: 30, max: 79, price: 260 },
          { min: 80, max: null, price: 220 },
        ],
      },
    ],
    notes: "ورشة صغيرة منظمة. الزيارة الميدانية أكدت جودة الخياطة والتزام المواعيد.",
  },
  {
    id: "khawaga",
    name: "مصنع الخواجة",
    sectionId: "clothes",
    ownerUserId: "",
    area: "بهتيم",
    address: "بهتيم، قسم ثان شبرا الخيمة",
    phone: "01212793989",
    qualityCode: "SM-2026-021",
    status: "pending",
    dailyCapacity: 6000,
    rating: 4.7,
    cover: "/media/workshop-2.jpg",
    specialties: ["جينز", "ملابس رياضية"],
    machines: [
      { type: "أوفر", count: 70 },
      { type: "أوفرلوك", count: 28 },
      { type: "مكواة بخار", count: 6 },
    ],
    products: [
      {
        id: "sport",
        name: "ترنج رياضي",
        category: "ملابس رياضية",
        fabric: "ميلتون مستورد",
        image: "/media/hoodie.jpg",
        tiers: [
          { min: 40, max: 99, price: 310 },
          { min: 100, max: null, price: 270 },
        ],
      },
    ],
    notes: "في انتظار مراجعة فريق الجودة قبل الاعتماد.",
  },
  {
    id: "sayyad",
    name: "مصنع الصياد",
    sectionId: "clothes",
    ownerUserId: "",
    area: "شبرا الخيمة",
    address: "شارع الوحدة، نزلة الشارع الجديد من الدائري",
    phone: "01142159374",
    qualityCode: "",
    status: "rejected",
    dailyCapacity: 2500,
    rating: 3.8,
    cover: "/media/machines.jpg",
    specialties: ["تيشيرت", "أطفال"],
    machines: [
      { type: "أوفر", count: 30 },
      { type: "أوفرلوك", count: 12 },
    ],
    products: [],
    notes: "الصور غير واضحة والقدرة الإنتاجية غير مثبتة. يُعاد الطلب بعد زيارة جديدة.",
  },
  {
    id: "happy",
    name: "مصنع هابي كيدز",
    sectionId: "clothes",
    ownerUserId: "",
    area: "باسوس",
    address: "باسوس، شبرا الخيمة",
    phone: "01000003321",
    qualityCode: "SM-2026-033",
    status: "approved",
    dailyCapacity: 2500,
    rating: 4.2,
    cover: "/media/workshop-2.jpg",
    specialties: ["أطفال", "تيشيرت"],
    machines: [
      { type: "أوفر", count: 36 },
      { type: "أوفرلوك", count: 16 },
      { type: "تطريز", count: 6 },
    ],
    products: [
      {
        id: "kids-tee",
        name: "تيشيرت أطفال قطن",
        category: "أطفال",
        fabric: "قطن 180 جم",
        image: "/media/tee.jpg",
        tiers: [
          { min: 50, max: 99, price: 70 },
          { min: 100, max: null, price: 58 },
        ],
      },
    ],
    notes: "مقاسات أطفال من سنة لحد 12. الزيارة أكدت انتظام القص والخياطة.",
  },
  {
    id: "naggar",
    name: "ورشة النجار للمفروشات",
    sectionId: "furniture",
    ownerUserId: "",
    area: "باسوس",
    address: "شارع الترعة، باسوس",
    phone: "01011223344",
    qualityCode: "SM-FUR-2026-004",
    status: "approved",
    dailyCapacity: 40,
    rating: 4.4,
    cover: "/media/workshop-2.jpg",
    specialties: ["تنجيد"],
    machines: [
      { type: "منشار", count: 4 },
      { type: "مكبس تنجيد", count: 2 },
    ],
    products: [
      {
        id: "sofa",
        name: "كنبة ثلاثية قماش",
        category: "تنجيد",
        fabric: "قماش كتان",
        image: "/media/workshop-2.jpg",
        tiers: [
          { min: 5, max: 14, price: 4500 },
          { min: 15, max: null, price: 3900 },
        ],
      },
    ],
    notes: "تفصيل كنب وكراسي. الزيارة أكدت تشطيب الخشب والقماش.",
  },
  {
    id: "nile-food",
    name: "مصنع نيل للأغذية",
    sectionId: "food",
    ownerUserId: "",
    area: "شبرا الخيمة",
    address: "المنطقة الصناعية، شبرا الخيمة",
    phone: "01122334455",
    qualityCode: "SM-FOOD-2026-002",
    status: "approved",
    dailyCapacity: 8000,
    rating: 4.6,
    cover: "/media/machines.jpg",
    specialties: ["تعبئة"],
    machines: [
      { type: "خط تعبئة", count: 2 },
      { type: "خزان خلط", count: 3 },
    ],
    products: [
      {
        id: "spice-pack",
        name: "عبوة بهارات 100 جم",
        category: "تعبئة جافة",
        fabric: "كيس مغلف",
        image: "/media/machines.jpg",
        tiers: [
          { min: 500, max: 1999, price: 8 },
          { min: 2000, max: null, price: 6 },
        ],
      },
    ],
    notes: "تعبئة جافة فقط. الزيارة راجعت النظافة وتاريخ الصلاحية.",
  },
  {
    id: "masr-plastic",
    name: "مصنع مصر للبلاستيك",
    sectionId: "plastic",
    ownerUserId: "",
    area: "بهتيم",
    address: "بهتيم، خلف الدائري",
    phone: "01233445566",
    qualityCode: "SM-PLS-2026-007",
    status: "approved",
    dailyCapacity: 20000,
    rating: 4.3,
    cover: "/media/machines.jpg",
    specialties: ["حقن"],
    machines: [
      { type: "ماكينة حقن", count: 6 },
      { type: "مطحنة هالك", count: 1 },
    ],
    products: [
      {
        id: "jar",
        name: "برطمان بلاستيك 500 مل",
        category: "عبوات",
        fabric: "PP",
        image: "/media/machines.jpg",
        tiers: [
          { min: 1000, max: 4999, price: 4 },
          { min: 5000, max: null, price: 3 },
        ],
      },
    ],
    notes: "قوالب جاهزة للبرطمان والغطا. الزيارة راجعت سماكة الجدار.",
  },
  {
    id: "hadid",
    name: "ورشة الحديد الدقيق",
    sectionId: "metal",
    ownerUserId: "",
    area: "شبرا الخيمة — بيجام",
    address: "شارع المعز، بيجام",
    phone: "01555667788",
    qualityCode: "SM-MET-2026-003",
    status: "approved",
    dailyCapacity: 300,
    rating: 4.1,
    cover: "/media/workshop-1.jpg",
    specialties: ["تشكيل"],
    machines: [
      { type: "مقص صاج", count: 2 },
      { type: "لحام", count: 5 },
    ],
    products: [
      {
        id: "stand",
        name: "حامل معدني مخصص",
        category: "تشكيل",
        fabric: "صاج 1.5 مم",
        image: "/media/workshop-1.jpg",
        tiers: [
          { min: 20, max: 49, price: 180 },
          { min: 50, max: null, price: 150 },
        ],
      },
    ],
    notes: "قص ولحام وتجميع. الزيارة أكدت انتظام اللحام والدهان.",
  },
  {
    id: "carton",
    name: "مطبعة الكرتون",
    sectionId: "packaging",
    ownerUserId: "",
    area: "باسوس",
    address: "مدخل باسوس من الدائري",
    phone: "01099887766",
    qualityCode: "SM-PKG-2026-011",
    status: "approved",
    dailyCapacity: 15000,
    rating: 4.5,
    cover: "/media/workshop-2.jpg",
    specialties: ["كراتين"],
    machines: [
      { type: "ماكينة كرتون", count: 3 },
      { type: "طباعة فلكسو", count: 1 },
    ],
    products: [
      {
        id: "box",
        name: "كرتونة شحن مقاس متوسط",
        category: "كراتين",
        fabric: "كرتون مضلع 5 طبقات",
        image: "/media/workshop-2.jpg",
        tiers: [
          { min: 200, max: 999, price: 12 },
          { min: 1000, max: null, price: 9 },
        ],
      },
    ],
    notes: "طباعة شعار على الكرتونة. الزيارة راجعت تحمل الشحن.",
  },
];

type Store = {
  sections: Section[];
  factories: Factory[];
  addSection: (name: string) => string;
  updateFactory: (id: string, patch: Partial<Factory>) => void;
  setStatus: (id: string, status: FactoryStatus) => void;
  toggleSpecialty: (id: string, specialty: string) => void;
  addMachine: (id: string) => void;
  updateMachine: (id: string, index: number, patch: Partial<Machine>) => void;
  removeMachine: (id: string, index: number) => void;
  addProduct: (id: string) => void;
  updateProduct: (factoryId: string, productId: string, patch: Partial<Product>) => void;
  removeProduct: (factoryId: string, productId: string) => void;
  addTier: (factoryId: string, productId: string) => void;
  updateTier: (
    factoryId: string,
    productId: string,
    index: number,
    patch: Partial<PriceTier>,
  ) => void;
  removeTier: (factoryId: string, productId: string, index: number) => void;
  addFactory: (draft?: Partial<Factory>) => string;
};

function mapFactory(factories: Factory[], id: string, fn: (factory: Factory) => Factory) {
  return factories.map((factory) => (factory.id === id ? fn(factory) : factory));
}

export const useFactories = create<Store>()(
  persist(
    (set) => ({
      sections: SECTIONS,
      factories: seed,
      addSection: (name) => {
        const id = `sec-${Date.now()}`;
        set((state) => ({
          sections: [...state.sections, { id, name: name.trim(), blurb: "قسم أضافه الأدمن" }],
        }));
        return id;
      },
      updateFactory: (id, patch) =>
        set((state) => ({
          factories: mapFactory(state.factories, id, (factory) => ({ ...factory, ...patch })),
        })),
      setStatus: (id, status) =>
        set((state) => ({
          factories: mapFactory(state.factories, id, (factory) => ({
            ...factory,
            status,
            qualityCode:
              status === "approved" && !factory.qualityCode
                ? `SM-2026-${String(state.factories.length + 10).padStart(3, "0")}`
                : factory.qualityCode,
          })),
        })),
      toggleSpecialty: (id, specialty) =>
        set((state) => ({
          factories: mapFactory(state.factories, id, (factory) => ({
            ...factory,
            specialties: factory.specialties.includes(specialty)
              ? factory.specialties.filter((item) => item !== specialty)
              : [...factory.specialties, specialty],
          })),
        })),
      addMachine: (id) =>
        set((state) => ({
          factories: mapFactory(state.factories, id, (factory) => ({
            ...factory,
            machines: [...factory.machines, { type: "أوفر", count: 1 }],
          })),
        })),
      updateMachine: (id, index, patch) =>
        set((state) => ({
          factories: mapFactory(state.factories, id, (factory) => ({
            ...factory,
            machines: factory.machines.map((machine, i) =>
              i === index ? { ...machine, ...patch } : machine,
            ),
          })),
        })),
      removeMachine: (id, index) =>
        set((state) => ({
          factories: mapFactory(state.factories, id, (factory) => ({
            ...factory,
            machines: factory.machines.filter((_, i) => i !== index),
          })),
        })),
      addProduct: (id) =>
        set((state) => ({
          factories: mapFactory(state.factories, id, (factory) => ({
            ...factory,
            products: [
              ...factory.products,
              {
                id: `p-${Date.now()}`,
                name: "منتج جديد",
                category: "تيشيرت",
                fabric: "قطن",
                image: "/media/tee.jpg",
                tiers: [{ min: 50, max: null, price: 100 }],
              },
            ],
          })),
        })),
      updateProduct: (factoryId, productId, patch) =>
        set((state) => ({
          factories: mapFactory(state.factories, factoryId, (factory) => ({
            ...factory,
            products: factory.products.map((product) =>
              product.id === productId ? { ...product, ...patch } : product,
            ),
          })),
        })),
      removeProduct: (factoryId, productId) =>
        set((state) => ({
          factories: mapFactory(state.factories, factoryId, (factory) => ({
            ...factory,
            products: factory.products.filter((product) => product.id !== productId),
          })),
        })),
      addTier: (factoryId, productId) =>
        set((state) => ({
          factories: mapFactory(state.factories, factoryId, (factory) => ({
            ...factory,
            products: factory.products.map((product) =>
              product.id === productId
                ? {
                    ...product,
                    tiers: [...product.tiers, { min: 100, max: null, price: 90 }],
                  }
                : product,
            ),
          })),
        })),
      updateTier: (factoryId, productId, index, patch) =>
        set((state) => ({
          factories: mapFactory(state.factories, factoryId, (factory) => ({
            ...factory,
            products: factory.products.map((product) =>
              product.id === productId
                ? {
                    ...product,
                    tiers: product.tiers.map((tier, i) =>
                      i === index ? { ...tier, ...patch } : tier,
                    ),
                  }
                : product,
            ),
          })),
        })),
      removeTier: (factoryId, productId, index) =>
        set((state) => ({
          factories: mapFactory(state.factories, factoryId, (factory) => ({
            ...factory,
            products: factory.products.map((product) =>
              product.id === productId
                ? { ...product, tiers: product.tiers.filter((_, i) => i !== index) }
                : product,
            ),
          })),
        })),
      addFactory: (draft) => {
        const id = `f-${Date.now()}`;
        set((state) => ({
          factories: [
            {
              id,
              name: draft?.name?.trim() || "مصنع جديد",
              sectionId: draft?.sectionId || state.sections[0]?.id || "clothes",
              ownerUserId: draft?.ownerUserId || "",
              area: draft?.area || "شبرا الخيمة",
              address: draft?.address || "",
              phone: draft?.phone || "",
              qualityCode: "",
              status: "pending",
              dailyCapacity: draft?.dailyCapacity || 500,
              rating: 0,
              cover: "/media/workshop-1.jpg",
              specialties: draft?.specialties?.length ? draft.specialties : [],
              machines: draft?.machines?.length ? draft.machines : [{ type: "أوفر", count: 10 }],
              products: [],
              notes: draft?.notes || "",
            },
            ...state.factories,
          ],
        }));
        return id;
      },
    }),
    { name: "san3fimasr-factories", skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const sectionIds = new Set(state.sections?.map((section) => section.id) ?? []);
        const missingSections = SECTIONS.filter((section) => !sectionIds.has(section.id));
        const factories = (state.factories ?? []).map((factory) => ({
          ...factory,
          sectionId: factory.sectionId || "clothes",
          ownerUserId: factory.ownerUserId || "",
        }));
        const ids = new Set(factories.map((factory) => factory.id));
        const missing = seed.filter((factory) => !ids.has(factory.id));
        useFactories.setState({
          sections: [...(state.sections ?? []), ...missingSections],
          factories: [...factories, ...missing],
        });
      },
    },
  ),
);

export function sectionName(sections: Section[], id: string) {
  return sections.find((section) => section.id === id)?.name ?? "قسم آخر";
}

export function machineTotal(factory: Factory) {
  return factory.machines.reduce((sum, machine) => sum + machine.count, 0);
}

export function lowestPrice(factory: Factory) {
  const prices = factory.products.flatMap((product) => product.tiers.map((tier) => tier.price));
  if (!prices.length) return null;
  return Math.min(...prices);
}

export function quoteForQuantity(tiers: PriceTier[], quantity: number) {
  if (quantity <= 0 || !tiers.length) return null;
  const sorted = [...tiers].sort((a, b) => a.min - b.min);
  const match = sorted.find(
    (tier) => quantity >= tier.min && (tier.max == null || quantity <= tier.max),
  );
  return match?.price ?? null;
}

export function minimumQuantity(tiers: PriceTier[]) {
  if (!tiers.length) return 0;
  return Math.min(...tiers.map((tier) => tier.min));
}

export function money(value: number) {
  return `${value.toLocaleString("ar-EG")} ج`;
}

export function statusLabel(status: FactoryStatus) {
  if (status === "approved") return "معتمد";
  if (status === "pending") return "قيد المراجعة";
  if (status === "rejected") return "مرفوض";
  return "موقوف";
}

export function factoryMatches(factory: Factory, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    factory.name,
    factory.area,
    factory.address,
    factory.phone,
    factory.qualityCode,
    sectionName(useFactories.getState().sections, factory.sectionId),
    statusLabel(factory.status),
    ...factory.specialties,
    ...factory.machines.map((machine) => machine.type),
    ...factory.products.map((product) => `${product.name} ${product.category} ${product.fabric}`),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export const useFactorySearch = create<{ q: string; setQ: (q: string) => void }>((set) => ({
  q: "",
  setQ: (q) => set({ q }),
}));
