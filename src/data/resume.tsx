import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Mubarak Odetunde (Black)",
  initials: "Black",
  url: "https://mubarakodetunde-portfolio.netlify.app/",
  location: "Ile-Ife, Nigeria",
  locationLink: "https://goo.gl/maps/8Q1KZJ8v1Zz",
  description:
    "Frontend dev | React/TypeScript/Three.js | Building 3D web experiences | Intrested in building cool stuff.",
  summary:
    "Hi! I’m Mubarak, a frontend engineer passionate about building seamless, high-performance interfaces. I work with JavaScript, TypeScript, React, and Three.js to create engaging and interactive user experiences across platforms.",
  avatarUrl: "/me.png",
  skills: [
    "React",
    "React-native",
    "Next.js",
    "Typescript",
    "Tailwind CSS",
    "ThreeJs",
    "GSAP",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
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
      title: "OAUHomes",
      href: "https://www.oauhomes.org/",
      dates: "Oct 2025",
      active: true,
      description:
        "OAU Homes is a Next.js platform that connects OAU students directly with verified housing agents to reduce inflated accommodation prices. The platform offers a clean, responsive interface with search and filtering tools, plus verified agent profiles for transparency. I built the frontend in Next.js and Tailwind CSS, collaborated with a backend developer within the same repo, and personally handled the UI design from scratch. I also created clear listing layouts and optimized the experience for mobile users.",
      technologies: ["Next.js", "Typescript", "TailwindCSS", "React"],
      links: [],
      image: "/oauhomes.png",
      video: "",
    },
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
          type: "Source - web",
          href: "https://www.shelf.ng/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source - Frontend",
          href: "https://github.com/blackingg/shelf",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/shelf.png",
      video: "",
    },
    {
      title: "NOTDOG",
      href: "https://notdog-blackingg.vercel.app/",
      dates: "Dec 2025",
      active: true,
      description:
        "Shelf is a cross-platform e-library I founded to make it easier for Nigerian students and readers to discover, share, and preserve digital archives. It brings together textbooks, novels, magazines, comics, and school notes in one accessible, community-driven platform, with organized public and private folders, smart search, and a clean, responsive interface for seamless reading across devices. As the founder, I defined the project structure and roadmap, designed the entire user experience from scratch, and built the responsive frontend that powers content discovery and interaction. I also established the moderation and verification model that ensures authenticity and supports Shelf’s vision of an open, sustainable, community-led digital library.",
      technologies: ["React", "TailwindCSS", "Framer Motion"],
      links: [
        {
          type: "Source - web",
          href: "https://notdog-blackingg.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source ",
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
          type: "Source - web",
          href: "https://breakfastplace-blackingg.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source - web",
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
          type: "Source - web",
          href: "https://dafash.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
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
          type: "Source - web",
          href: "https://pokedex-blackingg.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
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
