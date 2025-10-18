"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Github, Wifi } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Wifi className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Adres Hız Sorgulama
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Ana Sayfa
            </Link>
            <Link 
              href="#nasil-calisir" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Nasıl Çalışır?
            </Link>
            <Button
              asChild
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Link 
                href="https://github.com/hasirciogli/adres-hiz-sorgulama" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menüyü aç</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link 
                    href="/" 
                    className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Ana Sayfa
                  </Link>
                  <Link 
                    href="#nasil-calisir" 
                    className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Nasıl Çalışır?
                  </Link>
                  <Button
                    asChild
                    variant="outline"
                    className="flex items-center space-x-2 w-full justify-start"
                  >
                    <Link 
                      href="https://github.com/hasirciogli/adres-hiz-sorgulama" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                    >
                      <Github className="h-4 w-4" />
                      <span>GitHub</span>
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
