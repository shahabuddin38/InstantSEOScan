import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap,
  Globe, Settings, FileText, Link2, Search, Gift, ChevronRight, ChevronDown
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'SEO Tools': true,
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const topMenuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  ];

  const collapsibleMenus = [
    {
      name: "SEO Tools",
      icon: <Search size={20} />,
      sections: [
        {
          label: "Site Audit",
          items: [
            { name: "CoreScan Engine", path: "/tools/corescan" },
            { name: "Technical Audit", path: "/tools/technical" },
            { name: "InfraSEO Analysis", path: "/tools/infra" },
          ],
        },
        {
          label: "On-Page SEO",
          items: [
            { name: "On-Page SEO AI", path: "/tools/on-page" },
            { name: "Content Score", path: "/ai-seo-content-score" },
            { name: "SEO Rewriter", path: "/ai-seo-rewrite-tool" },
            { name: "AI Overview", path: "/ai-overview-optimizer" },
            { name: "SEO Strategy Plan", path: "/tools/strategy-plan" },
            { name: "Schema Generator", path: "/schema-generator" },
          ],
        },
        {
          label: "Off-Page SEO",
          items: [
            { name: "Off-Page SEO AI", path: "/tools/off-page" },
            { name: "Authority Radar", path: "/tools/authority" },
          ],
        },
        {
          label: "Keyword & SERP",
          items: [
            { name: "Keyword Ideas", path: "/ai-keyword-ideas-tool" },
            { name: "Rank Checker", path: "/tools/google-keyword-rank-checker" },
            { name: "SERP Comparison", path: "/tools/serp-comparison" },
            { name: "Cannibalization", path: "/tools/keyword-cannibalization" },
            { name: "SERP Intent", path: "/tools/serp-intent-analyzer" },
            { name: "SERP Database", path: "/tools/free-serp-database" },
          ],
        },
        {
          label: "Programmatic SEO",
          items: [
            { name: "SEO Statistics", path: "/seo-statistics" },
            { name: "AI SEO Statistics", path: "/ai-seo-statistics" },
            { name: "Link Building Stats", path: "/link-building-statistics" },
            { name: "Local SEO Stats", path: "/local-seo-statistics" },
            { name: "Content Marketing Stats", path: "/content-marketing-statistics" },
            { name: "Google Ranking Stats", path: "/google-ranking-statistics" },
            { name: "Keyword Data Pages", path: "/keyword-data/seo-tools" },
            { name: "SERP Analysis Pages", path: "/serp-analysis/seo-tools" },
            { name: "Ranking Pages", path: "/ranking/seo-tools" },
            { name: "Compare Pages", path: "/compare/seo-tools-vs-keyword-research" },
          ],
        },
      ],
    },
  ];

  const bottomMenuItems = [
    { name: "Affiliate Program", path: "#", icon: <Gift size={20} className="text-indigo-600" /> },
    { name: "Settings", path: "/tools/mcp", icon: <Settings size={20} /> },
  ];

  const isItemActive = (path: string) => location.pathname === path;
  const isMenuActive = (menu: any) =>
    (menu.sections || []).some((section: any) => section.items.some((item: any) => isItemActive(item.path)));

  return (
    <aside className="w-72 bg-white border-r border-neutral-200 h-[calc(100vh-64px)] hidden lg:flex flex-col sticky top-16 overflow-y-auto custom-scrollbar shrink-0">
      <div className="p-4 flex-1">

        {/* Top Menu */}
        <nav className="space-y-1 mb-6">
          {topMenuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isItemActive(item.path)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
            >
              <span className={isItemActive(item.path) ? "text-indigo-600" : "text-neutral-400"}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="h-px bg-neutral-200 my-4 mx-4"></div>

        {/* Collapsible Menus */}
        <nav className="space-y-1 mb-6">
          {collapsibleMenus.map((menu) => {
            const active = isMenuActive(menu);
            const isOpen = openMenus[menu.name] || active;

            return (
              <div key={menu.name} className="mb-1">
                <button
                  onClick={() => toggleMenu(menu.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? "text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? "text-neutral-700" : "text-neutral-400"}>
                      {menu.icon}
                    </span>
                    {menu.name}
                  </div>
                  <span className="text-neutral-400">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-1 ml-4 pl-4 border-l-2 border-neutral-100 space-y-3">
                    {(menu.sections || []).map((section: any) => (
                      <div key={section.label} className="space-y-1">
                        <div className="px-4 pt-1 pb-1 text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                          {section.label}
                        </div>
                        {section.items.map((item: any) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isItemActive(item.path)
                                ? "bg-indigo-50 text-indigo-700 font-bold"
                                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                              }`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="h-px bg-neutral-200 my-4 mx-4"></div>

        {/* Bottom Menu */}
        <nav className="space-y-1">
          {bottomMenuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isItemActive(item.path)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
            >
              <span className={item.name === "Affiliate Program" ? "" : "text-neutral-400"}>
                {item.icon}
              </span>
              <span className={item.name === "Affiliate Program" ? "text-indigo-600" : ""}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

      </div>
    </aside>
  );
}
