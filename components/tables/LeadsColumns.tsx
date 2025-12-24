import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
export interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  status: string;
  source: string;
  createdAt: Date;
  summary?: string | null;
}

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name || "Unknown"}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-slate-600">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = String(row.getValue("status"));
      const colorMap: Record<string, string> = {
        new: "bg-blue-100 text-blue-700",
        open: "bg-green-100 text-green-700",
        in_progress: "bg-yellow-100 text-yellow-700",
        closed: "bg-slate-100 text-slate-700",
      };
      return (
        <Badge className={`${colorMap[status] || "bg-slate-100"} capitalize`}>
          {status.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <div className="text-slate-600">{row.getValue("source")}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <div className="text-slate-600">{date.toLocaleDateString()}</div>;
    },
  },
];

export default columns;
