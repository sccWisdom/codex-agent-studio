export type MilestoneStatus = "current" | "pending";

export type MilestoneItem = {
  id: number;
  title: string;
  status: MilestoneStatus;
};

export const milestonePlan: MilestoneItem[] = [
  { id: 1, title: "Project bootstrap", status: "current" },
  { id: 2, title: "Chat loop", status: "pending" },
  { id: 3, title: "Tool call visualization", status: "pending" },
  { id: 4, title: "Knowledge management", status: "pending" },
  { id: 5, title: "Settings and runs", status: "pending" },
  { id: 6, title: "Phase two enhancement", status: "pending" },
];
