// import React from 'react';
// import { clsx } from 'clsx';
// import { designTokens, componentTokens } from '@/styles/design-tokens';

// interface CardProps {
//   children: React.ReactNode;
//   className?: string;
//   padding?: 'none' | 'sm' | 'md' | 'lg';
//   shadow?: 'none' | 'sm' | 'md' | 'lg';
//   border?: boolean;
//   hover?: boolean;
// }

// const paddingClasses = {
//   none: '',
//   sm: 'p-3',
//   md: 'p-4',
//   lg: 'p-6'
// };

// const shadowClasses = {
//   none: '',
//   sm: 'shadow-sm',
//   md: 'shadow-md',
//   lg: 'shadow-lg'
// };

// export const Card: React.FC<CardProps> = ({
//   children,
//   className,
//   padding = 'none', // Changed default to none since CardHeader/CardContent handle padding
//   shadow = 'sm',
//   border = true,
//   hover = false
// }) => {
//   return (
//     <div
//       className={clsx(
//         // Base styles with consistent design tokens
//         'bg-white dark:bg-gray-800 rounded-lg transition-all duration-200',
//         paddingClasses[padding],
//         shadowClasses[shadow],
//         border && 'border border-gray-200 dark:border-gray-700',
//         hover && 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// };

// // Card header component with consistent styling
// interface CardHeaderProps {
//   children: React.ReactNode;
//   className?: string;
//   border?: boolean;
// }

// export const CardHeader: React.FC<CardHeaderProps> = ({
//   children,
//   className,
//   border = true
// }) => {
//   return (
//     <div
//       className={clsx(
//         'px-6 py-4',
//         border && 'border-b border-gray-200 dark:border-gray-700',
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// };

// // Card content component with consistent padding
// interface CardContentProps {
//   children: React.ReactNode;
//   className?: string;
//   padding?: 'sm' | 'md' | 'lg';
// }

// export const CardContent: React.FC<CardContentProps> = ({
//   children,
//   className,
//   padding = 'md'
// }) => {
//   const paddingClass = {
//     sm: 'px-4 py-3',
//     md: 'px-6 py-4',
//     lg: 'px-8 py-6'
//   }[padding];

//   return (
//     <div className={clsx(paddingClass, className)}>
//       {children}
//     </div>
//   );
// };

// // Card footer component
// interface CardFooterProps {
//   children: React.ReactNode;
//   className?: string;
//   border?: boolean;
//   padding?: 'sm' | 'md' | 'lg';
// }

// export const CardFooter: React.FC<CardFooterProps> = ({
//   children,
//   className,
//   border = true,
//   padding = 'md'
// }) => {
//   const paddingClass = {
//     sm: 'px-4 py-3',
//     md: 'px-6 py-4',
//     lg: 'px-8 py-6'
//   }[padding];

//   return (
//     <div
//       className={clsx(
//         paddingClass,
//         border && 'border-t border-gray-200 dark:border-gray-700',
//         'bg-gray-50 dark:bg-gray-800/50 rounded-b-lg',
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// };

// // Specialized card components
// export const StatCard: React.FC<{
//   title: string;
//   value: string | number;
//   change?: string;
//   changeType?: 'positive' | 'negative' | 'neutral';
//   icon?: React.ReactNode;
//   className?: string;
// }> = ({ title, value, change, changeType = 'neutral', icon, className }) => {
//   const changeColors = {
//     positive: 'text-green-600',
//     negative: 'text-red-600',
//     neutral: 'text-gray-600'
//   };

//   return (
//     <Card className={clsx('p-6', className)} hover>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-600">{title}</p>
//           <p className="text-2xl font-bold text-gray-900">{value}</p>
//           {change && (
//             <p className={clsx('text-sm', changeColors[changeType])}>
//               {change}
//             </p>
//           )}
//         </div>
//         {icon && (
//           <div className="text-gray-400">
//             {icon}
//           </div>
//         )}
//       </div>
//     </Card>
//   );
// };

// export const ActionCard: React.FC<{
//   title: string;
//   description: string;
//   action: React.ReactNode;
//   icon?: React.ReactNode;
//   className?: string;
// }> = ({ title, description, action, icon, className }) => {
//   return (
//     <Card className={clsx('p-6', className)} hover>
//       <div className="flex items-start space-x-4">
//         {icon && (
//           <div className="flex-shrink-0 text-blue-600">
//             {icon}
//           </div>
//         )}
//         <div className="flex-1 min-w-0">
//           <h3 className="text-lg font-medium text-gray-900">{title}</h3>
//           <p className="text-gray-600 mt-1">{description}</p>
//           <div className="mt-4">
//             {action}
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// };

import React from "react";
import { clsx } from "clsx";
import { designTokens, componentTokens } from "@/styles/design-tokens";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  border?: boolean;
  hover?: boolean;
  variant?: "default" | "gradient" | "glass" | "elevated";
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const shadowClasses = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

