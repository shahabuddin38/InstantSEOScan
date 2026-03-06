export default function Sitemap() {
  const base = "https://instantseoscan.com";
  const links = [
    { title: "Main Pages", items: [
      { name: "Home", path: `${base}/` },
      { name: "Pricing", path: `${base}/pricing` },
      { name: "Blog", path: `${base}/blog` },
      { name: "About Us", path: `${base}/about` },
      { name: "Contact", path: `${base}/contact` },
    ]},
    { title: "Platform", items: [
      { name: "Dashboard", path: `${base}/dashboard` },
      { name: "Login", path: `${base}/login` },
      { name: "Register", path: `${base}/login` },
    ]},
    { title: "Legal", items: [
      { name: "Privacy Policy", path: `${base}/privacy` },
      { name: "Terms of Service", path: `${base}/terms` },
    ]}
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="text-4xl font-bold mb-12">HTML Sitemap</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {links.map((section, i) => (
          <div key={i}>
            <h2 className="text-xl font-bold mb-6 text-emerald-600">{section.title}</h2>
            <ul className="space-y-4">
              {section.items.map((item, j) => (
                <li key={j}>
                  <a href={item.path} className="text-neutral-600 hover:text-emerald-600 transition-colors font-medium">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
