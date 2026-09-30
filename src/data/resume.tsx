import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon, Rotate3d } from "lucide-react";

export const DATA = {
  name: "Mubarak Odetunde (Black)",
  initials: "Black",
  url: "https://www.whoisblxck.xyz",
  location: "Lagos, Nigeria",
  locationLink: "https://goo.gl/maps/8Q1KZJ8v1Zz",
  description:
    "Frontend dev | React/React Native/Electron/Tauri | TypeScript/Three.js | Building interactive experiences across platforms",
  hero: [
    "I'm a frontend dev, technically. Think of me as the guy you call when you want something people enjoy using.",
    "Websites. Apps. Digital products. Even entire 3D worlds.",
    "I make things functional. Then I make them fun to use.",
  ],
  summary: [
    "I'm a frontend engineer, but I've never been particularly interested in just ticking off a tech stack. I care much more about how something actually feels to use — the motion, the interaction, the sound, the tiny details you might not consciously notice but always feel. If it doesn't feel good to use, I don't consider it finished.",
    "When I'm not building for clients, I'm usually building because I'm curious. I draw too, and I think that has a lot to do with how I approach the things I build. I like paying attention — to people, nature, architecture, conversations, little everyday details. A lot of my ideas start there.",
    "I like making things that are useful, things that are playful, and occasionally things that are a little weird. Usually, the best projects are somewhere in between.",
  ],
  avatarUrl: "/me.png",
  skills: [
    "Typescript",
    "React",
    "Next.js",
    "React Native",
    "Electron",
    "Three.js",
    "React Three Fiber",
    "WebGL / GLSL",
    "Framer Motion",
    "GSAP",
    "Tailwind CSS",
    "TanStack Query",
    "Redux Toolkit",
    "Zustand",
    "Vite",
    "Supabase",
    "Web Audio API",
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
      company: "Portfolio Website for a University Reader",
      href: "https://www.marufatoluyemisiodetunde.com/",
      badges: ["HTML", "TailwindCSS", "JavaScript", "Web Audio API", "SEO"],
      location: "Remote",
      title: "Frontend Engineer",
      logoUrl: "",
      start: "Sept 2025",
      end: "",
      description:
        "Built and maintain the official academic portfolio of a Reader in Medical Rehabilitation at Obafemi Awolowo University — her research, grants, and publications, plus a media hub for the health radio drama and rehabilitation videos her work produces.",
      responsibilities: [
        "Designed and implemented a clean, responsive site with dropdown and mobile drawer navigation, highlighting professional background, grants, and research impact.",
        "Built a publications system covering 32 peer-reviewed papers with progressive disclosure and DOI links, pre-rendered as static HTML for reliable indexing.",
        "Built the Media & Resources hub: audio drama players with a Web Audio API visualizer (AnalyserNode driving a canvas frequency-bar animation), and click-to-load YouTube facades that keep every third-party script and cookie off the page until a visitor presses play.",
        "Engineered DOM-driven structured data — VideoObject/AudioObject JSON-LD generated from the live media cards, so schema activates automatically as real media replaces placeholders — with clean-URL routing on Vercel.",
        "Implemented deep SEO: a Schema.org scholar graph (Person + ScholarlyArticle JSON-LD), sitemap, robots.txt, and Open Graph/Twitter metadata.",
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
        "I noticed Nigerian students had a problem — no decentralised space for storing and accessing online materials and past questions. So I built one. Shelf lets students log in and get what they need without having to hunt through WhatsApp groups, Telegram chats, and that one person who somehow has every PDF ever created.",
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
        "OAU students have always struggled with unscrupulous house agents and exorbitant fees just to secure reasonable accommodation. OAU Homes connects students with verified housing agents, with the goal of making the process simpler and cutting out the unnecessary costs.",
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
      dates: "Nov 2025 - Present",
      active: true,
      featured: true,
      description:
        "Banking doesn't work quite the same way everywhere. In the Democratic Republic of Congo, phone numbers play a major role in how people send and receive money. SokoFunds explored what managing money through an app could look like in that context — creating an account, moving money around, and experiencing the whole product digitally.",
      technologies: [
        "React Native",
        "Expo",
        "TypeScript",
        "TanStack Query",
        "Zustand",
        "NativeWind",
        "i18next",
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
        "I didn't just build the product. I also built the website that introduced people to it. The goal: explain what SokoFunds is, make the product feel familiar, and give potential users a reason to care.",
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
        "A Telegram mini-app for buying virtual land in Web3. And because apparently a normal map wasn't enough, I built three explorable islands in 3D for users to wander before they buy the NFTs.",
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
        "A playful memecoin project built around recognisable pieces of meme culture and collectible-style graphics. Mostly an excuse to see how far I could push the idea.",
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
        "A restaurant website where ordering isn't just clicking \"add to cart.\" Want bread? Put it on the burger. Cheese? Absolutely. Onions? Get those things out of here. I built an interactive ordering experience that lets customers actually construct their meal, while keeping it simple enough that nobody needs a tutorial to order breakfast.",
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
        "A sleek, animated website built to give an artist and their music somewhere to be discovered. It brings their work, discography, and personality together in one place.",
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
      dates: "Oct 2024",
      active: true,
      description:
        "I needed to browse all 898 Pokémon from somewhere other than my childhood memories. So I built a searchable, browsable Pokédex on top of the PokéAPI.",
      technologies: ["React", "Vite", "TailwindCSS", "Express", "PokéAPI"],
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
    {
      title: "Project TRUMAN",
      href: "/3d",
      dates: "2025",
      active: true,
      featured: true,
      description:
        "I got curious about 3D on the web, so naturally I decided to build a world. Inspired by Bruno Simon's portfolio, Project TRUMAN was my playground for figuring out 3D environments, movement, interaction, and generally asking, \"Can I actually make this work?\" I talk about this one a little too much. Fortunately, I have a blog.",
      technologies: ["Three.js", "WebGL / GLSL", "Typescript", "Next.js"],
      links: [
        {
          type: "Explore the world",
          href: "/3d",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/truman.png",
      video: "",
    },
  ],
  hackathons: [],
} as const;
