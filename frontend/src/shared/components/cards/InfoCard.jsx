const getRiskStyles = (score) => {
  if (score >= 81) {
    return {
      dot: "bg-red-400",
      text: "text-red-400",
      bar: "bg-red-400",
      glow: "shadow-red-500/10",
    };
  }

  if (score >= 61) {
    return {
      dot: "bg-orange-400",
      text: "text-orange-400",
      bar: "bg-orange-400",
      glow: "shadow-orange-500/10",
    };
  }

  if (score >= 31) {
    return {
      dot: "bg-yellow-400",
      text: "text-yellow-400",
      bar: "bg-yellow-400",
      glow: "shadow-yellow-500/10",
    };
  }

  return {
    dot: "bg-green-400",
    text: "text-green-400",
    bar: "bg-green-400",
    glow: "shadow-green-500/10",
  };
};

export default function InfoCard({
  title,
  value,
  suffix = "",
  color = "text-white",
  subtitle,
  icon: Icon,
  progress = null,
  riskLevel = null,
}) {
  const riskStyles =
    typeof progress === "number"
      ? getRiskStyles(progress)
      : null;

  return (
    <div
      className={`
        group relative
        overflow-hidden
        rounded-2xl
        border border-slate-800
        bg-slate-900/80
        backdrop-blur-sm
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-slate-700
        hover:shadow-xl
        ${riskStyles?.glow || ""}
      `}
    >
      {/* Background glow */}

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/5 blur-3xl transition-all duration-500 group-hover:bg-cyan-500/10" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">

          {/* LEFT CONTENT */}

          <div className="min-w-0 flex-1">

            {/* TITLE */}

            <div className="flex items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {title}
              </p>

              {riskLevel && riskStyles && (
                <span
                  className={`
                    h-1.5
                    w-1.5
                    rounded-full
                    ${riskStyles.dot}
                    animate-pulse
                  `}
                />
              )}
            </div>

            {/* VALUE */}

            <div className="mt-3 flex items-baseline gap-1">

              <h2
                className={`
                  text-3xl
                  font-bold
                  tracking-tight
                  ${color}
                `}
              >
                {value}
              </h2>

              {suffix && (
                <span className="text-sm font-medium text-slate-500">
                  {suffix}
                </span>
              )}

            </div>

            {/* RISK LEVEL */}

            {riskLevel && riskStyles && (
              <div className="mt-2 flex items-center gap-2">

                <span
                  className={`
                    text-sm
                    font-semibold
                    ${riskStyles.text}
                  `}
                >
                  {riskLevel} Risk
                </span>

              </div>
            )}

            {/* SUBTITLE */}

            {subtitle && (
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {subtitle}
              </p>
            )}

            {/* RISK PROGRESS */}

            {typeof progress === "number" && riskStyles && (
              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-[11px] uppercase tracking-wide text-slate-600">
                    Risk Level
                  </span>

                  <span
                    className={`
                      text-xs
                      font-semibold
                      ${riskStyles.text}
                    `}
                  >
                    {Math.min(Math.max(progress, 0), 100)}%
                  </span>

                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">

                  <div
                    className={`
                      h-full
                      rounded-full
                      transition-all
                      duration-1000
                      ease-out
                      ${riskStyles.bar}
                    `}
                    style={{
                      width: `${Math.min(
                        Math.max(progress, 0),
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>
            )}

          </div>

          {/* ICON */}

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-800
              bg-slate-800/70
              transition-all
              duration-300
              group-hover:border-slate-700
              group-hover:bg-slate-800
            "
          >
            {Icon && (
              <Icon
                size={22}
                strokeWidth={1.8}
                className={color}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}