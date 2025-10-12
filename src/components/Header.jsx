import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Crown,
  LogOut,
  Settings,
  UserCircle,
  Menu,
  Globe,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSelector = () => {
  const [lang, setLang] = useState("Français");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary"
        >
          <Globe className="w-5 h-5" />
          <span className="hidden sm:inline">{lang}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setLang("Français")} asChild>
          <a href="/">Français</a>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setLang("English")} asChild>
          <a href="/">English</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Header = ({ onMenuClick, openCompanyDialog }) => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-white/10 z-40"
      >
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-muted-foreground"
          >
            <Menu className="w-6 h-6" />
          </Button>

          <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
            {profile && profile.subscription_plan && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-secondary border border-white/10 rounded-full">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-foreground capitalize">
                  {profile.subscription_plan.name}
                </span>
              </div>
            )}

            <LanguageSelector />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary"
                >
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {profile?.full_name || "Mon Compte"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;
