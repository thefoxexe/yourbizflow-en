import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Sparkles,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Wrench,
  BrainCircuit,
  Smartphone,
  Monitor,
  TrendingUp,
  ShieldCheck,
  Zap,
  Star,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/customSupabaseClient";
import { Progress } from "@/components/ui/progress";

const ResultCard = ({ icon: Icon, title, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Icon className="w-6 h-6 text-primary" />
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </motion.div>
);

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const parseMarkdown = (text) => {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    const elements = [];
    let listItems = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul
            key={`ul-${elements.length}`}
            className="list-disc space-y-2 pl-5"
          >
            {listItems}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-semibold mt-4 mb-2">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={index} className="text-xl font-bold mt-6 mb-3">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith("* ") || line.startsWith("- ")) {
        const itemContent = line
          .substring(2)
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        listItems.push(
          <li
            key={`${index}-${listItems.length}`}
            dangerouslySetInnerHTML={{ __html: itemContent }}
          />
        );
      } else {
        flushList();
        const pContent = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        elements.push(
          <p
            key={index}
            className="mb-2"
            dangerouslySetInnerHTML={{ __html: pContent }}
          />
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {parseMarkdown(content)}
    </div>
  );
};

const ScoreComparisonCard = ({ mobile, desktop }) => {
  const scores = [
    { label: "Performance", key: "performance", icon: Zap },
    { label: "Accessibility", key: "accessibility", icon: ShieldCheck },
    { label: "SEO", key: "seo", icon: TrendingUp },
    { label: "Best Practices", key: "bestPractices", icon: Star },
  ];

  const getScoreColor = (s) => {
    if (s >= 90) return "bg-green-500";
    if (s >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Detailed Scores (PageSpeed)</CardTitle>
        <CardDescription>
          Performance of your site on mobile and computer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {scores.map(({ label, key, icon: Icon }) => (
          <div key={key}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <h4 className="font-semibold">{label}</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <motion.div
                    className={`h-2.5 rounded-full ${getScoreColor(
                      mobile[key]
                    )}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${mobile[key]}%` }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  />
                </div>
                <span className="font-bold w-10 text-right">{mobile[key]}</span>
              </div>
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-primary" />
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <motion.div
                    className={`h-2.5 rounded-full ${getScoreColor(
                      desktop[key]
                    )}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${desktop[key]}%` }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  />
                </div>
                <span className="font-bold w-10 text-right">
                  {desktop[key]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const ScoreCircle = ({ score }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (s) => {
    if (s >= 90) return "text-green-500";
    if (s >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-secondary"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <motion.circle
          className={getScoreColor(score)}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.3, ease: "circOut" }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          className="text-4xl font-bold fill-current text-foreground"
        >
          {score}
        </text>
      </svg>
    </div>
  );
};

const SeoAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!url) {
      toast({
        variant: "destructive",
        title: "Missing URL",
        description: "Please enter a URL to analyze.",
      });
      return;
    }
    try {
      new URL(url);
    } catch (_) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid URL (ex: https://example.com).",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : 90));
    }, 800);

    try {
      const { data, error } = await supabase.functions.invoke("seo-analyzer", {
        body: JSON.stringify({ url }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error)
        throw new Error(error.message || "An error occurred during parsing.");
      if (data.error) throw new Error(data.error);

      setAnalysisResult(data);
      toast({
        title: "Analysis completed!",
        description: "Your SEO report is ready.",
      });
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        variant: "destructive",
        title: "Parse error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;
    const { scores, results } = analysisResult;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 mt-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="flex flex-col items-center justify-center text-center p-6 h-full">
              <CardHeader className="pb-4">
                <CardTitle>Overall SEO Score</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ScoreCircle score={scores.overall} />
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <ScoreComparisonCard
              mobile={scores.mobile}
              desktop={scores.desktop}
            />
          </motion.div>
        </div>

        <ResultCard
          icon={BrainCircuit}
          title="Analyse Stratégique par l'IA"
          delay={0.3}
        >
          <div className="text-sm text-muted-foreground space-y-4">
            <MarkdownRenderer content={results.aiReport} />
          </div>
        </ResultCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResultCard icon={Wrench} title="Structure & Content" delay={0.4}>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                {results.h1.count === 1 ? (
                  <CheckCircle className="text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="text-red-500 flex-shrink-0" />
                )}
                <span>{results.h1.count} H1 tag found (1 recommended).</span>
              </li>
              <li className="flex items-center gap-2">
                {results.h2.count > 0 ? (
                  <CheckCircle className="text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="text-yellow-500 flex-shrink-0" />
                )}
                <span>
                  {results.h2.count} H2 tags found (good for structure).
                </span>
              </li>
              <li className="flex items-center gap-2">
                {results.images.withoutAlt === 0 ? (
                  <CheckCircle className="text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="text-red-500 flex-shrink-0" />
                )}
                <span>
                  {results.images.withoutAlt} images without 'alt' attribute on{" "}
                  {results.images.total}.
                </span>
              </li>
              <li className="flex items-center gap-2">
                {results.wordCount.value > 300 ? (
                  <CheckCircle className="text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="text-yellow-500 flex-shrink-0" />
                )}
                <span>
                  {results.wordCount.value} words (300+ is a good start).
                </span>
              </li>
            </ul>
          </ResultCard>
          <ResultCard icon={Wrench} title="Technique & Indexing" delay={0.5}>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                {results.robotsTxt.found ? (
                  <CheckCircle className="text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="text-red-500 flex-shrink-0" />
                )}
                <span>
                  Robots.txt file{" "}
                  {results.robotsTxt.found ? "find." : "missing."}
                </span>
              </li>
              <li className="flex items-center gap-2">
                {results.sitemapXml.found ? (
                  <CheckCircle className="text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="text-red-500 flex-shrink-0" />
                )}
                <span>
                  Sitemap.xml file{" "}
                  {results.sitemapXml.found ? "find." : "missing."}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0" />
                <span>Content Score: {scores.content}/100</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0" />
                <span>Technical Score: {scores.technical}/100</span>
              </li>
            </ul>
          </ResultCard>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Analysis methodology</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                The overall score is a weighted average of several SEO pillars,
                combining your content analysis and Google PageSpeed ​​API
                results.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Content (30%):</strong> Quality and structure (title,
                  description, H1 tags, words).
                </li>
                <li>
                  <strong>PageSpeed ​​performance (15%):</strong> Loading speed
                  on mobile.
                </li>
                <li>
                  <strong>PageSpeed ​​accessibility (15%):</strong> Ease of use
                  for everyone.
                </li>
                <li>
                  <strong>SEO PageSpeed ​​(15%):</strong> Compliance with basic
                  SEO standards.
                </li>
                <li>
                  <strong>PageSpeed ​​Best Practices (15%):</strong> General
                  quality of code and configuration.
                </li>
                <li>
                  <strong>Technical (10%):</strong> Presence of `robots.txt` and
                  `sitemap.xml`.
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <Helmet>
        <title>AI SEO Analyzer - YourBizFlow</title>
        <meta
          name="description"
          content="Analyze and improve your website's SEO performance with AI-based recommendations. Get your overall SEO score and optimization ideas."
        />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            AI SEO Analyzer
          </h1>
        </div>
        <p className="text-muted-foreground">
          Boost your visibility on search engines with personalized
          recommendations.
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Start a new analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://your-website.com"
                className="pl-10 pr-4 py-3 text-lg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Scanning...
                </>
              ) : (
                "Analyze the site"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 text-center"
          >
            <Progress value={progress} className="w-full" />
            <p className="text-muted-foreground animate-pulse">
              The robot scans your site... This may take up to a minute.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {analysisResult
        ? renderAnalysisResult()
        : !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 border-2 border-dashed rounded-lg"
            >
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Ready to optimize your SEO?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your site URL to get a full AI report and suggestions for
                improvement.
              </p>
            </motion.div>
          )}
    </div>
  );
};

export default SeoAnalyzer;
