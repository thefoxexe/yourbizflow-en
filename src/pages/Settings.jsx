import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, LogOut, CreditCard, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/customSupabaseClient";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    currency: "eur",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        email: user.email,
        currency: profile.currency || "eur",
      });
    }
  }, [profile, user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.full_name,
        currency: profileData.currency,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
      });
    } else {
      toast({ title: "Succès", description: "Profil mis à jour." });
      await refreshProfile();
    }
  };

  const handleManageSubscription = () => {
    window.open(
      "https://billing.stripe.com/p/login/3cIfZi3ML4OwflKciwawo00",
      "_blank"
    );
  };

  const handleChangePassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/password-reset`,
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } else {
      toast({
        title: "Email envoyé",
        description:
          "Veuillez consulter votre boîte de réception pour changer votre mot de passe.",
      });
    }
  };

  const handleChangeEmail = async () => {
    const newEmail = prompt("Veuillez entrer votre nouvelle adresse email :");
    if (newEmail && newEmail !== user.email) {
      const { data, error } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: `${window.location.origin}/email-change-confirmation`,
        }
      );
      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message,
        });
      } else {
        toast({
          title: "Email de confirmation envoyé",
          description:
            "Veuillez consulter vos deux boîtes de réception pour confirmer le changement.",
        });
      }
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const { error } = await supabase.rpc("delete_user_account");
    setIsDeleting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          "La suppression du compte a échoué. Veuillez nous contacter.",
      });
    } else {
      toast({
        title: "Compte supprimé",
        description: "Votre compte et toutes vos données ont été supprimés.",
      });
      await signOut();
    }
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "subscription", label: "Abonnement", icon: CreditCard },
    { id: "security", label: "Sécurité", icon: Lock },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={profileData.full_name}
                onChange={(e) =>
                  setProfileData({ ...profileData, full_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Select
                value={profileData.currency}
                onValueChange={(value) =>
                  setProfileData({ ...profileData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une devise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="chf">CHF (CHF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Enregistrer les modifications</Button>
          </form>
        );
      case "subscription":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">Votre abonnement actuel</h3>
              <p className="text-muted-foreground">
                Plan:{" "}
                <span className="font-bold text-primary">
                  {profile?.subscription_plan?.name || "N/A"}
                </span>
              </p>
            </div>
            <Button onClick={handleManageSubscription}>
              {t("Gérer mon abonnement")}
            </Button>
          </div>
        );
      case "security":
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <Button variant="outline" onClick={handleChangePassword}>
                Changer le mot de passe
              </Button>
              <Button variant="outline" onClick={handleChangeEmail}>
                Changer l’adresse email
              </Button>
            </div>
            <div className="border-t border-destructive/50 pt-6">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Zone de Danger
              </h3>
              <p className="text-muted-foreground mb-4">
                Ces actions sont irréversibles. Veuillez être certain avant de
                continuer.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Supprimer mon compte</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Êtes-vous absolument sûr ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Votre compte, ainsi que
                      toutes les données associées (factures, clients, projets,
                      etc.), seront définitivement supprimés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting
                        ? "Suppression..."
                        : "Oui, supprimer mon compte"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        );
      default:
        return (
          <p className="text-muted-foreground">
            Cette section est en cours de développement.
          </p>
        );
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de votre compte et de votre espace de travail.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <nav className="flex flex-col space-y-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </nav>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 bg-card/50 backdrop-blur-sm border rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
