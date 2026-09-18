"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const liquidbuttonVariants = cva(
  "relative inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4.5 shrink-0 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "text-blue-700 hover:scale-[1.03] hover:text-blue-800 font-semibold",
        primary:
          "text-white font-bold hover:scale-[1.03] hover:brightness-105",
        destructive:
          "text-rose-700 hover:bg-rose-50 hover:scale-[1.03]",
        outline:
          "border border-sky-200 bg-white/60 text-slate-700 hover:text-blue-700 hover:border-blue-300",
        ghost:
          "text-slate-600 hover:text-blue-700 hover:bg-blue-50/60",
      },
      size: {
        sm: "h-9 px-4 text-xs gap-1.5",
        default: "h-11 px-6 text-sm font-semibold gap-2",
        lg: "h-12 px-7 text-sm font-bold gap-2.5",
        xl: "h-14 px-8 text-base font-bold gap-3",
        xxl: "h-16 px-10 text-lg font-bold gap-3.5",
        icon: "h-11 w-11 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
  asChild?: boolean
  cyanTint?: boolean
  primary?: boolean
}

export function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  cyanTint = false,
  primary = false,
  children,
  ...props
}: LiquidButtonProps) {
  const Comp = asChild ? Slot : "button"
  const isPrimary = primary || cyanTint || variant === 'primary'

  return (
    <Comp
      data-slot="liquid-button"
      className={cn(
        liquidbuttonVariants({ variant: isPrimary ? 'primary' : variant, size, className }),
        "group select-none"
      )}
      {...props}
    >
      {/* Specular optical liquid glass border and inner shadow refraction */}
      <div 
        className={cn(
          "absolute inset-0 z-0 rounded-full transition-all duration-300 pointer-events-none",
          isPrimary
            ? "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-[0_8px_25px_rgba(37,99,235,0.32),inset_0_1px_2px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.15)] group-hover:shadow-[0_12px_32px_rgba(37,99,235,0.42)]"
            : "bg-white/70 shadow-[0_6px_22px_rgba(2,132,199,0.1),inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(2,132,199,0.06)] group-hover:shadow-[0_10px_28px_rgba(2,132,199,0.16)] border border-white/80 group-hover:border-sky-200"
        )}
      />

      {/* Optical blur layer with displacement filter fallback */}
      <div
        className="absolute inset-0 -z-10 rounded-full overflow-hidden backdrop-blur-xl pointer-events-none"
        style={{
          backdropFilter: 'url("#resona-container-glass") blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      />

      {/* Top subtle specular gloss highlight */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

      {/* Button content */}
      <div className="relative z-10 flex items-center justify-center gap-2 pointer-events-none font-sans tracking-tight">
        {children}
      </div>
    </Comp>
  )
}

/**
 * Singleton SVG Displacement & Turbulence Filter
 * Injected once into the root layout so there are no DOM ID conflicts.
 */
export function GlassFilter() {
  return (
    <svg 
      className="fixed pointer-events-none opacity-0 -z-50 w-0 h-0 overflow-hidden" 
      aria-hidden="true"
    >
      <defs>
        <filter
          id="resona-container-glass"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          {/* Subtle turbulence noise */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04 0.04"
            numOctaves="1"
            seed="2"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="1.5" result="blurredNoise" />
          {/* Restrained displacement to preserve text legibility */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="2" result="finalBlur" />
          <feComposite in="SourceGraphic" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

type ColorVariant =
  | "default"
  | "primary"
  | "success"
  | "error"
  | "gold"
  | "bronze";

interface MetalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ColorVariant;
}

const colorVariants: Record<
  ColorVariant,
  {
    outer: string;
    inner: string;
    button: string;
    textColor: string;
    textShadow: string;
  }
> = {
  default: {
    outer: "bg-gradient-to-b from-[#CBD5E1] to-[#64748B]",
    inner: "bg-gradient-to-b from-[#FFFFFF] via-[#E2E8F0] to-[#F1F5F9]",
    button: "bg-gradient-to-b from-[#2563EB] to-[#1D4ED8]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_1px_rgba(0,0,0,0.25)]",
  },
  primary: {
    outer: "bg-gradient-to-b from-[#93C5FD] to-[#1D4ED8]",
    inner: "bg-gradient-to-b from-[#EFF6FF] via-[#BFDBFE] to-[#DBEAFE]",
    button: "bg-gradient-to-b from-[#2563EB] to-[#1E40AF]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_1px_rgba(0,0,0,0.25)]",
  },
  success: {
    outer: "bg-gradient-to-b from-[#6EE7B7] to-[#047857]",
    inner: "bg-gradient-to-b from-[#ECFDF5] via-[#A7F3D0] to-[#D1FAE5]",
    button: "bg-gradient-to-b from-[#10B981] to-[#059669]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_1px_rgba(0,0,0,0.25)]",
  },
  error: {
    outer: "bg-gradient-to-b from-[#FCA5A5] to-[#B91C1C]",
    inner: "bg-gradient-to-b from-[#FEF2F2] via-[#FECACA] to-[#FEE2E2]",
    button: "bg-gradient-to-b from-[#EF4444] to-[#DC2626]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_1px_rgba(0,0,0,0.25)]",
  },
  gold: {
    outer: "bg-gradient-to-b from-[#FDE68A] to-[#B45309]",
    inner: "bg-gradient-to-b from-[#FFFBEB] via-[#FDE68A] to-[#FEF3C7]",
    button: "bg-gradient-to-b from-[#F59E0B] to-[#D97706]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_1px_rgba(0,0,0,0.25)]",
  },
  bronze: {
    outer: "bg-gradient-to-b from-[#FDBA74] to-[#C2410C]",
    inner: "bg-gradient-to-b from-[#FFF7ED] via-[#FED7AA] to-[#FFEDD5]",
    button: "bg-gradient-to-b from-[#F97316] to-[#EA580C]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_1px_rgba(0,0,0,0.25)]",
  },
};

const metalButtonVariants = (
  variant: ColorVariant = "default",
  isPressed: boolean,
  isHovered: boolean,
  isTouchDevice: boolean,
) => {
  const colors = colorVariants[variant];
  const transitionStyle = "all 250ms cubic-bezier(0.1, 0.4, 0.2, 1)";

  return {
    wrapper: cn(
      "relative inline-flex transform-gpu rounded-full p-[1.5px] will-change-transform shadow-md",
      colors.outer,
    ),
    wrapperStyle: {
      transform: isPressed
        ? "translateY(2px) scale(0.99)"
        : "translateY(0) scale(1)",
      boxShadow: isPressed
        ? "0 1px 2px rgba(0, 0, 0, 0.15)"
        : isHovered && !isTouchDevice
          ? "0 6px 16px rgba(37, 99, 235, 0.18)"
          : "0 3px 10px rgba(0, 0, 0, 0.08)",
      transition: transitionStyle,
      transformOrigin: "center center",
    },
    inner: cn(
      "absolute inset-[1px] transform-gpu rounded-full will-change-transform",
      colors.inner,
    ),
    innerStyle: {
      transition: transitionStyle,
      transformOrigin: "center center",
      filter:
        isHovered && !isPressed && !isTouchDevice ? "brightness(1.05)" : "none",
    },
    button: cn(
      "relative z-10 m-[1px] rounded-full inline-flex h-12 transform-gpu cursor-pointer items-center justify-center overflow-hidden px-7 py-2.5 text-sm leading-none font-bold will-change-transform outline-none",
      colors.button,
      colors.textColor,
      colors.textShadow,
    ),
    buttonStyle: {
      transform: isPressed ? "scale(0.97)" : "scale(1)",
      transition: transitionStyle,
      transformOrigin: "center center",
      filter:
        isHovered && !isPressed && !isTouchDevice ? "brightness(1.04)" : "none",
    },
  };
};

export const MetalButton = React.forwardRef<
  HTMLButtonElement,
  MetalButtonProps
>(({ children, className, variant = "default", ...props }, ref) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const buttonText = children || "Button";
  const variants = metalButtonVariants(
    variant,
    isPressed,
    isHovered,
    isTouchDevice,
  );

  return (
    <div className={variants.wrapper} style={variants.wrapperStyle}>
      <div className={variants.inner} style={variants.innerStyle}></div>
      <button
        ref={ref}
        className={cn(variants.button, className)}
        style={variants.buttonStyle}
        {...props}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => { setIsPressed(false); setIsHovered(false); }}
        onMouseEnter={() => { if (!isTouchDevice) setIsHovered(true); }}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onTouchCancel={() => setIsPressed(false)}
      >
        {buttonText}
      </button>
    </div>
  );
});

MetalButton.displayName = "MetalButton";
