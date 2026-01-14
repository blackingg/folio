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
    "Hi! I’m Mubarak, a frontend engineer passionate about building seamless, high-performance interfaces. I work with JavaScript, TypeScript, React, and Three.js to create engaging and interactive user experiences across platforms. With a strong eye for aesthetics and design, I take a design-first approach to development, ensuring every project I build is as visually stunning as it is functional.",
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
      company: "Porfolio Website for a Senior Lecturer",
      href: "https://www.marufatoluyemisiodetunde.com/",
      badges: ["HTML", "TailwindCSS"],
      location: "Remote",
      title: "Frontend engineer",
      logoUrl: "",
      start: "Sept 2025",
      end: "",
      description:
        "This is a portfolio website for a senior lecturer, built to showcase the lecturer’s professional profile, academic credentials, research interests, and services. The site features a clean, responsive landing page that highlights key information such as professional background, education, research focus, publications, and contact details. I implemented the front‑end using HTML and TailwindCSS, ensuring a responsive layout across devices, and structured the site so visitors can easily navigate the profile and view detailed academic and professional information.",
    },
    {
      company: "Onetro",
      badges: ["React", "TypeScript", "TailwindCSS"],
      href: "https://onetro.co/",
      location: "Remote",
      title: "Frontend engineer (Contract)",
      logoUrl: "/onetro.png",
      start: "June 2025",
      end: "Aug 2025",
      description:
        "I took full responsibility for the frontend, working within an existing TypeScript architecture to fix issues and enhance features. I integrated backend APIs to ensure accurate data display and a smooth user experience, and I optimized the booking system for both one-on-one and group sessions with strong type safety. I also implemented Google sign-up/sign-in for secure authentication and developed new features, including the 3D customizable flippable Onetro Card and the public page. Throughout the project, I resolved bugs, refined styling, and ensured a responsive, user-friendly design across all devices.",
    },
    {
      company: "Brilstash",
      href: "https://brilstash.com/",
      badges: ["React", "Typescript", "TailwindCSS"],
      location: "Remote",
      title: "Frontend engineer (Contract)",
      logoUrl: "/brilstash.png",
      start: "June 2025",
      end: "Aug 2025",
      description:
        "I built the responsive landing page to showcase the company’s services and developed dashboards, application workflows, and user authentication flows. I also implemented the consent form for partner onboarding to ensure compliance and a smooth user experience. In addition, I integrated frontend features with backend APIs for loan processing, user verification, and real-time feedback, while ensuring mobile responsiveness, clean UI/UX, and strong performance across all devices.",
    },
    {
      company: "Brilstack",
      href: "https://brilstack.com/",
      badges: ["React", "Typescript", "TailwindCSS"],
      location: "Remote",
      title: "Frontend engineer (Contract)",
      logoUrl: "/brilstack.png",
      start: "March 2025",
      end: "May 2025",
      description:
        "I collaborated with backend developers to optimize an existing web application, reducing overall load times and improving performance. I also implemented efficient pagination for data-heavy pages, revamped the user interface for a cleaner and more intuitive experience, and refactored redundant code to enhance maintainability and ensure smoother functionality across the application.",
    },
  ],
  education: [
    {
      school: "Obafemi Awolowo University",
      href: "https://oauife.edu.ng/",
      degree: "Bachelor's Degree of Computer Science with Economics (BSC)",
      logoUrl: "/oau.png",
      start: "2021",
      end: "present",
    },
  ],
  projects: [
    {
      title: "Shelf",
      href: "https://www.shelf.ng/",
      dates: "Nov 2025",
      active: true,
      description:
        "Shelf is a cross-platform e-library I founded to make it easier for Nigerian students and readers to discover, share, and preserve digital archives. It brings together textbooks, novels, magazines, comics, and school notes in one accessible, community-driven platform, with organized public and private folders, smart search, and a clean, responsive interface for seamless reading across devices. As the founder, I defined the project structure and roadmap, designed the entire user experience from scratch, and built the responsive frontend that powers content discovery and interaction. I also established the moderation and verification model that ensures authenticity and supports Shelf’s vision of an open, sustainable, community-led digital library.",
      technologies: ["Next.js", "Typescript", "TailwindCSS", "Motion Framer"],
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
