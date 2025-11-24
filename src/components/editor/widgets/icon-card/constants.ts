import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

export const TOOLBAR_SELECTOR = '[data-icon-card-toolbar="true"]';

export const ALIGN_OPTIONS: Array<{
  value: "left" | "center" | "right";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}> = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
];

export const GOOGLE_FONTS = [
  {
    value: "var(--font-poppins)",
    label: "Poppins",
    style: "var(--font-poppins)",
  },
  { value: "var(--font-inter)", label: "Inter", style: "var(--font-inter)" },
  { value: "var(--font-roboto)", label: "Roboto", style: "var(--font-roboto)" },
  {
    value: "var(--font-open-sans)",
    label: "Open Sans",
    style: "var(--font-open-sans)",
  },
  {
    value: "var(--font-montserrat)",
    label: "Montserrat",
    style: "var(--font-montserrat)",
  },
  { value: "var(--font-lato)", label: "Lato", style: "var(--font-lato)" },
  {
    value: "var(--font-playfair)",
    label: "Playfair Display",
    style: "var(--font-playfair)",
  },
  {
    value: "var(--font-merriweather)",
    label: "Merriweather",
    style: "var(--font-merriweather)",
  },
  {
    value: "var(--font-raleway)",
    label: "Raleway",
    style: "var(--font-raleway)",
  },
  { value: "var(--font-ubuntu)", label: "Ubuntu", style: "var(--font-ubuntu)" },
];

export const FONT_SIZE_OPTIONS = [
  { label: "Extra Small", value: 14 },
  { label: "Small", value: 18 },
  { label: "Medium", value: 24 },
  { label: "Large", value: 32 },
  { label: "Extra Large", value: 42 },
  { label: "Huge", value: 56 },
];

export const ICON_SIZE_OPTIONS = [
  { label: "Extra Small", value: 32 },
  { label: "Small", value: 40 },
  { label: "Medium", value: 48 },
  { label: "Large", value: 56 },
  { label: "Extra Large", value: 64 },
  { label: "Huge", value: 72 },
];

export const BACKGROUND_TYPE_OPTIONS = [
  { label: "Solid", value: "solid" as const, description: "Flat color fill" },
  {
    label: "Glass",
    value: "glass" as const,
    description: "Frosted glass effect",
  },
  {
    label: "Transparent",
    value: "transparent" as const,
    description: "No fill, inherits slide background",
  },
];

// Categorized Lucide icons for selection
export const ICON_CATEGORIES = {
  Popular: [
    "Star",
    "Heart",
    "Zap",
    "Rocket",
    "Award",
    "Trophy",
    "Crown",
    "Sparkles",
  ],
  Business: [
    "Briefcase",
    "Building",
    "Building2",
    "Store",
    "Factory",
    "Landmark",
    "TrendingUp",
    "TrendingDown",
    "BarChart",
    "LineChart",
    "PieChart",
    "Activity",
  ],
  Communication: [
    "Mail",
    "Phone",
    "MessageCircle",
    "MessageSquare",
    "Send",
    "Inbox",
    "Bell",
    "BellRing",
    "Volume2",
    "Mic",
    "Video",
  ],
  Technology: [
    "Smartphone",
    "Monitor",
    "Laptop",
    "Tablet",
    "Cpu",
    "HardDrive",
    "Wifi",
    "Cloud",
    "Database",
    "Server",
    "Code",
    "Terminal",
    "GitBranch",
  ],
  Shopping: [
    "ShoppingCart",
    "ShoppingBag",
    "CreditCard",
    "DollarSign",
    "Package",
    "Truck",
    "Tag",
    "Receipt",
    "Wallet",
  ],
  People: [
    "User",
    "Users",
    "UserPlus",
    "UserCheck",
    "UserX",
    "UsersRound",
    "Smile",
    "Frown",
    "Meh",
    "ThumbsUp",
    "ThumbsDown",
    "Heart",
  ],
  Media: [
    "Camera",
    "Image",
    "Film",
    "Video",
    "Music",
    "Headphones",
    "Play",
    "Pause",
    "Square",
    "Circle",
    "Triangle",
  ],
  Files: [
    "FileText",
    "File",
    "Files",
    "Folder",
    "FolderOpen",
    "Save",
    "Download",
    "Upload",
    "Share2",
    "Copy",
    "Clipboard",
  ],
  Time: [
    "Clock",
    "Calendar",
    "Timer",
    "Hourglass",
    "CalendarDays",
    "CalendarCheck",
  ],
  Location: ["MapPin", "Map", "Globe", "Navigation", "Compass", "Home"],
  Security: [
    "Shield",
    "ShieldCheck",
    "Lock",
    "Unlock",
    "Key",
    "Eye",
    "EyeOff",
    "Fingerprint",
  ],
  Status: [
    "CheckCircle",
    "XCircle",
    "AlertCircle",
    "AlertTriangle",
    "Info",
    "HelpCircle",
    "Check",
    "X",
    "Plus",
    "Minus",
  ],
  Design: [
    "Palette",
    "Paintbrush",
    "Pencil",
    "Edit",
    "Layout",
    "Layers",
    "Grid",
    "Move",
    "Maximize",
    "Minimize",
  ],
  Nature: [
    "Sun",
    "Moon",
    "Star",
    "Cloud",
    "CloudRain",
    "Snowflake",
    "Wind",
    "Umbrella",
    "Flame",
    "Droplet",
  ],
  Food: ["Coffee", "Pizza", "Apple", "Cake", "Cookie", "IceCream"],
  Actions: [
    "Search",
    "Filter",
    "Settings",
    "Tool",
    "Wrench",
    "Hammer",
    "Target",
    "Flag",
    "Bookmark",
    "Link",
  ],
};

// Flatten all icons for search
export const ALL_ICONS = Object.values(ICON_CATEGORIES).flat();

