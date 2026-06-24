import React from "react";
import { Wallet, Landmark, CreditCard, PiggyBank, TrendingUp } from "lucide-react";
import { svgBanco, obterPreset } from "@/lib/bancos-brasil/core.js";

export function getBankDetails(institutionKey?: string | null, type?: string) {
  const key = institutionKey && institutionKey !== "generic" ? institutionKey.toLowerCase().trim() : null;
  
  if (key) {
    const preset = obterPreset(key);
    const svgString = svgBanco({ 
      nome: key, 
      formato: "quadrado", 
      tamanho: 64 
    });
    
    if (svgString) {
      return {
        key,
        fullName: key.charAt(0).toUpperCase() + key.slice(1),
        brandColor: preset?.fundo || "#71717a",
        textColor: preset?.cor || "#ffffff",
        logoSvg: svgString
      };
    }
  }

  // Fallback brand colors based on type
  const colors: Record<string, string> = {
    savings: "#22c55e",
    credit_card: "#18181b",
    investment: "#0ea5e9",
    generic: "#71717a"
  };

  const brandColor = type ? (colors[type] || colors.generic) : colors.generic;

  return {
    key: "generic",
    fullName: "Outro",
    brandColor,
    textColor: "#ffffff",
    logoSvg: null
  };
}

interface BankLogoProps {
  institution?: string | null;
  type?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function BankLogo({ institution, type, className = "h-8 w-8", style }: BankLogoProps) {
  const details = getBankDetails(institution, type);
  
  if (details.logoSvg) {
    // Make the SVG responsive by scaling to 100% of the containing div
    let svgHtml = details.logoSvg;
    svgHtml = svgHtml
      .replace(/width="\d+"/, 'width="100%"')
      .replace(/height="\d+"/, 'height="100%"');
    
    return (
      <div 
        className={`rounded-lg overflow-hidden shrink-0 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block ${className}`}
        style={{ ...style }}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
        title={details.fullName}
      />
    );
  }

  // Fallback rendering using Lucide Icons
  const getFallbackIcon = () => {
    switch (type) {
      case "savings":
        return <PiggyBank className="h-full w-full p-1.5" />;
      case "credit_card":
        return <CreditCard className="h-full w-full p-1.5" />;
      case "investment":
        return <TrendingUp className="h-full w-full p-1.5" />;
      case "checking":
        return <Landmark className="h-full w-full p-1.5" />;
      default:
        return <Wallet className="h-full w-full p-1.5" />;
    }
  };

  return (
    <div 
      className={`rounded-lg overflow-hidden flex items-center justify-center shrink-0 border ${className}`}
      style={{ 
        backgroundColor: `${details.brandColor}15`, 
        borderColor: `${details.brandColor}30`,
        color: details.brandColor,
        ...style 
      }}
      title={details.fullName}
    >
      {getFallbackIcon()}
    </div>
  );
}
