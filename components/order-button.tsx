import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function OrderButton() {
  const url = process.env.NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL

  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ size: "lg" }), "no-underline")}
    >
      Order Now
    </a>
  )
}
