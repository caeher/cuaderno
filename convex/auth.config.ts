import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Dominio Issuer JWT de Clerk (Frontend API URL). Configurar en Convex:
      // npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<instancia>.clerk.accounts.dev
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
