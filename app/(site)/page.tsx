import { getAllAuthorsWithStats, getFeaturedPosts } from "@/lib/application/blog-use-cases"
import {
  LandingHero,
  LandingFeatures,
  FeaturedPostsSection,
  AuthorShowcaseSection,
  LandingCtaBanner,
} from "@/components/site/landing"

export default async function LandingPage() {
  const [featuredPosts, authors] = await Promise.all([
    getFeaturedPosts(3),
    getAllAuthorsWithStats(),
  ])
  return (
    <>
      <LandingHero featuredPost={featuredPosts[0]} topAuthors={authors.slice(0, 4)} />
      <LandingFeatures />
      <FeaturedPostsSection posts={featuredPosts} />
      <AuthorShowcaseSection authors={authors} />
      <LandingCtaBanner />
    </>
  )
}
