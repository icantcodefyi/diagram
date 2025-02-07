"use client";

import { Menu, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

export function MobileNavbar({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const overflow = isOpen ? "hidden" : "auto";
    document.documentElement.style.overflow = overflow;
  }, [isOpen]);

  useEffect(() => {
    const closeHamburgerNavigation = () => setIsOpen(false);
    window.addEventListener("orientationchange", closeHamburgerNavigation);
    window.addEventListener("resize", closeHamburgerNavigation);

    return () => {
      window.removeEventListener("orientationchange", closeHamburgerNavigation);
      window.removeEventListener("resize", closeHamburgerNavigation);
    };
  }, []);

  return (
    <>
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 top-[50px] z-40 size-full overflow-auto bg-black/40 animate-in slide-in-from-bottom-24 md:hidden"
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </>
  );
}
