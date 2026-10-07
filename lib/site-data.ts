// Content from the Frontend Mentor starter pages. Pages render from this data so the
// three design categories share one template.

export const siteName = "Designo";

export const navLinks = [
  { href: "/about", label: "Our company" },
  { href: "/locations", label: "Locations" },
  { href: "/contact", label: "Contact" },
] as const;

export type CategorySlug = "web-design" | "app-design" | "graphic-design";

export type Project = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

export type Category = {
  slug: CategorySlug;
  title: string;
  intro: string;
  metaDescription: string;
  card: { mobile: string; tablet: string; desktop: string; homeDesktop?: string };
  projects: Project[];
};

const project = (category: CategorySlug, file: string, title: string, description: string, alt: string): Project => ({
  title,
  description,
  image: `/assets/${category}/desktop/image-${file}.jpg`,
  alt,
});

export const categories: Category[] = [
  {
    slug: "web-design",
    title: "Web Design",
    intro: "We build websites that serve as powerful marketing tools and bring memorable brand experiences.",
    metaDescription: "Six Designo website projects, from a multi-carrier shipping site to a coding bootcamp, built as marketing tools with memorable brand experiences.",
    card: {
      mobile: "/assets/home/mobile/image-web-design.jpg",
      tablet: "/assets/home/tablet/image-web-design.jpg",
      desktop: "/assets/home/desktop/image-web-design-small.jpg",
      homeDesktop: "/assets/home/desktop/image-web-design-large.jpg",
    },
    projects: [
      project("web-design", "express", "Express", "A multi-carrier shipping website for ecommerce businesses", "Express homepage with delivery trucks and the headline Get Smarter Shipping for Less"),
      project("web-design", "transfer", "Transfer", "Site for low-cost money transfers and sending money within seconds", "Transfer homepage with two phones and the headline The freedom of transfer with no cuts"),
      project("web-design", "photon", "Photon", "A state-of-the-art music player with high-resolution audio and DSP effects", "Photon homepage with headphones and the headline Professional Grade Hifi App"),
      project("web-design", "builder", "Builder", "Connects users with local contractors based on their location", "Builder homepage with a living room photo and the headline The Free Contractor, You Can Truly Trust"),
      project("web-design", "blogr", "Blogr", "Blogr is a platform for creating an online blog or publication", "Blogr homepage with a coral header and the headline The true publishing platform"),
      project("web-design", "camp", "Camp", "Get expert training in coding, data, design, and digital marketing", "Camp homepage with course cards under the headline The future starts here"),
    ],
  },
  {
    slug: "app-design",
    title: "App Design",
    intro: "Our mobile designs bring intuitive digital solutions to your customers right at their fingertips.",
    metaDescription: "Five Designo mobile app projects, including an air filter controller, a photo editor and a VR experience, designed for everyday use.",
    card: {
      mobile: "/assets/home/mobile/image-app-design.jpg",
      tablet: "/assets/home/tablet/image-app-design.jpg",
      desktop: "/assets/home/desktop/image-app-design.jpg",
    },
    projects: [
      project("app-design", "airfilter", "Airfilter", "Solving the problem of poor indoor air quality by filtering the air", "Airfilter app screen with the headline Introducing Type 2021"),
      project("app-design", "eyecam", "Eyecam", "Product that lets you edit your favorite photos and videos at any time", "Eyecam app screen showing a dual-lens camera on teal"),
      project("app-design", "faceit", "Faceit", "Get to meet your favorite internet superstar with the faceit app", "Faceit app screen with the headline meet faceit"),
      project("app-design", "todo", "Todo", "A todo app that features cloud sync with light and dark mode", "Todo app in dark mode listing tasks on purple"),
      project("app-design", "loopstudios", "Loopstudios", "A VR experience app made for Loopstudios", "Loopstudios app screen with the headline Striving to be the edge of innovation"),
    ],
  },
  {
    slug: "graphic-design",
    title: "Graphic Design",
    intro: "We deliver eye-catching branding materials that are tailored to meet your business objectives.",
    metaDescription: "Three Designo graphic design projects: a book cover for Tim Brown, Boxed Water packaging and a Federal Art Project poster.",
    card: {
      mobile: "/assets/home/mobile/image-graphic-design.jpg",
      tablet: "/assets/home/tablet/image-graphic-design.jpg",
      desktop: "/assets/home/desktop/image-graphic-design.jpg",
    },
    projects: [
      project("graphic-design", "change", "Tim Brown", "A book cover designed for Tim Brown’s new release, ‘Change’", "Orange Change by Design book cover by Tim Brown on a desk"),
      project("graphic-design", "boxed-water", "Boxed Water", "A simple packaging concept made for Boxed Water", "A Boxed Water Is Better carton among green leaves"),
      project("graphic-design", "science", "Science!", "A poster made in collaboration with the Federal Art Project", "Keeping Up poster with an eye and a hand drawn in rings"),
    ],
  },
];

export const categoryBySlug = (slug: string) => categories.find(category => category.slug === slug);

export type LocationSlug = "canada" | "australia" | "united-kingdom";

export type Office = {
  slug: LocationSlug;
  country: string;
  illustration: string;
  office: string;
  street: string;
  region: string;
  phone: string;
  email: string;
  map: { mobile: string; tablet: string; desktop: string; alt: string };
};

export const offices: Office[] = [
  {
    slug: "canada",
    country: "Canada",
    illustration: "/assets/shared/desktop/illustration-canada.svg",
    office: "Designo Central Office",
    street: "3886 Wellington Street",
    region: "Toronto, Ontario M9C 3J5",
    phone: "+1 253-863-8967",
    email: "contact@designo.co",
    map: {
      mobile: "/assets/locations/desktop/image-map-canada.png",
      tablet: "/assets/locations/tablet/image-map-canada.png",
      desktop: "/assets/locations/desktop/image-map-canada.png",
      alt: "Street map of Scarborough on the Lake Ontario shore in Toronto",
    },
  },
  {
    slug: "australia",
    country: "Australia",
    illustration: "/assets/shared/desktop/illustration-australia.svg",
    office: "Designo AU Office",
    street: "19 Balonne Street",
    region: "New South Wales 2443",
    phone: "(02) 6720 9092",
    email: "contact@designo.au",
    map: {
      mobile: "/assets/locations/desktop/image-map-australia.png",
      tablet: "/assets/locations/tablet/image-map-australia.png",
      desktop: "/assets/locations/desktop/image-map-australia.png",
      alt: "Map of the New South Wales coast around Morisset and Caves Beach",
    },
  },
  {
    slug: "united-kingdom",
    country: "United Kingdom",
    illustration: "/assets/shared/desktop/illustration-united-kingdom.svg",
    office: "Designo UK Office",
    street: "13 Colorado Way",
    region: "Rhyd-y-fro SA8 9GA",
    phone: "078 3115 1400",
    email: "contact@designo.uk",
    map: {
      mobile: "/assets/locations/desktop/image-map-united-kingdom.png",
      tablet: "/assets/locations/tablet/image-map-uk.png",
      desktop: "/assets/locations/desktop/image-map-united-kingdom.png",
      alt: "Street map of the river and lakes around Ferry Fryston",
    },
  },
];

export const centralOffice = offices[0];
