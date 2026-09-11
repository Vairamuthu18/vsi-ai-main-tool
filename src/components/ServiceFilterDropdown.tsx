"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Filter } from "lucide-react";
import { Dropdown } from "@/components/Dropdown";

interface ServiceFilterDropdownProps {
  currentValue?: "all-services" | "seo-tracked" | "geo-tracked" | "all" | "seo" | "geo";
  onSelect?: (value: "all-services" | "seo-tracked" | "geo-tracked") => void;
  className?: string;
}

export default function ServiceFilterDropdown({ currentValue, onSelect, className }: ServiceFilterDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active filter from pathname or prop
  let activeValue: "all-services" | "seo-tracked" | "geo-tracked" = "all-services";
  if (currentValue === "seo" || currentValue === "seo-tracked" || pathname.includes("/seo-tracked") || pathname.includes("/services/seo")) {
    activeValue = "seo-tracked";
  } else if (currentValue === "geo" || currentValue === "geo-tracked" || pathname.includes("/geo-tracked") || pathname.includes("/services/geo")) {
    activeValue = "geo-tracked";
  } else {
    activeValue = "all-services";
  }

  const handleFilterChange = (val: string) => {
    let targetRoute = "/dashboard/services/all-services";
    let filterVal: "all-services" | "seo-tracked" | "geo-tracked" = "all-services";

    if (val === "seo-tracked" || val === "seo") {
      targetRoute = "/dashboard/services/seo-tracked";
      filterVal = "seo-tracked";
    } else if (val === "geo-tracked" || val === "geo") {
      targetRoute = "/dashboard/services/geo-tracked";
      filterVal = "geo-tracked";
    } else {
      targetRoute = "/dashboard/services/all-services";
      filterVal = "all-services";
    }

    if (onSelect) {
      onSelect(filterVal);
    } else if (pathname !== targetRoute) {
      router.push(targetRoute);
    }
  };

  const getLabelText = () => {
    switch (activeValue) {
      case "seo-tracked":
        return "SEO Tracked";
      case "geo-tracked":
        return "GEO Tracked";
      case "all-services":
      default:
        return "All Services";
    }
  };

  return (
    <Dropdown
      variant="filter"
      value={activeValue === "seo-tracked" ? "seo" : activeValue === "geo-tracked" ? "geo" : "all"}
      onChange={handleFilterChange}
      options={[
        { value: "all", label: "All Services" },
        { value: "seo", label: "SEO Tracked" },
        { value: "geo", label: "GEO Tracked" }
      ]}
      trigger={
        <div
          className={
            className ||
            "flex items-center gap-1.5 bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-slate-100 hover:border-[#FF5A1F]/50 transition-all outline-none cursor-pointer shrink-0"
          }
        >
          <Filter size={14} className="text-muted-foreground shrink-0" />
          <span className="text-muted-foreground font-medium">Filter:</span>
          <span className="font-bold text-foreground">{getLabelText()}</span>
        </div>
      }
    />
  );
}