const variantClasses = {
  default: "bg-white dark:bg-gray-200",
  gradient:
    "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900",
  glass: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
  elevated: "bg-white dark:bg-gray-800 shadow-xl",
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "none",
  shadow = "sm",
  border = true,
  hover = false,
  variant = "default",
}) => {
  return (
    <div
      className={clsx(
        // Base styles with smooth transitions
        "rounded-xl transition-all duration-300 ease-in-out",
        variantClasses[variant],
        paddingClasses[padding],
        shadowClasses[shadow],
        border && "border border-gray-200/60 dark:border-gray-700/60",
        hover &&
          "hover:shadow-xl hover:border-blue-300/40 dark:hover:border-blue-600/40 hover:-translate-y-1 cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
};

// Card header component with modern gradient background option
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
  gradient?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  border = true,
  gradient = false,
}) => {
  return (
    <div
      className={clsx(
        "px-6 py-4 rounded-t-xl",
        border && "border-b border-gray-200/60 dark:border-gray-700/60",
        gradient &&
          "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750",
        className,
      )}
    >
      {children}
    </div>
  );
};

// Card content component with enhanced readability
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  padding = "md",
}) => {
  const paddingClass = {
    sm: "px-4 py-3",
    md: "px-6 py-4",
    lg: "px-8 py-6",
  }[padding];

  return (
    <div
      className={clsx(
        paddingClass,
        "text-gray-700 dark:text-gray-300",
        className,
      )}
    >
      {children}
    </div>
  );
};

// Card footer component with subtle styling
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
  padding?: "sm" | "md" | "lg";
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  border = true,
  padding = "md",
}) => {
  const paddingClass = {
    sm: "px-4 py-3",
    md: "px-6 py-4",
    lg: "px-8 py-6",
  }[padding];

  return (
    <div
      className={clsx(
        paddingClass,
        border && "border-t border-gray-200/60 dark:border-gray-700/60",
        "bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/50 rounded-b-xl",
        className,
      )}
    >
      {children}
    </div>
  );
};

// Enhanced StatCard with vibrant colors and smooth animations
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  className?: string;
  accentColor?: "blue" | "green" | "purple" | "orange" | "pink";
}> = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  className,
  accentColor = "blue",
}) => {
  const changeColors = {
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };

  const accentColors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600",
  };

  const iconBgColors = {
    blue: "bg-blue-50 dark:bg-blue-900/20",
    green: "bg-emerald-50 dark:bg-emerald-900/20",
    purple: "bg-purple-50 dark:bg-purple-900/20",
    orange: "bg-orange-50 dark:bg-orange-900/20",
    pink: "bg-pink-50 dark:bg-pink-900/20",
  };

  return (
    <Card
      className={clsx("p-6 overflow-hidden relative group", className)}
      hover
      variant="gradient"
    >
      {/* Decorative gradient accent */}
      <div
        className={clsx(
          "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
          accentColors[accentColor],
          "transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500",
        )}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {value}
          </p>
          {change && (
            <p
              className={clsx(
                "text-sm font-medium mt-2 flex items-center gap-1",
                changeColors[changeType],
              )}
            >
              {changeType === "positive" && "↗"}
              {changeType === "negative" && "↘"}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={clsx(
              "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
              iconBgColors[accentColor],
            )}
          >
            <div className="text-2xl">{icon}</div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Enhanced ActionCard with modern layout
export const ActionCard: React.FC<{
  title: string;
  description: string;
  action: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  featured?: boolean;
}> = ({ title, description, action, icon, className, featured = false }) => {
  return (
    <Card
      className={clsx(
        "p-6 group",
        featured && "ring-2 ring-blue-500/20 dark:ring-blue-400/20",
        className,
      )}
      hover
      variant={featured ? "elevated" : "default"}
    >
      <div className="flex items-start space-x-4">
        {icon && (
          <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
          <div className="mt-4">{action}</div>
        </div>
      </div>
    </Card>
  );
};

// NEW: InfoCard - Colorful informational cards
export const InfoCard: React.FC<{
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  icon?: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}> = ({
  title,
  message,
  type = "info",
  icon,
  className,
  dismissible = false,
  onDismiss,
}) => {
  const typeStyles = {
    info: {
      border: "border-blue-200 dark:border-blue-800",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-900 dark:text-blue-100",
      icon: "text-blue-600 dark:text-blue-400",
    },
    success: {
      border: "border-emerald-200 dark:border-emerald-800",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-900 dark:text-emerald-100",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      border: "border-amber-200 dark:border-amber-800",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-900 dark:text-amber-100",
      icon: "text-amber-600 dark:text-amber-400",
    },
    error: {
      border: "border-red-200 dark:border-red-800",
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-900 dark:text-red-100",
      icon: "text-red-600 dark:text-red-400",
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={clsx(
        "p-4 rounded-xl border-l-4 transition-all duration-300",
        styles.border,
        styles.bg,
        className,
      )}
    >
      <div className="flex items-start space-x-3">
        {icon && (
          <div className={clsx("flex-shrink-0 mt-0.5", styles.icon)}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className={clsx("font-semibold mb-1", styles.text)}>{title}</h4>
          <p className={clsx("text-sm", styles.text, "opacity-90")}>
            {message}
          </p>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className={clsx(
              "flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
              styles.text,
            )}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

// NEW: PricingCard - For pricing tables
export const PricingCard: React.FC<{
  title: string;
  price: string;
  period?: string;
  features: string[];
  action: React.ReactNode;
  popular?: boolean;
  className?: string;
}> = ({
  title,
  price,
  period = "/month",
  features,
  action,
  popular = false,
  className,
}) => {
  return (
    <Card
      className={clsx(
        "p-8 relative",
        popular &&
          "ring-2 ring-blue-500 dark:ring-blue-400 shadow-2xl scale-105",
        className,
      )}
      variant={popular ? "elevated" : "gradient"}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {price}
          </span>
          <span className="text-gray-600 dark:text-gray-400">{period}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-green-500 dark:text-green-400 flex-shrink-0 mt-1">
              ✓
            </span>
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">{action}</div>
    </Card>
  );
};