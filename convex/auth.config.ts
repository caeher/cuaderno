export default {
  providers: [
    {
      // El dominio del Issuer de JWT de Clerk configurado en el Dashboard de Clerk (JWT Template: "convex")
      // Configurar en Convex con: npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-instance>.clerk.accounts.dev
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "",
      applicationID: "convex",
    },
  ],
};
