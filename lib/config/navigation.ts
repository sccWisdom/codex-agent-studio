export type MainNavItem = {
  label: string;
  href: string;
  description: string;
};

export const mainNavItems: MainNavItem[] = [
  {
    label: "Home",
    href: "/",
    description: "Workspace entry and project status overview",
  },
  {
    label: "Chat",
    href: "/chat",
    description: "Session list, message area, and run status",
  },
  {
    label: "Knowledge",
    href: "/knowledge",
    description: "Document upload, list management, and retrieval preview",
  },
  {
    label: "Runs",
    href: "/runs",
    description: "Run history and tool call trace visibility",
  },
  {
    label: "Settings",
    href: "/settings",
    description: "Model, prompt, and tool switch management",
  },
];
