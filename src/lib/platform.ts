import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MODULES = [
  { id: "overview", label: "نظرة عامة", to: "/admin" },
  { id: "factories", label: "المصانع", to: "/factories" },
  { id: "orders", label: "الطلبات", to: "/admin/orders" },
  { id: "employees", label: "الموظفون", to: "/admin/employees" },
  { id: "campaigns", label: "الحملات", to: "/admin/campaigns" },
  { id: "field", label: "التسويق الميداني", to: "/admin/field" },
  { id: "accounts", label: "الحسابات", to: "/admin/accounts" },
  { id: "quality", label: "الجودة", to: "/admin/quality" },
  { id: "products", label: "تطوير المنتجات", to: "/admin/products" },
  { id: "projects", label: "المشروعات", to: "/admin/projects" },
  { id: "consultations", label: "الاستشارات", to: "/admin/consultations" },
  { id: "departments", label: "الأقسام", to: "/admin/departments" },
] as const;

export type ModuleId = (typeof MODULES)[number]["id"];

export type OrderStatus = "new" | "reviewing" | "accepted" | "declined";
export type OrderMode = "listed" | "offer";

export type Order = {
  id: string;
  factoryId: string;
  factoryName: string;
  productName: string;
  quantity: number;
  mode: OrderMode;
  unitPrice: number;
  buyerName: string;
  phone: string;
  note: string;
  status: OrderStatus;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  phone: string;
  permissions: ModuleId[];
};

export type CampaignStatus = "planned" | "running" | "done";

export type Campaign = {
  id: string;
  name: string;
  area: string;
  budget: number;
  status: CampaignStatus;
  note: string;
};

export type Visit = {
  id: string;
  factoryName: string;
  agent: string;
  area: string;
  result: string;
  note: string;
};

export type InspectionResult = "pending" | "pass" | "fail";

export type Inspection = {
  id: string;
  factoryId: string;
  factoryName: string;
  result: InspectionResult;
  note: string;
};

export type Idea = {
  id: string;
  title: string;
  audience: string;
  margin: string;
  note: string;
};

export type ProjectStage = "study" | "contract" | "production" | "delivered";

export type Project = {
  id: string;
  name: string;
  client: string;
  factoryName: string;
  stage: ProjectStage;
  note: string;
};

export type ConsultStatus = "new" | "in_progress" | "done";

export type Consultation = {
  id: string;
  name: string;
  phone: string;
  capital: string;
  idea: string;
  target: string;
  status: ConsultStatus;
};

export type Department = { id: string; name: string; duty: string };

type PlatformState = {
  activeEmployeeId: string;
  orders: Order[];
  employees: Employee[];
  campaigns: Campaign[];
  visits: Visit[];
  inspections: Inspection[];
  ideas: Idea[];
  projects: Project[];
  consultations: Consultation[];
  departments: Department[];
  plans: Record<string, "free" | "subscribed">;
  setActiveEmployee: (id: string) => void;
  addOrder: (order: Omit<Order, "id" | "status">) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  addEmployee: (employee: Omit<Employee, "id">) => void;
  togglePermission: (id: string, moduleId: ModuleId) => void;
  removeEmployee: (id: string) => void;
  addCampaign: (campaign: Omit<Campaign, "id" | "status">) => void;
  setCampaignStatus: (id: string, status: CampaignStatus) => void;
  addVisit: (visit: Omit<Visit, "id">) => void;
  addInspection: (inspection: Omit<Inspection, "id">) => void;
  addIdea: (idea: Omit<Idea, "id">) => void;
  addProject: (project: Omit<Project, "id">) => void;
  setProjectStage: (id: string, stage: ProjectStage) => void;
  addConsultation: (consultation: Omit<Consultation, "id" | "status">) => void;
  setConsultationStatus: (id: string, status: ConsultStatus) => void;
  addDepartment: (department: Omit<Department, "id">) => void;
  setPlan: (factoryId: string, plan: "free" | "subscribed") => void;
};

