import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8081",
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? "tp-production",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "tpapp-frontend",
});

export default keycloak;