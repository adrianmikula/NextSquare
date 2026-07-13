interface DashboardHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function DashboardHeader({
  title,
  description,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between border-card px-8 py-4" style={{ borderBottomWidth: "var(--theme-border-width)" }}>
      <div>
        <h1 className="text-xl font-semibold text-heading">{title}</h1>
        {description && (
          <p className="text-sm text-muted">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}
