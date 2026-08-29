import { getAllAuthorsWithStats, getFeaturedPosts } from "@/lib/application/blog-use-cases"
import { userRepository } from "@/lib/infrastructure/repositories"
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
  const authorMap = new Map((await userRepository.findAll()).map((u) => [u.id, u]))

  return (
    <>
      <LandingHero featuredPost={featuredPosts[0]} topAuthors={authors.slice(0, 4)} />
      <LandingFeatures />
      <FeaturedPostsSection posts={featuredPosts} authorMap={authorMap} />
      <AuthorShowcaseSection authors={authors} />
      <LandingCtaBanner />
    </>
  )
}
