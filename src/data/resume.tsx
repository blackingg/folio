import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon, Rotate3d } from "lucide-react";

export const DATA = {
  name: "Mubarak Odetunde (Black)",
  initials: "Black",
  url: "https://www.whoisblxck.xyz",
  location: "Lagos, Nigeria",
  locationLink: "https://goo.gl/maps/8Q1KZJ8v1Zz",
  description:
    "Frontend dev | React/TypeScript/Three.js | Building 3D web experiences | Interested in building cool stuff.",
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
      Resume: {
        name: "Resume",
        url: "https://flowcv.com/resume/1u1qd2vnw7",
        icon: Icons.resume,

        navbar: false,
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
      badges: [
        "React",
        "NextJs",
        "TypeScript",
        "TailwindCSS",
        "TanStack Query",
      ],
      location: "Hybrid",
      title: "Frontend Engineer",
      logoUrl: "/bayse.jpg",
      start: "February 2026",
      end: "Present",
      description:
        "Frontend engineer at Bayse, Africa's largest prediction market — building user-facing trading features on the main platform and the in-house admin and moderator portals.",
      featured: true,
      responsibilities: [
        "Contributed to maintaining and scaling the main predictive market platform, ensuring a seamless and high-performance user experience for trading real-world event shares across sports, crypto, politics, and entertainment.",
        "Architected and implemented interactive new user-facing features using React, Next.js, TypeScript, and TailwindCSS.",
        "Maintained and developed major features for the secure, in-house administration and moderator portals, enabling efficient event creation, market management, and moderation.",
      ],
    },
    {
      company: "Shelf",
      href: "https://www.shelf.ng/",
      badges: ["Next.js", "TypeScript", "TailwindCSS", "Framer Motion"],
      location: "On-site",
      title: "Founder",
      logoUrl: "/shelf.png",
      start: "September 2025",
      end: "Present",
      description:
        "Founded Shelf, a digital library and academic resource-sharing platform for Nigerian university students — built end to end, from the shared-library architecture to the reader and moderation tooling.",
      featured: true,
      responsibilities: [
        "Defined product vision and roadmap for a student-driven academic repository.",
        "Built the platform architecture around a shared-library model, where every upload joins a collective pool and folders act as curated subsets — the core product bet behind Shelf.",
        "Built a custom EPUB/PDF reader with offline PWA support.",
        "Designed the permissions-based folder system — Public/Private/Unlisted visibility with Owner/Editor/Viewer roles — to support scalable content sharing.",
        "Built the moderation dashboard and document vetting and approval flows supporting platform governance.",
      ],
    },
    {
      company: "OAU Homes",
      href: "https://www.oauhomes.org/",
      badges: ["Next.js", "TypeScript", "TailwindCSS"],
      location: "On-site",
      title: "Frontend Engineer",
      logoUrl: "/oauhomes-logo.png",
      start: "October 2025",
      end: "Present",
      description:
        "Architected the frontend for a two-sided rental marketplace and its companion event ticketing platform — role-based UI for students, listers, and admins, end-to-end booking and inspection flows, and Paystack payments.",
      featured: true,
      responsibilities: [
        "Architected the frontend for a two-sided rental marketplace using Next.js, TypeScript, and Tailwind CSS, with role-based UI for Students, Listers, and Admins.",
        "Built the booking and inspection flows end-to-end — client-side state management, form validation, and optimistic UI updates across the approval workflow.",
        "Handled payment integration (Paystack) alongside webhook-driven status updates for checkout and booking states.",
        "Wired production API endpoints into reusable frontend abstractions shared across both the rental and event-ticketing platforms.",
      ],
    },
    {
      company: "Seedwills",
      href: "https://seedwills.io/",
      badges: ["React", "Redux Toolkit", "Ant Design", "TailwindCSS"],
      location: "Remote",
      title: "Frontend Engineer (Contract)",
      logoUrl: "/seedwills.png",
      start: "December 2025",
      end: "March 2026",
      description:
        "Led frontend engineering for a digital estate planning platform — multi-step will creation, Paystack payments, and the admin dashboard behind it.",
      featured: true,
      responsibilities: [
        "Led full frontend engineering for a digital estate planning platform (React, Redux Toolkit, Tailwind CSS, Ant Design).",
        "Built multi-step will creation workflows covering Executors, Guardians, and Asset Distribution.",
        "Replaced a rigid, linear will-creation flow with a backend-driven stepper that routes users to their actual point of progress across Executors, Guardians, and Asset Distribution.",
        "Integrated RESTful APIs for secure data handling and legal document generation.",
        "Integrated Paystack payment flows including checkout, VAT calculations, and document printing.",
        "Developed an admin dashboard for managing users, plans, and document generation.",
        "Optimized performance via code splitting and lazy loading.",
      ],
    },
    {
      company: "Leoninedao",
      href: "https://leoninedao.org/",
      badges: ["Electron", "React", "TypeScript", "TailwindCSS", "Zustand"],
      location: "Remote",
      title: "Frontend Engineer (Contract)",
      logoUrl: "/leoninedao.png",
      start: "November 2025",
      end: "January 2026",
      description:
        "Shipped v1 of NOZY Wallet, a cross-platform desktop client for managing shielded digital assets, along with its marketing site.",
      featured: true,
      responsibilities: [
        "Designed and built the NOZY Wallet landing page, translating the product's privacy and zero-knowledge-proof feature set into a styled marketing site.",
        "Built and shipped v1 of NOZY Wallet, a cross-platform desktop client (Electron, React 18, Vite, Tailwind CSS 4, Zustand) for managing shielded digital assets.",
        "Integrated TanStack Query/Axios to connect the frontend to a locally-run Rust backend for wallet balances, transaction history, and key management.",
      ],
    },
    {
      company: "Portfolio Website for a Senior Lecturer",
      href: "https://www.marufatoluyemisiodetunde.com/",
      badges: ["HTML", "TailwindCSS"],
      location: "Remote",
      title: "Frontend Engineer",
      logoUrl: "",
      start: "Sept 2025",
      end: "",
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
      description:
        "Took ownership of the frontend for Onetro, a platform for selling coaching sessions and digital products — shipped the wallet, products, and scheduling experiences plus the 3D Onetro Card.",
      responsibilities: [
        "Took ownership of an existing TypeScript codebase, fixing issues and shipping new features across the platform.",
        "Built the wallet page — bank account linking with name-match validation against the account holder, plus consolidated earnings from sessions and products and withdrawal handling.",
        "Built the products page with its own sales chart, a sessions management view (available/upcoming/completed, filterable by 1:1 vs. group), and a weekly availability scheduler for setting per-day booking windows.",
        "Shipped the Onetro Card — a 3D, customizable flippable card — and the public creator profile page.",
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
        "Built the marketing site, auth flows, and core user dashboards for a financial services platform, integrated end-to-end with the backend for loan processing and verification.",
      responsibilities: [
        "Built the company's marketing landing page and the core application dashboards and auth flows.",
        "Implemented the partner onboarding consent form with compliance requirements built into the flow.",
        "Built the user dashboard, profile page, and wallet activity/history view — integrated end-to-end with the backend for loan processing, verification, and real-time feedback.",
      ],
    },
    {
      company: "Brilstack",
      href: "https://brilstack.com/",
      badges: ["React", "Typescript", "TailwindCSS"],
      location: "Remote",
      title: "Frontend Engineer (Contract)",
      logoUrl: "/brilstack.png",
      start: "April 2025",
      end: "June 2025",
      description:
        "Frontend work on an HR platform connecting job seekers with companies — fixed major performance issues, built the AI applicant-ranking feature, and revamped the UI.",
      responsibilities: [
        "Fixed a major performance issue on applicant listing and payroll pages that were loading every record and its preloaded files upfront — replaced with paginated loading that prefetches a page or two ahead, cutting load times from several seconds to near-instant.",
        "Built the AI ranking feature that scores and orders applicants against a posted job's requirements, surfaced on the job poster's applicant view.",
        "Refactored redundant code and revamped the UI for a cleaner, more intuitive experience across the application.",
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
      image: "/shelf-landing.png",
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
      featured: true,
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
      featured: true,
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
