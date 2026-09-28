/* Portfolio projects, latest first (source: design-options/site/data/projects.json).
   `featured` = the six landing tiles. `group` = work-index filter (?cat=products|commerce|drones|brands).
   Per-project case-study content lives in project-details.ts. */

export type ProjectGroup = 'products' | 'commerce' | 'drones' | 'brands';

export type Project = {
    order: number;
    slug: string;
    name: string;
    category: string;
    group: ProjectGroup;
    url: string;
    domain: string;
    cover: string;
    featured: boolean;
    desc: string;
};

export const GROUPS: Array<[ProjectGroup, string]> = [
    ['products', 'Products'],
    ['commerce', 'Commerce'],
    ['drones', 'Drones & aerial'],
    ['brands', 'Brands & events'],
];

export const PROJECTS: Project[] = [
    {
        order: 1,
        slug: "reevit",
        name: "Reevit",
        category: "Payments",
        group: "products",
        url: "https://reevit.io/",
        domain: "reevit.io",
        cover: "/assets/covers/reevit.jpg",
        featured: true,
        desc: "Payments that don't miss. When one provider goes down, the next one picks up and your customers never notice.",
    },
    {
        order: 2,
        slug: "miss-cookie-spices",
        name: "Miss Cookie Spices",
        category: "E-commerce",
        group: "commerce",
        url: "https://misscookieghana.com/",
        domain: "misscookieghana.com",
        cover: "/assets/covers/miss-cookie.jpg",
        featured: true,
        desc: "Premium Ghanaian spices and cooking ingredients, with a storefront built for mobile money.",
    },
    {
        order: 3,
        slug: "waytu",
        name: "Waytu",
        category: "Ride-sharing",
        group: "products",
        url: "https://www.waytu.io/",
        domain: "waytu.io",
        cover: "/assets/covers/waytu.jpg",
        featured: true,
        desc: "Community-driven ride-sharing that pairs nearby commuters for a cheaper, greener trip.",
    },
    {
        order: 4,
        slug: "drobotix",
        name: "Drobotix",
        category: "Ag-Tech Drones",
        group: "drones",
        url: "https://drobotixas.com/",
        domain: "drobotixas.com",
        cover: "/assets/covers/drobotix.jpg",
        featured: true,
        desc: "Drone technology, training and support that help farmers spray and survey at scale.",
    },
    {
        order: 5,
        slug: "studio-theon",
        name: "Studio Theon",
        category: "Agency",
        group: "commerce",
        url: "https://www.studiotheon.com/",
        domain: "studiotheon.com",
        cover: "/assets/covers/studio-theon.jpg",
        featured: true,
        desc: "A creative digital agency site with a storefront for seasonal souvenirs and gifts.",
    },
    {
        order: 6,
        slug: "dasheen-atelier",
        name: "Dasheen Atelier",
        category: "Fashion",
        group: "brands",
        url: "https://dasheenatelier.com/",
        domain: "dasheenatelier.com",
        cover: "/assets/covers/dasheen-atelier.jpg",
        featured: true,
        desc: "Made-to-measure bridal and traditional wear, finished by hand in Accra.",
    },
    {
        order: 7,
        slug: "dronehub",
        name: "Dronehub",
        category: "Drone sales & services",
        group: "drones",
        url: "https://www.dronehubafrica.com/",
        domain: "dronehubafrica.com",
        cover: "/assets/covers/dronehub.jpg",
        featured: false,
        desc: "Selling and servicing drones for consumer, enterprise and agriculture in Ghana.",
    },
    {
        order: 8,
        slug: "uavops",
        name: "UAVOps",
        category: "Aerial data intelligence",
        group: "drones",
        url: "https://uavops.vercel.app/",
        domain: "uavops.vercel.app",
        cover: "/assets/covers/uavops.jpg",
        featured: false,
        desc: "High-precision aerial intelligence that helps organisations make faster, safer and better-informed decisions.",
    },
    {
        order: 9,
        slug: "blavior",
        name: "Blavior",
        category: "Real estate",
        group: "products",
        url: "https://blavior.io/",
        domain: "blavior.io",
        cover: "/assets/covers/blavior.jpg",
        featured: false,
        desc: "A real estate connection platform, opening with a waitlist for agents, developers and property owners.",
    },
    {
        order: 10,
        slug: "the-rumson",
        name: "The Rumson",
        category: "Restaurant",
        group: "commerce",
        url: "https://therumson.com/",
        domain: "therumson.com",
        cover: "/assets/covers/the-rumson.jpg",
        featured: false,
        desc: "Elevated Ghanaian comfort food in the heart of Labone, with online ordering for dine-in, takeaway and delivery.",
    },
    {
        order: 11,
        slug: "7even-sports-group",
        name: "7even Sports Group",
        category: "Sports club",
        group: "brands",
        url: "https://7evensportsgroup.com/",
        domain: "7evensportsgroup.com",
        cover: "/assets/covers/7even-sports.jpg",
        featured: false,
        desc: "Empowering Ghana's grassroots athletes through leagues, development programmes and global exposure.",
    },
    {
        order: 12,
        slug: "css",
        name: "CSS",
        category: "Connectivity solutions",
        group: "brands",
        url: "https://techbycss.com/",
        domain: "techbycss.com",
        cover: "/assets/covers/css.jpg",
        featured: false,
        desc: "Communication and connectivity solutions for businesses.",
    },
    {
        order: 13,
        slug: "the-arck-interior",
        name: "The Arck Interior LTD",
        category: "Interior design",
        group: "brands",
        url: "https://thearckinteriorltd.com/",
        domain: "thearckinteriorltd.com",
        cover: "/assets/covers/the-arck.jpg",
        featured: false,
        desc: "Thoughtfully designed kitchens and living spaces that reflect your personality and style.",
    },
    {
        order: 14,
        slug: "desmond-weds-akyeamaa",
        name: "Desmond Weds Akyeamaa",
        category: "Wedding",
        group: "brands",
        url: "https://dna-8a83.fly.dev/",
        domain: "dna-8a83.fly.dev",
        cover: "/assets/covers/dna.jpg",
        featured: false,
        desc: "A wedding site for Desmond and Akyeamaa to share their love story with invited guests.",
    },
    {
        order: 15,
        slug: "undisciplined",
        name: "Undisciplined",
        category: "Education",
        group: "products",
        url: "https://undisciplined.vercel.app/",
        domain: "undisciplined.vercel.app",
        cover: "/assets/covers/undisciplined.jpg",
        featured: false,
        desc: "Education that's about understanding and applying knowledge to solve real-world problems.",
    },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
export const pad2 = (n: number) => String(n).padStart(2, '0');
