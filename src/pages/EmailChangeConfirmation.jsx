import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet";

const EmailChangeConfirmation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const errorDescription = params.get("error_description");

    if (errorDescription) {
      toast({
        variant: "destructive",
        title: "Confirmation error",
        description: "The confirmation link is invalid or expired.",
      });
    } else {
      toast({
        title: "Email updated!",
        description: "Your email address has been successfully updated.",
      });
    }

    const timer = setTimeout(() => {
      navigate("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast, navigate]);

  const hash = window.location.hash;
  const params = new URLSearchParams(hash.substring(1));
  const errorDescription = params.get("error_description");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030303]">
      <Helmet>
        <title>Email change confirmation - YourBizFlow</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-xl p-8 shadow-lg text-center"
      >
        {errorDescription ? (
          <XCircle className="w-24 h-24 mx-auto text-destructive" />
        ) : (
          <CheckCircle className="w-24 h-24 mx-auto text-green-500" />
        )}

        <h1 className="text-3xl font-bold mt-6 mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          {errorDescription ? "Confirmation failed" : "Email confirmed!"}
        </h1>
        <p className="text-white/60 mb-8">
          {errorDescription
            ? "The link you used is invalid or expired. Please try again from your settings."
            : "Your email address has been successfully updated. You will be redirected to the login page."}
        </p>

        <Link to="/login">
          <button className="text-primary hover:underline">
            Return to login page
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

export default EmailChangeConfirmation;
