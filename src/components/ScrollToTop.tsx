"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Reset standard browser window scroll position
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });

    // 2. Reset main scroll container (<main> element in dashboard layout)
    const mainContainers = document.querySelectorAll("main, [data-scroll-container]");
    mainContainers.forEach((container) => {
      container.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
    });

    // 3. Reset any inner page scrollable elements (excluding sidebar & nav containers)
    const getPageContainers = () =>
      Array.from(
        document.querySelectorAll(".overflow-y-auto, .overflow-auto, .overflow-y-scroll")
      ).filter((container) => !container.closest("aside, nav, [data-sidebar]"));

    const overflowContainers = getPageContainers();
    overflowContainers.forEach((container) => {
      container.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
    });

    // 4. Second frame check to ensure layout updates don't preserve scroll offset
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      mainContainers.forEach((container) => {
        container.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      });
      getPageContainers().forEach((container) => {
        container.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return null;
}
