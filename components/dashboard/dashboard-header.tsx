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
    <div className="flex items-center justify-between border-b border-stone-200 px-8 py-4">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
        {description && (
          <p className="text-sm text-stone-500">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}