function nid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const usePlatform = create<PlatformState>()(
  persist(
    (set) => ({
      activeEmployeeId: "owner",
      orders: [
        {
          id: "o-seed",
          factoryId: "kheir",
          factoryName: "مصنع الخير للملابس",
          productName: "تيشيرت قطن سادة",
          quantity: 200,
          mode: "listed",
          unitPrice: 105,
          buyerName: "أحمد منصور",
          phone: "01011112222",
          note: "لون أبيض وأسود، تسليم خلال 3 أسابيع.",
          status: "new",
        },
      ],
      employees: [
        {
          id: "e-market",
          name: "سارة فهمي",
          role: "تسويق ميداني",
          phone: "01020000001",
          permissions: ["factories", "field", "campaigns"],
        },
        {
          id: "e-quality",
          name: "محمود عادل",
          role: "رقابة جودة",
          phone: "01020000002",
          permissions: ["factories", "quality"],
        },
        {
          id: "e-consult",
          name: "ليلى حسن",
          role: "استشارات",
          phone: "01020000003",
          permissions: ["consultations", "products", "projects"],
        },
      ],
      campaigns: [
        {
          id: "c-shubra",
          name: "حملة شبرا الخيمة",
          area: "شبرا الخيمة وباسوس وبهتيم",
          budget: 80000,
          status: "running",
          note: "فريق أرضي يعرّف الورش على المنصة ويجمع البيانات.",
        },
      ],
      visits: [
        {
          id: "v-kheir",
          factoryName: "مصنع الخير للملابس",
          agent: "سارة فهمي",
          area: "بيجام",
          result: "سجّل",
          note: "الورشة بعيدة عن المنطقة الصناعية ومعاها عينات جاهزة.",
        },
      ],
      inspections: [
        {
          id: "q-kheir",
          factoryId: "kheir",
          factoryName: "مصنع الخير للملابس",
          result: "pass",
          note: "خياطة منتظمة. صدر كود SM-2026-014.",
        },
      ],
      ideas: [
        {
          id: "i-hoodie",
          title: "هودي شتوي قطن ثقيل",
          audience: "محلات الملابس في القاهرة والجيزة",
          margin: "تكلفة 220 ج، بيع جملة مقترح 310 ج",
          note: "يُصنَّع عند الغير في مصنع الخير. التسويق يبدأ بعينة لـ 20 محل.",
        },
      ],
      projects: [
        {
          id: "p-uniform",
          name: "يونيفورم شركة توصيل",
          client: "شركة مسار",
          factoryName: "مصنع الخواجة",
          stage: "study",
          note: "500 قطعة ترنج. في انتظار اعتماد الجودة.",
        },
      ],
      consultations: [
        {
          id: "k-seed",
          name: "هاني عبد الله",
          phone: "01100004455",
          capital: "400 ألف جنيه",
          idea: "خط تيشيرتات سادة للبيع أونلاين",
          target: "شباب 18–30 في القاهرة",
          status: "new",
        },
      ],
      departments: [
        { id: "d-field", name: "التسويق الميداني", duty: "جمع بيانات الورش والتعريف بالمنصة." },
        { id: "d-quality", name: "رقابة الجودة", duty: "زيارة المصنع وإصدار كود التصنيع." },
        { id: "d-ops", name: "التشغيل", duty: "ربط الطلبات والعروض بالمصانع." },
        { id: "d-product", name: "تطوير المنتجات", duty: "اختيار المنتج وحساب التكلفة والهامش." },
        { id: "d-consult", name: "الاستشارات", duty: "توجيه أصحاب رؤوس الأموال حتى الربح." },
        { id: "d-accounts", name: "الحسابات", duty: "السنة الأولى مجانية، وبعدها اشتراك." },
      ],
      plans: { kheir: "free", khawaga: "free", sayyad: "free", happy: "free" },
      setActiveEmployee: (id) => set({ activeEmployeeId: id }),
      addOrder: (order) =>
        set((state) => ({ orders: [{ ...order, id: nid("o"), status: "new" }, ...state.orders] })),
      setOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.id === id ? { ...order, status } : order)),
        })),
      addEmployee: (employee) =>
        set((state) => ({ employees: [{ ...employee, id: nid("e") }, ...state.employees] })),
      togglePermission: (id, moduleId) =>
        set((state) => ({
          employees: state.employees.map((employee) => {
            if (employee.id !== id) return employee;
            const has = employee.permissions.includes(moduleId);
            return {
              ...employee,
              permissions: has
                ? employee.permissions.filter((item) => item !== moduleId)
                : [...employee.permissions, moduleId],
            };
          }),
        })),
      removeEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((employee) => employee.id !== id),
          activeEmployeeId: state.activeEmployeeId === id ? "owner" : state.activeEmployeeId,
        })),
      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [{ ...campaign, id: nid("c"), status: "planned" }, ...state.campaigns],
        })),
      setCampaignStatus: (id, status) =>
        set((state) => ({
          campaigns: state.campaigns.map((campaign) =>
            campaign.id === id ? { ...campaign, status } : campaign,
          ),
        })),
      addVisit: (visit) =>
        set((state) => ({ visits: [{ ...visit, id: nid("v") }, ...state.visits] })),
      addInspection: (inspection) =>
        set((state) => ({
          inspections: [{ ...inspection, id: nid("q") }, ...state.inspections],
        })),
      addIdea: (idea) => set((state) => ({ ideas: [{ ...idea, id: nid("i") }, ...state.ideas] })),
      addProject: (project) =>
        set((state) => ({ projects: [{ ...project, id: nid("p") }, ...state.projects] })),
      setProjectStage: (id, stage) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, stage } : project,
          ),
        })),
      addConsultation: (consultation) =>
        set((state) => ({
          consultations: [
            { ...consultation, id: nid("k"), status: "new" },
            ...state.consultations,
          ],
        })),
      setConsultationStatus: (id, status) =>
        set((state) => ({
          consultations: state.consultations.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        })),
      addDepartment: (department) =>
        set((state) => ({
          departments: [...state.departments, { ...department, id: nid("d") }],
        })),
      setPlan: (factoryId, plan) =>
        set((state) => ({ plans: { ...state.plans, [factoryId]: plan } })),
    }),
    { name: "san3fimasr-platform", skipHydration: true },
  ),
);

export function canAccess(
  employees: { id: string; permissions: readonly string[] }[],
  activeEmployeeId: string,
  moduleId: string,
) {
  if (activeEmployeeId === "owner") return true;
  const employee = employees.find((item) => item.id === activeEmployeeId);
  return employee?.permissions.includes(moduleId as ModuleId) ?? false;
}

export function orderStatusLabel(status: OrderStatus) {
  if (status === "new") return "جديد";
  if (status === "reviewing") return "قيد المراجعة";
  if (status === "accepted") return "مقبول";
  return "مرفوض";
}

export function campaignStatusLabel(status: CampaignStatus) {
  if (status === "planned") return "مخططة";
  if (status === "running") return "جارية";
  return "منتهية";
}

export function projectStageLabel(stage: ProjectStage) {
  if (stage === "study") return "دراسة";
  if (stage === "contract") return "تعاقد";
  if (stage === "production") return "تنفيذ";
  return "تسليم";
}

export function consultStatusLabel(status: ConsultStatus) {
  if (status === "new") return "جديد";
  if (status === "in_progress") return "جاري";
  return "تم التوجيه";
}
