import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon, Rotate3d } from "lucide-react";

export const DATA = {
  name: "Mubarak Odetunde (Black)",
  initials: "Black",
  url: "https://www.whoisblxck.xyz/",
  location: "Lagos, Nigeria",
  locationLink: "https://goo.gl/maps/8Q1KZJ8v1Zz",
  description:
    "Frontend dev | React/TypeScript/Three.js | Building 3D web experiences | Intrested in building cool stuff.",
  summary:
    "Hi! I’m Mubarak, a Frontend Engineer passionate about building seamless, high-performance interfaces. I work with JavaScript, TypeScript, React, and Three.js to create engaging and interactive user experiences across platforms. With a strong eye for aesthetics and design, I take a design-first approach to development, ensuring every project I build is as visually stunning as it is functional.",
  avatarUrl: "/me.png",
  skills: [
    "Typescript",
    "React",
    "Next.js",
    "React Native",
    "Three.js",
    "React Three Fiber",
    "Framer Motion",
    "GSAP",
    "Tailwind CSS",
    "TanStack Query",
    "Redux",
    "Zustand",
    "Supabase",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
    { href: "/3d", icon: Rotate3d, label: "3D" },
  ],
  contact: {
    email: "odetundemubarak04@gmail.com",
    tel: "+2348140120760",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/blackingg",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/mubarak-odetunde-258494236/",
        icon: Icons.linkedin,

        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/whoisBlxck",
        icon: Icons.x,

        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:odetundemubarak04@gmail.com",
        icon: Icons.email,

        navbar: false,
      },
    },
  },

  work: [
    {
      company: "Bayse Markets (formerly Gowagr)",
      href: "https://www.bayse.markets/",
      badges: ["React", "TypeScript", "TailwindCSS", "TanStack Query"],
      location: "Remote",
      title: "Frontend Engineer (Contract)",
      logoUrl: "/bayse.jpg",
      start: "February 2026",
      end: "Present",
      description:
        "Modernizing and scaling the frontend architecture for a decentralized prediction market platform.",
      featured: true,
      responsibilities: [],
    },
    {
      company: "Seedwills",
      href: "",
      badges: ["React", "Redux Toolkit", "Ant Design", "TailwindCSS"],
      location: "Remote",
      title: "Frontend Engineer (Contract)",
      logoUrl: "/seedwills.png",
      start: "December 2025",
      end: "February 2026",
      description:
        "Built and led frontend engineering for a digital estate planning platform enabling users to create legal wills and manage assets.",
      featured: true,
      responsibilities: [
        "Led frontend architecture using React, Redux Toolkit, Tailwind CSS, Ant Design, and modular component design.",
        "Built responsive, multi-step wizard workflows for Will creation, covering Executors • Guardians • Asset Distribution, ensuring a seamless user experience for sensitive tasks.",
        "Engineered a dynamic navigation stepper that reads backend metadata to intelligently route users through incomplete sections, replacing hardcoded flows with a personalized, context-aware experience based on real-time form completion status.",
        "Developed a comprehensive Admin Dashboard for managing Users, Plans, and Document generation requests.",
        "Implemented robust global state management with Redux to handle persistent form data across complex application flows.",
        "Integrated frontend payment flows with Paystack, handling checkout states, VAT calculations, and document printing services.",
        "Collaborated on RESTful API integrations to secure confidential user data and generate legal documents from frontend inputs.",
        "Optimized build performance and application load times using code splitting and lazy loading components.",
      ],
    },
    {
      company: "Porfolio Website for a Senior Lecturer",
      href: "https://www.marufatoluyemisiodetunde.com/",
      badges: ["HTML", "TailwindCSS"],
      location: "Remote",
      title: "Frontend Engineer",
      logoUrl: "",
      start: "Sept 2025",
      end: "",
      featured: true,
      description:
        "Built a professional portfolio website for a senior lecturer to showcase academic credentials and research.",
      responsibilities: [
        "Designed and implemented a clean, responsive landing page highlighting professional background and publications.",
        "Ensured seamless navigation and mobile responsiveness using TailwindCSS.",
        "Structured academic data for easy discovery and readability.",
        "Delivered a design-first solution meeting specific academic branding requirements.",
      ],
    },
    {
      company: "Onetro",
      badges: ["React", "TypeScript", "TailwindCSS"],
      href: "https://onetro.co/",
      location: "Remote",
      title: "Frontend Engineer (Contract)",
      logoUrl: "/onetro.png",
      start: "June 2025",
      end: "Aug 2025",
      featured: true,
      description:
        "Architected a high-performance booking ecosystem for Onetro, leveraging advanced CSS transforms and Tailwind to deliver immersive, 3D-inspired interactions.",
      responsibilities: [
        "Owned and scaled the frontend within an existing TypeScript architecture, resolving critical issues and improving feature reliability.",
        "Integrated backend APIs with strong type safety to ensure accurate, real-time data synchronization across the platform.",
        "Optimized the booking system to support one-on-one and group sessions, improving performance and user flow efficiency.",
        "Implemented secure Google OAuth authentication for seamless user onboarding and access control.",
        "Built the 3D customizable flippable Onetro Card using hardware-accelerated CSS transforms for high-performance visual effects.",
        "Developed the public-facing page and improved responsiveness, accessibility, and cross-device consistency.",
      ],
    },
    {
      company: "Brilstash",
      href: "https://brilstash.com/",
      badges: ["React", "NextJs", "Typescript", "TailwindCSS"],
      location: "Remote",
      title: "Frontend Engineer (Contract)",
      logoUrl: "/brilstash.png",
      start: "June 2025",
      end: "Aug 2025",
      description:
        "Developed core landing pages and internal dashboards for a financial services platform.",
      responsibilities: [
        "Built responsive landing pages and user authentication workflows.",
        "Implemented complex partner onboarding forms and loan processing dashboards.",
        "Integrated real-time feedback systems and backend APIs for loan verification.",
        "Ensured high performance and accessibility across all user-facing components.",
      ],
    },
    {
      company: "Brilstack",
      href: "https://brilstack.com/",
      badges: ["React", "Typescript", "TailwindCSS"],
      location: "Remote",
      title: "Frontend Engineer (Contract)",
      logoUrl: "/brilstack.png",
      start: "March 2025",
      end: "May 2025",
      description:
        "Focused on performance optimization and UI/UX modernization of data-heavy applications.",
      responsibilities: [
        "Partnered with backend engineers to optimize API contracts and reduce UI-level latency, improving overall system responsiveness.",
        "Engineered scalable pagination and filtering logic for data-intensive views, ensuring efficient rendering and smooth user interaction.",
        "Optimized frontend performance through improved state management patterns and render optimization strategies.",
        "Refactored legacy code and eliminated redundancy to enhance maintainability, architectural clarity, and long-term scalability.",
        "Reimagined complex data-driven user flows, delivering a cleaner, more intuitive interface aligned with modern UX standards.",
        "Strengthened application stability by identifying performance bottlenecks, resolving edge cases, and enforcing better code organization practices.",
      ],
    },
  ],
  education: [
    {
      school: "Obafemi Awolowo University",
      href: "https://oauife.edu.ng/",
      degree: "Bachelor's Degree of Computer Science with Economics (BSC)",
      logoUrl: "/oau.png",
      start: "",
      end: "",
      // start: "2021",
      // end: "Present",
    },
  ],
  projects: [
    {
      title: "Shelf",
      href: "https://www.shelf.ng/",
      dates: "Nov 2025",
      active: true,
      featured: true,
      description:
        "Shelf is a cross-platform e-library I founded to make it easier for Nigerian students and readers to discover, share, and preserve digital archives. It brings together textbooks, novels, magazines, comics, and school notes in one accessible, community-driven platform, with organized public and private folders, smart search, and a clean, responsive interface for seamless reading across devices. As the founder, I defined the project structure and roadmap, designed the entire user experience from scratch, and built the responsive frontend that powers content discovery and interaction. I also established the moderation and verification model that ensures authenticity and supports Shelf’s vision of an open, sustainable, community-led digital library.",
      technologies: ["Next.js", "Typescript", "TailwindCSS", "Framer Motion"],
      links: [
        {
          type: "Source - Web",
          href: "https://www.shelf.ng/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "GitHub",
          href: "https://github.com/blackingg/shelf",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/shelf.png",
      video: "",
    },
    {
      title: "OAUHomes",
      href: "https://www.oauhomes.org/",
      dates: "Oct 2025",
      active: true,
      featured: true,
      description:
        "OAU Homes is a Next.js platform that connects OAU students directly with verified housing agents to reduce inflated accommodation prices. The platform offers a clean, responsive interface with search and filtering tools, plus verified agent profiles for transparency. I built the frontend in Next.js and Tailwind CSS, collaborated with a backend developer within the same repo, and personally handled the UI design from scratch. I also created clear listing layouts and optimized the experience for mobile users.",
      technologies: ["Next.js", "Typescript", "TailwindCSS", "React"],
      links: [
        {
          type: "Source - Web",
          href: "https://www.oauhomes.org/",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/oauhomes.png",
      video: "",
    },
    {
      title: "SokoFunds",
      href: "https://github.com/blackingg/SokoFunds",
      dates: "Nov 2025 - Jan 2026",
      active: true,
      featured: true,
      description:
        "SokoFunds is a fintech mobile application built to provide a modern banking experience. It features real-time balance tracking, secure money transfers, investment management for assets like tech stocks and real estate, and digital card management. The app focuses on a sleek Glassmorphism design with smooth animations for a premium user experience.",
      technologies: [
        "React Native",
        "Expo",
        "TypeScript",
        "Zustand",
        "NativeWind",
        "Reanimated",
      ],
      links: [
        {
          type: "GitHub",
          href: "https://github.com/blackingg/SokoFunds",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/sokofunds.png",
      video: "",
    },
    {
      title: "SokoFunds Landing",
      href: "https://sokofunds-blackingg.vercel.app/",
      dates: "Jan 2026",
      active: true,
      featured: true,
      description:
        "The official landing page for the SokoFunds application, designed to showcase the app's premium features with high-end aesthetics. It includes a responsive device selector for app previews, smooth Framer Motion animations, and a modern UI that aligns with the SokoFunds brand identity.",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
      links: [
        {
          type: "Source - Web",
          href: "https://sokofunds-blackingg.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "GitHub",
          href: "https://github.com/blackingg/SokoFunds-landing",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/sokofunds-landing.png",
      video: "",
    },
    {
      title: "Doggearth",
      href: "https://t.me/doggearth_bot",
      dates: "Sept 2025",
      active: true,
      description:
        "Doggverse is a Telegram Mini App for buying virtual land across three metaverse islands with a 3D viewer. The platform features a Three.js interface with touch controls (swipe, pinch, tap), color filtering, and wallet integration. I built the frontend in React, TypeScript, and Tailwind CSS, implemented centralized state management for data consistency, and designed the Telegram-style UI. I created the 3D visualization with custom camera controls and optimized for mobile users.",
      technologies: ["React", "TypeScript", "TailwindCSS", "Three.js"],
      links: [
        {
          type: "Source - Telegram",
          href: "https://t.me/doggearth_bot",
          icon: <Icons.telegram className="size-3" />,
        },
        {
          type: "GitHub",
          href: "https://github.com/blackingg/doggverse",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/doggearth.png",
      video: "",
    },
    {
      title: "NOTDOG",
      href: "https://notdog-blackingg.vercel.app/",
      dates: "Dec 2025",
      active: true,
      description:
        "NOTDOG is a playful Solana-themed memecoin project built as a fun, interactive web experience. The site blends meme culture with blockchain-inspired visuals, featuring smooth animations, dynamic UI elements, and collectible-style graphics. Designed as a frontend-focused project, it highlights responsive design, fluid interactions, and a colorful, engaging interface that brings the memecoin aesthetic to life.",
      technologies: ["React", "TailwindCSS", "Framer Motion"],
      links: [
        {
          type: "Source - Web",
          href: "https://notdog-blackingg.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "GitHub",
          href: "https://github.com/blackingg/NotDog",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/notdog.png",
      video: "",
    },
    {
      title: "Breakfast Place",
      href: "https://breakfastplace-blackingg.vercel.app/",
      dates: "Oct 2023",
      active: true,
      description:
        "The Breakfast Place is an innovative e-commerce web application for a restaurant, featuring interactive 3D models of customizable breakfast items and real-time 3D rendering of user-created meals. It is integrated with Supabase for efficient data management and designed responsively to deliver a seamless experience across all devices.",
      technologies: [
        "Three.js",
        "React Three Fiber",
        "Supabase",
        "GSAP",
        "TailwindCSS",
      ],
      links: [
        {
          type: "Source - Web",
          href: "https://breakfastplace-blackingg.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "GitHub",
          href: "https://github.com/blackingg/resturant_webapp",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/breakfastplace.png",
      video: "",
    },
    {
      title: "Artist Music Site",
      href: "https://dafash.vercel.app/",
      dates: "Oct 2024",
      active: true,
      description:
        "This is a sleek, animated music-themed web application for the artist Dafash, featuring a dynamic, motion-powered UI with smooth transitions using Framer Motion. It offers interactive horizontal album previews with modal pop-ups for detailed views, built with a modular architecture using reusable components like AlbumCard and Modal. Tailwind CSS was used for rapid, responsive styling across all screen sizes.",
      technologies: ["React", "TailwindCSS", "Framer Motion"],
      links: [
        {
          type: "Source - Web",
          href: "https://dafash.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "GitHub",
          href: "https://github.com/blackingg/artistPorflio",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/dafash.png",
      video: "",
    },
    {
      title: "Pokedex",
      href: "https://pokedex-blackingg.vercel.app/",
      dates: "...",
      active: true,
      description:
        "A site filled with free pictures and videos that can be download on the pexels main site. This was built with Next.js, Tailwind CSS, pexels Api, Framer motion.",
      technologies: ["Next.js", "Typescript", "TailwindCSS"],
      links: [
        {
          type: "Source - Web",
          href: "https://pokedex-blackingg.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "GitHub",
          href: "https://github.com/blackingg/pokedex",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/pokedex.png",
      video: "",
    },
  ],
  hackathons: [],
} as const;
