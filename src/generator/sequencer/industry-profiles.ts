import type { Relief, Finish, ShapeCurve } from "@/src/schema/site-config"

export interface FeatureContent {
  title: string
  description: string
}

export interface IndustryContentTemplate {
  heroHeadline: string
  heroSubheadline: string
  featureGroups: FeatureContent[][]
  ctaHeadline: string
  ctaSubheadline?: string
  ctaLabel: string
}

export interface IndustryProfile {
  industry: string
  name: string
  description: string
  sectionTemplateId: string
  tunerProfileName: string
  preferredArchetype: { relief: Relief; finish: Finish; shape: ShapeCurve }
  preferredVariants: Record<string, string[]>
  toneGuidance: string
  content: IndustryContentTemplate
}

export const INDUSTRY_PROFILES: IndustryProfile[] = [
  {
    industry: "cafe",
    name: "Cafe & Coffee Shop",
    description: "Warm, inviting coffee shops and cafes. Emphasis on atmosphere and craft.",
    sectionTemplateId: "storyteller",
    tunerProfileName: "Warm & Spacious",
    preferredArchetype: { relief: "flat", finish: "matte", shape: "squircle" },
    preferredVariants: { hero: ["HeroCentered"], features: ["FeaturesGrid"] },
    toneGuidance: "warm, inviting, sensory-rich descriptions of coffee and atmosphere",
    content: {
      heroHeadline: "Fresh Coffee, Great Vibes",
      heroSubheadline: "Handcrafted beverages in a space designed for connection",
      featureGroups: [
        [
          { title: "Single Origin Beans", description: "Sourced directly from small farms in Ethiopia, Colombia, and Guatemala. Every cup tells a story." },
          { title: "Expert Baristas", description: "Our team has won multiple national latte art championships and trains year-round." },
          { title: "Cozy Atmosphere", description: "Warm lighting, vinyl records, and the best playlist in town. Your new home away from home." },
        ],
        [
          { title: "Seasonal Offerings", description: "Menus change with the harvest. Every season brings new flavors to discover and savor." },
          { title: "Community Space", description: "Free Wi-Fi, local art on the walls, and regular open mic nights. We're more than a cafe." },
        ],
      ],
      ctaHeadline: "Ready for the best cup of your life?",
      ctaSubheadline: "Come visit us today and taste the difference.",
      ctaLabel: "Find Us",
    },
  },
  {
    industry: "restaurant",
    name: "Restaurant & Dining",
    description: "Full-service restaurants and dining experiences. Focus on cuisine and ambiance.",
    sectionTemplateId: "storyteller",
    tunerProfileName: "Warm & Spacious",
    preferredArchetype: { relief: "flat", finish: "matte", shape: "squircle" },
    preferredVariants: { hero: ["HeroCentered", "HeroSplit"], features: ["FeaturesAlternating"] },
    toneGuidance: "sophisticated, appetizing, evocative descriptions of cuisine and dining experience",
    content: {
      heroHeadline: "An Unforgettable Dining Experience",
      heroSubheadline: "Locally sourced ingredients meet world-class technique",
      featureGroups: [
        [
          { title: "Seasonal Menus", description: "Our chef crafts menus around what's freshest each season. No two visits are the same." },
          { title: "Curated Wine List", description: "Over 200 labels from boutique vineyards worldwide, each selected to complement our dishes." },
          { title: "Intimate Atmosphere", description: "Soft lighting, live acoustic sets, and a warm interior designed for conversation." },
        ],
        [
          { title: "Private Dining", description: "Our mezzanine level accommodates groups up to 40 for celebrations, corporate events, and more." },
          { title: "Farm to Table", description: "We partner with 12 local farms within 50 miles. Know exactly where your meal comes from." },
        ],
      ],
      ctaHeadline: "Book Your Table Tonight",
      ctaSubheadline: "Walk-ins welcome, reservations recommended.",
      ctaLabel: "Make a Reservation",
    },
  },
  {
    industry: "hospitality",
    name: "Hospitality & Hotel",
    description: "Hotels, resorts, and lodging. Emphasis on luxury, comfort, and escape.",
    sectionTemplateId: "showcase",
    tunerProfileName: "Warm & Spacious",
    preferredArchetype: { relief: "glassmorphic", finish: "frosted", shape: "superellipse" },
    preferredVariants: { hero: ["HeroSplit"], features: ["FeaturesGrid", "FeaturesAlternating"] },
    toneGuidance: "luxurious, serene, aspirational descriptions of accommodation and amenities",
    content: {
      heroHeadline: "Escape to Extraordinary",
      heroSubheadline: "Where every detail is designed for your comfort and delight",
      featureGroups: [
        [
          { title: "Premium Accommodations", description: "Rooms and suites with hand-picked furnishings, Egyptian cotton linens, and stunning views." },
          { title: "World-Class Spa", description: "Holistic treatments using organic products. Sauna, steam room, and infinity pool included." },
          { title: "Fine Dining", description: "Two Michelin-starred restaurant and a rooftop bar serving craft cocktails with panoramic views." },
        ],
        [
          { title: "Concierge Service", description: "Our dedicated team arranges everything from helicopter tours to private yacht charters." },
          { title: "Exclusive Experiences", description: "Wine tastings, cooking classes, guided hikes, and cultural tours curated just for you." },
        ],
      ],
      ctaHeadline: "Begin Your Journey",
      ctaSubheadline: "Special rates available for direct bookings.",
      ctaLabel: "Book Now",
    },
  },
  {
    industry: "saas",
    name: "SaaS & Cloud Software",
    description: "Cloud-based software products and platforms. Focus on efficiency and ROI.",
    sectionTemplateId: "data-heavy",
    tunerProfileName: "Bold & Compact",
    preferredArchetype: { relief: "glassmorphic", finish: "frosted", shape: "superellipse" },
    preferredVariants: { hero: ["HeroSplit"], features: ["FeaturesGrid"] },
    toneGuidance: "professional, results-oriented, technical but accessible language",
    content: {
      heroHeadline: "Analytics that Actually Make Sense",
      heroSubheadline: "Stop drowning in spreadsheets. Get real-time insights your whole team can understand.",
      featureGroups: [
        [
          { title: "Real-time Dashboards", description: "Live data streams update as your business changes. No refresh button needed." },
          { title: "Team Collaboration", description: "Share views, annotate charts, and assign action items directly from any report." },
          { title: "API-first Architecture", description: "Pull data into any tool with our REST and GraphQL APIs. Webhooks included." },
        ],
        [
          { title: "Automated Reporting", description: "Schedule PDF and CSV exports to stakeholders. White-label options available." },
          { title: "Role-based Access", description: "Granular permissions let you control exactly who sees what. SOC 2 compliant." },
        ],
      ],
      ctaHeadline: "Trusted by 5,000+ Teams",
      ctaSubheadline: "Start free. No credit card required. Cancel anytime.",
      ctaLabel: "Start Free Trial",
    },
  },
  {
    industry: "tech",
    name: "Technology & Software",
    description: "Tech companies, developer tools, and digital platforms. Emphasis on innovation.",
    sectionTemplateId: "product-launch",
    tunerProfileName: "Bold & Compact",
    preferredArchetype: { relief: "glassmorphic", finish: "tinted", shape: "superellipse" },
    preferredVariants: { hero: ["HeroSplit", "HeroCentered"], features: ["FeaturesGrid", "FeaturesAlternating"] },
    toneGuidance: "innovative, forward-thinking, precise technical communication",
    content: {
      heroHeadline: "Build the Future, Faster",
      heroSubheadline: "The developer platform that scales with your ambition",
      featureGroups: [
        [
          { title: "Lightning-fast Performance", description: "Sub-millisecond response times. Auto-scaling infrastructure that handles 10x traffic spikes." },
          { title: "Developer-first Experience", description: "SDKs in 14 languages. Comprehensive docs. A CLI that actually makes sense." },
          { title: "Enterprise Security", description: "End-to-end encryption, SOC 2 Type II, GDPR compliant. Your data stays yours." },
        ],
        [
          { title: "Seamless Integrations", description: "Connect with 200+ tools out of the box. Zapier, Make, and custom webhook support." },
          { title: "Global Edge Network", description: "30+ data centers worldwide. Your content delivered from the closest node to your users." },
        ],
      ],
      ctaHeadline: "Start Building Today",
      ctaSubheadline: "Generous free tier. Pay only as you grow.",
      ctaLabel: "Get Started",
    },
  },
  {
    industry: "finance",
    name: "Finance & Banking",
    description: "Financial services, banking, and insurance. Emphasis on trust and security.",
    sectionTemplateId: "minimal",
    tunerProfileName: "Calm & Professional",
    preferredArchetype: { relief: "flat", finish: "matte", shape: "arc" },
    preferredVariants: { hero: ["HeroCentered"], features: ["FeaturesGrid"] },
    toneGuidance: "trustworthy, clear, reassuring with precise financial terminology",
    content: {
      heroHeadline: "Your Financial Future, Securely Managed",
      heroSubheadline: "Smart investing starts with a partner you can trust",
      featureGroups: [
        [
          { title: "Expert Portfolio Management", description: "Certified financial advisors design strategies tailored to your goals and risk tolerance." },
          { title: "Transparent Fees", description: "No hidden charges. No commissions. We publish every fee in plain language." },
          { title: "Bank-grade Security", description: "256-bit encryption, biometric authentication, and FDIC insurance up to $250,000." },
        ],
      ],
      ctaHeadline: "Start Building Wealth",
      ctaSubheadline: "Schedule a free consultation with a licensed advisor.",
      ctaLabel: "Get Started",
    },
  },
  {
    industry: "legal",
    name: "Legal & Law",
    description: "Law firms and legal services. Emphasis on expertise and reliability.",
    sectionTemplateId: "minimal",
    tunerProfileName: "Calm & Professional",
    preferredArchetype: { relief: "flat", finish: "matte", shape: "arc" },
    preferredVariants: { hero: ["HeroCentered"], features: ["FeaturesGrid"] },
    toneGuidance: "authoritative, precise, reassuring with confident legal language",
    content: {
      heroHeadline: "Experienced Counsel, Proven Results",
      heroSubheadline: "Decades of combined experience fighting for our clients' rights",
      featureGroups: [
        [
          { title: "Expert Litigation", description: "Our partners have argued before the Supreme Court and secured over $500M in settlements." },
          { title: "Personal Attention", description: "Every case is handled by a senior partner. You're never passed to a junior associate." },
          { title: "Clear Communication", description: "Regular updates in plain language. No legal jargon. You'll always understand your case." },
        ],
      ],
      ctaHeadline: "Schedule a Confidential Consultation",
      ctaSubheadline: "Same-day appointments available for urgent matters.",
      ctaLabel: "Contact Us",
    },
  },
  {
    industry: "entertainment",
    name: "Entertainment & Media",
    description: "Film, music, gaming, and media production. Bold visual identity.",
    sectionTemplateId: "showcase",
    tunerProfileName: "Dynamic & Playful",
    preferredArchetype: { relief: "skeuomorphic", finish: "glossy", shape: "clothoid" },
    preferredVariants: { hero: ["HeroSplit", "HeroCentered"], features: ["FeaturesAlternating", "FeaturesGrid"] },
    toneGuidance: "energetic, exciting, immersive language that sells an experience",
    content: {
      heroHeadline: "Experience Entertainment Reimagined",
      heroSubheadline: "Bold stories. Immersive worlds. Unforgettable moments.",
      featureGroups: [
        [
          { title: "Original Content", description: "Award-winning films, series, and podcasts produced by our in-house creative studio." },
          { title: "Interactive Experiences", description: "Immersive installations and live events that blur the line between audience and art." },
          { title: "Global Distribution", description: "Reach audiences in 190+ countries through our streaming platform and network partners." },
        ],
        [
          { title: "Talent Development", description: "Our incubator program has launched careers for over 200 writers, directors, and performers." },
          { title: "Cutting-edge Technology", description: "Virtual production stages, spatial audio, and AI-assisted editing for groundbreaking content." },
        ],
      ],
      ctaHeadline: "Join the Experience",
      ctaSubheadline: "Subscribe for early access to new releases and exclusive behind-the-scenes content.",
      ctaLabel: "Subscribe Now",
    },
  },
  {
    industry: "education",
    name: "Education & E-Learning",
    description: "Schools, courses, and learning platforms. Emphasis on growth and opportunity.",
    sectionTemplateId: "landing-page",
    tunerProfileName: "Dynamic & Playful",
    preferredArchetype: { relief: "flat", finish: "tinted", shape: "squircle" },
    preferredVariants: { hero: ["HeroCentered"], features: ["FeaturesGrid", "FeaturesAlternating"] },
    toneGuidance: "inspiring, accessible, encouraging language focused on student success",
    content: {
      heroHeadline: "Unlock Your Full Potential",
      heroSubheadline: "World-class education, accessible from anywhere",
      featureGroups: [
        [
          { title: "Expert Instructors", description: "Learn from industry leaders and PhDs from top universities. Every instructor is vetted and rated." },
          { title: "Flexible Learning", description: "Self-paced courses, live workshops, and hybrid programs designed for busy professionals." },
          { title: "Career Support", description: "Resume reviews, mock interviews, and direct connections with 2,000+ hiring partners." },
        ],
        [
          { title: "Interactive Curriculum", description: "Hands-on projects, peer reviews, and real-world case studies. Learn by doing, not just watching." },
          { title: "Global Community", description: "Join 50,000+ learners from 120 countries. Collaborate, network, and grow together." },
        ],
      ],
      ctaHeadline: "Start Learning Today",
      ctaSubheadline: "First lesson is free. No commitment required.",
      ctaLabel: "Browse Courses",
    },
  },
  {
    industry: "portfolio",
    name: "Portfolio & Personal Brand",
    description: "Creative professionals showcasing their work. Clean, visual presentation.",
    sectionTemplateId: "portfolio",
    tunerProfileName: "Minimal & Airy",
    preferredArchetype: { relief: "neumorphic", finish: "matte", shape: "clothoid" },
    preferredVariants: { hero: ["HeroMinimal"], features: ["FeaturesAlternating"] },
    toneGuidance: "creative, personal, authentic first-person voice",
    content: {
      heroHeadline: "Hi, I Create Things",
      heroSubheadline: "Designer, developer, and creative problem-solver based in Portland.",
      featureGroups: [
        [
          { title: "Brand Identity Design", description: "Complete visual identity systems including logo, typography, color palette, and brand guidelines." },
          { title: "Web Development", description: "Custom websites and web applications built with modern frameworks and clean code." },
          { title: "UI/UX Design", description: "User-centered design processes from wireframes to pixel-perfect prototypes." },
        ],
      ],
      ctaHeadline: "Have a Project in Mind?",
      ctaSubheadline: "I'd love to hear about what you're building.",
      ctaLabel: "Get in Touch",
    },
  },
  {
    industry: "agency",
    name: "Creative Agency",
    description: "Digital and creative agencies offering comprehensive services.",
    sectionTemplateId: "showcase",
    tunerProfileName: "Dynamic & Playful",
    preferredArchetype: { relief: "skeuomorphic", finish: "matte", shape: "clothoid" },
    preferredVariants: { hero: ["HeroSplit", "HeroCentered"], features: ["FeaturesAlternating", "FeaturesGrid"] },
    toneGuidance: "confident, creative, results-oriented with case study language",
    content: {
      heroHeadline: "We Build Brands That Matter",
      heroSubheadline: "Strategy, design, and technology for companies ready to stand out",
      featureGroups: [
        [
          { title: "Brand Strategy", description: "Deep research and positioning that sets you apart. We find the signal in the noise." },
          { title: "Visual Design", description: "Award-winning design teams create identities that resonate across every touchpoint." },
          { title: "Technical Delivery", description: "Full-stack development team. From concept to launch in as little as 8 weeks." },
        ],
        [
          { title: "Content Production", description: "In-house studio for video, photography, copywriting, and motion graphics." },
          { title: "Growth Marketing", description: "Data-driven campaigns that convert. SEO, paid media, email, and conversion optimization." },
        ],
      ],
      ctaHeadline: "Let's Build Something Great",
      ctaSubheadline: "Ready to elevate your brand? Let's talk.",
      ctaLabel: "Start a Project",
    },
  },
  {
    industry: "ecommerce",
    name: "E-Commerce & Retail",
    description: "Online stores and retail brands. Focus on products and shopping experience.",
    sectionTemplateId: "product-launch",
    tunerProfileName: "Balanced",
    preferredArchetype: { relief: "flat", finish: "matte", shape: "squircle" },
    preferredVariants: { hero: ["HeroCentered", "HeroSplit"], features: ["FeaturesGrid", "FeaturesAlternating"] },
    toneGuidance: "persuasive, benefit-driven, clear product descriptions with urgency cues",
    content: {
      heroHeadline: "Products You'll Love, Delivered Fast",
      heroSubheadline: "Curated collections. Free shipping on orders over $50. Easy returns.",
      featureGroups: [
        [
          { title: "Curated Collections", description: "Every product is personally tested by our team. We only sell what we truly recommend." },
          { title: "Fast & Free Shipping", description: "Free shipping on all orders over $50. Most orders arrive within 2-3 business days." },
          { title: "Hassle-free Returns", description: "Not happy? Return within 30 days for a full refund. No questions asked." },
        ],
        [
          { title: "Quality Guarantee", description: "All products come with a minimum 1-year warranty. We stand behind everything we sell." },
          { title: "Loyalty Rewards", description: "Earn points on every purchase. Members get early access to sales and exclusive products." },
        ],
      ],
      ctaHeadline: "Shop Our Collection",
      ctaSubheadline: "New arrivals added weekly. Free shipping on your first order.",
      ctaLabel: "Shop Now",
    },
  },
  {
    industry: "healthcare",
    name: "Healthcare & Medical",
    description: "Medical practices, clinics, and health services. Emphasis on care and trust.",
    sectionTemplateId: "minimal",
    tunerProfileName: "Calm & Professional",
    preferredArchetype: { relief: "flat", finish: "matte", shape: "arc" },
    preferredVariants: { hero: ["HeroCentered"], features: ["FeaturesGrid"] },
    toneGuidance: "compassionate, professional, reassuring with clear medical information",
    content: {
      heroHeadline: "Your Health, Our Priority",
      heroSubheadline: "Compassionate care backed by decades of medical expertise",
      featureGroups: [
        [
          { title: "Board-certified Physicians", description: "Our team includes specialists from top medical institutions with combined 100+ years experience." },
          { title: "Comprehensive Care", description: "From primary care to specialized treatment, we handle your family's full health journey." },
          { title: "Modern Facilities", description: "State-of-the-art diagnostic equipment and electronic health records for seamless care." },
        ],
      ],
      ctaHeadline: "Schedule Your Visit",
      ctaSubheadline: "Same-day appointments available. Most insurance plans accepted.",
      ctaLabel: "Book Appointment",
    },
  },
  {
    industry: "fitness",
    name: "Fitness & Wellness",
    description: "Gyms, studios, and wellness programs. Emphasis on transformation and energy.",
    sectionTemplateId: "landing-page",
    tunerProfileName: "Dynamic & Playful",
    preferredArchetype: { relief: "flat", finish: "glossy", shape: "squircle" },
    preferredVariants: { hero: ["HeroCentered", "HeroSplit"], features: ["FeaturesGrid", "FeaturesAlternating"] },
    toneGuidance: "motivational, energetic, inclusive language focused on transformation",
    content: {
      heroHeadline: "Transform Your Body, Transform Your Life",
      heroSubheadline: "Expert coaching, supportive community, results that speak for themselves",
      featureGroups: [
        [
          { title: "Expert Coaching", description: "Certified personal trainers design programs tailored to your goals, fitness level, and schedule." },
          { title: "Modern Equipment", description: "Premium cardio, strength, and functional training equipment from top manufacturers." },
          { title: "Group Classes", description: "Yoga, HIIT, spin, pilates, and more. 50+ weekly classes included with membership." },
        ],
        [
          { title: "Nutrition Guidance", description: "Personalized meal plans and nutrition coaching to fuel your fitness journey." },
          { title: "Recovery Suite", description: "Sauna, cold plunge, compression therapy, and stretching area for optimal recovery." },
        ],
      ],
      ctaHeadline: "Start Your Transformation",
      ctaSubheadline: "First week free. No contract required. Cancel anytime.",
      ctaLabel: "Claim Free Week",
    },
  },
  {
    industry: "real-estate",
    name: "Real Estate & Property",
    description: "Real estate agents, agencies, and property developers. Focus on properties and locations.",
    sectionTemplateId: "showcase",
    tunerProfileName: "Luxury & Premium",
    preferredArchetype: { relief: "flat", finish: "matte", shape: "squircle" },
    preferredVariants: { hero: ["HeroSplit"], features: ["FeaturesGrid", "FeaturesAlternating"] },
    toneGuidance: "aspirational, descriptive, detail-oriented highlighting location and lifestyle",
    content: {
      heroHeadline: "Find Your Dream Home",
      heroSubheadline: "Exclusive listings in the most sought-after neighborhoods",
      featureGroups: [
        [
          { title: "Curated Listings", description: "Hand-picked properties that meet our exacting standards. Quality over quantity, always." },
          { title: "Local Expertise", description: "Deep knowledge of every neighborhood. We'll help you find the perfect location for your lifestyle." },
          { title: "White-glove Service", description: "Dedicated agent from first tour to closing and beyond. We handle every detail." },
        ],
        [
          { title: "Virtual Tours", description: "Immersive 3D walkthroughs of every property. Tour from the comfort of your home." },
          { title: "Market Insights", description: "Comprehensive market analysis and investment potential reports for every property." },
        ],
      ],
      ctaHeadline: "Schedule a Private Tour",
      ctaSubheadline: "See your dream home in person. Contact us today.",
      ctaLabel: "Inquire Now",
    },
  },
  {
    industry: "nonprofit",
    name: "Nonprofit & NGO",
    description: "Charitable organizations and non-profits. Emphasis on mission and impact.",
    sectionTemplateId: "storyteller",
    tunerProfileName: "Warm & Spacious",
    preferredArchetype: { relief: "flat", finish: "matte", shape: "squircle" },
    preferredVariants: { hero: ["HeroCentered"], features: ["FeaturesAlternating"] },
    toneGuidance: "heartfelt, urgent, mission-driven language that inspires action and donations",
    content: {
      heroHeadline: "Together, We Can Make a Difference",
      heroSubheadline: "Every contribution creates ripples of change in communities that need it most",
      featureGroups: [
        [
          { title: "Community Programs", description: "Direct support for 50,000+ families annually through food, education, and housing initiatives." },
          { title: "Transparent Impact", description: "87% of every dollar goes directly to programs. We publish annual impact reports with audited finances." },
          { title: "Volunteer Network", description: "10,000+ active volunteers across 30 chapters nationwide. Join a community of changemakers." },
        ],
        [
          { title: "Emergency Response", description: "Rapid deployment teams provide disaster relief within 72 hours of any major event." },
          { title: "Sustainable Solutions", description: "We don't just provide aid — we build infrastructure for long-term community self-sufficiency." },
        ],
      ],
      ctaHeadline: "Join the Movement",
      ctaSubheadline: "Donate. Volunteer. Advocate. Every action matters.",
      ctaLabel: "Get Involved",
    },
  },
  {
    industry: "consulting",
    name: "Consulting & Business Services",
    description: "Management consulting and business advisory. Emphasis on expertise and results.",
    sectionTemplateId: "data-heavy",
    tunerProfileName: "Calm & Professional",
    preferredArchetype: { relief: "flat", finish: "matte", shape: "arc" },
    preferredVariants: { hero: ["HeroCentered", "HeroSplit"], features: ["FeaturesGrid"] },
    toneGuidance: "authoritative, analytical, outcome-oriented business language",
    content: {
      heroHeadline: "Strategic Insights, Measurable Results",
      heroSubheadline: "Management consulting that transforms challenges into competitive advantages",
      featureGroups: [
        [
          { title: "Strategic Planning", description: "Three-year roadmaps with quarterly checkpoints. We don't just advise — we guide execution." },
          { title: "Operational Excellence", description: "Lean processes, digital transformation, and workflow optimization that cut costs by 30% on average." },
          { title: "Market Analysis", description: "Deep-dive competitive research and market opportunity assessments with actionable recommendations." },
        ],
        [
          { title: "Change Management", description: "Proven frameworks for organizational change that achieve 90%+ adoption within 6 months." },
          { title: "Performance Metrics", description: "Custom KPI dashboards and balanced scorecards that align every team with strategic goals." },
        ],
      ],
      ctaHeadline: "Ready to Transform Your Business?",
      ctaSubheadline: "Schedule a complimentary strategy session with our senior advisors.",
      ctaLabel: "Book a Consultation",
    },
  },
  {
    industry: "construction",
    name: "Construction & Engineering",
    description: "Construction firms, contractors, and engineering services. Emphasis on reliability.",
    sectionTemplateId: "minimal",
    tunerProfileName: "Calm & Professional",
    preferredArchetype: { relief: "flat", finish: "matte", shape: "arc" },
    preferredVariants: { hero: ["HeroCentered"], features: ["FeaturesGrid"] },
    toneGuidance: "dependable, precise, safety-conscious language highlighting expertise and track record",
    content: {
      heroHeadline: "Building Excellence Since 1985",
      heroSubheadline: "Commercial and residential construction with an unwavering commitment to quality",
      featureGroups: [
        [
          { title: "Proven Track Record", description: "500+ completed projects with 98% on-time delivery and 95% within budget." },
          { title: "Licensed Experts", description: "Fully licensed, bonded, and insured team including PEs, LEED-accredited professionals, and master craftsmen." },
          { title: "Safety First", description: "OSHA Gold rating for 12 consecutive years. Zero lost-time incidents in the last 3 years." },
        ],
      ],
      ctaHeadline: "Let's Build Together",
      ctaSubheadline: "Free estimates and project consultations available.",
      ctaLabel: "Request a Quote",
    },
  },
  {
    industry: "travel",
    name: "Travel & Tourism",
    description: "Travel agencies, tour operators, and tourism boards. Emphasis on adventure and discovery.",
    sectionTemplateId: "showcase",
    tunerProfileName: "Dynamic & Playful",
    preferredArchetype: { relief: "flat", finish: "glossy", shape: "clothoid" },
    preferredVariants: { hero: ["HeroSplit"], features: ["FeaturesAlternating", "FeaturesGrid"] },
    toneGuidance: "adventurous, evocative, wanderlust-inducing language describing destinations and experiences",
    content: {
      heroHeadline: "Discover the World, Your Way",
      heroSubheadline: "Curated travel experiences that go beyond the tourist trail",
      featureGroups: [
        [
          { title: "Expertly Curated Trips", description: "Handcrafted itineraries designed by local experts who know every hidden gem." },
          { title: "Sustainable Travel", description: "Carbon-neutral trips with eco-certified accommodations and community-based tourism partners." },
          { title: "24/7 Support", description: "Dedicated travel concierge available anytime, anywhere. Peace of mind included." },
        ],
        [
          { title: "Small Group Adventures", description: "Maximum 12 travelers per group. Meaningful connections with fellow explorers and local cultures." },
          { title: "Custom Private Tours", description: "Build your perfect itinerary. We handle every detail from flights to fine dining reservations." },
        ],
      ],
      ctaHeadline: "Your Next Adventure Awaits",
      ctaSubheadline: "Book by March 31 and save 15% on all 2026 departures.",
      ctaLabel: "Explore Destinations",
    },
  },
  {
    industry: "fashion",
    name: "Fashion & Lifestyle",
    description: "Fashion brands, designers, and lifestyle products. Bold visual identity.",
    sectionTemplateId: "showcase",
    tunerProfileName: "Luxury & Premium",
    preferredArchetype: { relief: "skeuomorphic", finish: "glossy", shape: "clothoid" },
    preferredVariants: { hero: ["HeroSplit", "HeroCentered"], features: ["FeaturesAlternating"] },
    toneGuidance: "stylish, aspirational, trend-aware language with a distinctive brand voice",
    content: {
      heroHeadline: "Define Your Style",
      heroSubheadline: "Timeless designs crafted with modern sensibility and sustainable materials",
      featureGroups: [
        [
          { title: "Signature Collections", description: "Each piece is designed in-house and produced in limited runs. True exclusivity." },
          { title: "Sustainable Craftsmanship", description: "Ethically sourced materials, fair-wage factories, and biodegradable packaging." },
          { title: "Personal Styling", description: "Virtual and in-person styling sessions. Our experts help you find your perfect look." },
        ],
        [
          { title: "Seasonal Preview", description: "Members get early access to new collections and exclusive capsule drops." },
          { title: "Made to Measure", description: "Custom tailoring available for select pieces. Perfect fit, guaranteed." },
        ],
      ],
      ctaHeadline: "Explore the Collection",
      ctaSubheadline: "Free shipping and returns on all orders. Complimentary gift wrapping.",
      ctaLabel: "Shop Now",
    },
  },
  {
    industry: "music",
    name: "Music & Audio",
    description: "Musicians, bands, producers, and audio studios. Emphasis on sound and creativity.",
    sectionTemplateId: "portfolio",
    tunerProfileName: "Dynamic & Playful",
    preferredArchetype: { relief: "skeuomorphic", finish: "glossy", shape: "clothoid" },
    preferredVariants: { hero: ["HeroMinimal", "HeroCentered"], features: ["FeaturesAlternating"] },
    toneGuidance: "creative, passionate, evocative language about sound and artistic vision",
    content: {
      heroHeadline: "Sound That Moves You",
      heroSubheadline: "Independent artist creating music that blends genres and defies expectations",
      featureGroups: [
        [
          { title: "Original Music", description: "Three albums, two EPs, and collaborations with artists across 12 countries." },
          { title: "Live Performances", description: "200+ shows at venues and festivals worldwide. Known for transformative live experiences." },
          { title: "Studio Production", description: "Full-service recording studio offering production, mixing, and mastering for other artists." },
        ],
      ],
      ctaHeadline: "Listen Now",
      ctaSubheadline: "New album dropping this summer. Subscribe for early access.",
      ctaLabel: "Stream Music",
    },
  },
  {
    industry: "event",
    name: "Event Planning & Conferences",
    description: "Event planners, conference organizers, and wedding coordinators. Emphasis on execution.",
    sectionTemplateId: "event",
    tunerProfileName: "Dynamic & Playful",
    preferredArchetype: { relief: "flat", finish: "tinted", shape: "superellipse" },
    preferredVariants: { hero: ["HeroCentered"], features: ["FeaturesGrid"] },
    toneGuidance: "exciting, organized, professional language promising memorable events",
    content: {
      heroHeadline: "Events That Leave a Lasting Impression",
      heroSubheadline: "From intimate gatherings to large-scale conferences — we bring your vision to life",
      featureGroups: [
        [
          { title: "Full-service Planning", description: "Venue sourcing, vendor management, timeline coordination, and on-site execution." },
          { title: "Creative Design", description: "Themed decor, lighting design, and immersive environments tailored to your brand or vision." },
          { title: "Stress-free Experience", description: "You enjoy the event. Our team handles every detail, from setup to teardown." },
        ],
      ],
      ctaHeadline: "Plan Your Event",
      ctaSubheadline: "Let's create something unforgettable together.",
      ctaLabel: "Get Started",
    },
  },
  {
    industry: "personal-brand",
    name: "Personal Brand & Coaching",
    description: "Coaches, consultants, and thought leaders building their personal brand.",
    sectionTemplateId: "portfolio",
    tunerProfileName: "Minimal & Airy",
    preferredArchetype: { relief: "neumorphic", finish: "matte", shape: "squircle" },
    preferredVariants: { hero: ["HeroMinimal"], features: ["FeaturesAlternating"] },
    toneGuidance: "authentic, conversational, value-driven first-person voice",
    content: {
      heroHeadline: "Helping Leaders Reach Their Next Level",
      heroSubheadline: "Executive coach, speaker, and author with 15 years of Fortune 500 experience",
      featureGroups: [
        [
          { title: "One-on-One Coaching", description: "Personalized leadership development programs for executives and high-potential managers." },
          { title: "Keynote Speaking", description: "Engaging talks on leadership, resilience, and organizational culture for events worldwide." },
          { title: "Online Courses", description: "Self-paced programs covering emotional intelligence, strategic thinking, and team building." },
        ],
      ],
      ctaHeadline: "Ready to Level Up?",
      ctaSubheadline: "Book a free discovery call and let's map out your growth journey.",
      ctaLabel: "Book a Call",
    },
  },
]

export function getIndustryProfile(industry: string): IndustryProfile | undefined {
  return INDUSTRY_PROFILES.find((p) => p.industry === industry)
}
