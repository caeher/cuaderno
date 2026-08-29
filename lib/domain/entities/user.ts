export interface SocialLinks {
  website?: string
  twitter?: string
  github?: string
  linkedin?: string
  instagram?: string
}

export interface TenantLegalSettings {
  companyName?: string
  contactEmail?: string
  taxId?: string
  address?: string
  jurisdiction?: string
  customPrivacyPolicy?: string
  customTerms?: string
  customCookiePolicy?: string
  customLegalNotice?: string
  dpoContact?: string
}

export interface TenantSeoSettings {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  geoCountry?: string
  geoRegion?: string
  geoCity?: string
  geoCoordinates?: string
  allowAiCrawlers?: boolean
  enableLlmsTxt?: boolean
  socialSharingImage?: string
  canonicalDomain?: string
}

export interface User {
  id: string
  username: string
  name: string
  email: string
  avatarUrl: string
  coverUrl: string
  bio: string
  tagline: string
  location?: string
  socials: SocialLinks
  role: "owner" | "admin"
  joinedAt: string
  postCount: number
  followerCount: number
  timezone?: string
  subdomainEnabled?: boolean
  customDomain?: string
  legalSettings?: TenantLegalSettings
  seoSettings?: TenantSeoSettings
}

export interface AuthorWithStats extends User {
  totalViews: number
  totalLikes: number
}

export interface UpdateUserInput {
  username?: string
  name?: string
  email?: string
  avatarUrl?: string
  coverUrl?: string
  bio?: string
  tagline?: string
  location?: string
  socials?: SocialLinks
  timezone?: string
  subdomainEnabled?: boolean
  customDomain?: string
  legalSettings?: TenantLegalSettings
  seoSettings?: TenantSeoSettings
}
