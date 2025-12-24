"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";

function MobileNavContent() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="p-0 m-0 w-fit h-fit md:hidden"
        >
          <Menu className="!h-6 !w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 w-56 border-r-slate-800 bg-slate-900 text-white"
      >
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  // Reset component (and close sheet) when pathname changes by using key
  return <MobileNavContent key={pathname} />;
}
