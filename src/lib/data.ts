export type Job = {
  role: string;
  company: string;
  date: string;
};

export type Project = {
  name: string;
  url: string;
  category: string;
  featured?: boolean;
};

export type Social = {
  label: string;
  href: string;
};

export const experience: Job[] = [
  { role: "Senior Frontend Engineer", company: "Complete Farmer LTD", date: "2019—" },
  { role: "Frontend Engineer", company: "Primer", date: "2022" },
  { role: "Frontend Developer", company: "Bee and Bloom", date: "2018—2020" },
];

export const projects: Project[] = [
  { name: "Reevit", url: "https://reevit.io/", category: "Payments", featured: true },
  { name: "Miss Cookie Spices", url: "https://misscookieghana.com/", category: "E-commerce", featured: true },
  { name: "Waytu", url: "https://www.waytu.io/", category: "Ride-sharing", featured: true },
  { name: "Drobotix", url: "https://drobotixas.com/", category: "Ag-Tech Drones", featured: true },
  { name: "Studio Theon", url: "https://www.studiotheon.com/", category: "Agency", featured: true },
  { name: "Dasheen Atelier", url: "https://dasheenatelier.com/", category: "Fashion", featured: true },
  { name: "Dronehub", url: "https://dronehub.vercel.app/", category: "Drones" },
  { name: "UAVOps", url: "https://uavops.vercel.app/", category: "Aerial Data" },
  { name: "Blavior", url: "https://blavior.io/", category: "Software" },
  { name: "The Rumson", url: "https://therumson.com", category: "Restaurant" },
  { name: "7even Sports Group", url: "https://7evensportsgroup.com", category: "Sports" },
  { name: "Push & Pull Cosmetics", url: "https://www.pnpcosmetics.com", category: "Skincare" },
  { name: "Janatribe", url: "https://janatribe.vercel.app/", category: "Wedding Platform" },
  { name: "CSS", url: "https://techbycss.com/", category: "Tech Solutions" },
  { name: "The Arck Interior LTD", url: "https://thearckinteriorltd.com/", category: "Interior Design" },
  { name: "Desmond Weds Akyeamaa", url: "https://dna-8a83.fly.dev", category: "Wedding" },
  { name: "Undisciplined", url: "https://undisciplined.xyz/", category: "Studio" },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const archiveProjects = projects.filter((p) => !p.featured);

export const socials: Social[] = [
  { label: "GitHub", href: "https://github.com/felixyeboah" },
  { label: "Twitter / X", href: "https://twitter.com/sudocode_" },
  { label: "Email", href: "mailto:me@felixyeboah.dev" },
  { label: "RSS", href: "/feed.xml" },
];
