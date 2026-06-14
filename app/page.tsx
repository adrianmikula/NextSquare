import { Hero } from "@/components/hero"
import { MenuPreview } from "@/components/menu-preview"
import { SocialProof } from "@/components/social-proof"
import { HoursLocation } from "@/components/hours-location"
import { GoogleMaps } from "@/components/google-maps"
import { InstagramFeed } from "@/components/instagram-feed"

export default function Home() {
  return (
    <>
      <Hero />
      <MenuPreview />
      <SocialProof />
      <HoursLocation />
      <GoogleMaps />
      <InstagramFeed />
    </>
  )
}
