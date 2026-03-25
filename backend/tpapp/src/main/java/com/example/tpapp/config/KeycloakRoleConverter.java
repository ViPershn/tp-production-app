package com.example.tpapp.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Set<String> roles = new HashSet<>();

        extractRoles(jwt.getClaim("realm_access"), roles);

        Object resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess instanceof Map<?, ?> resourceAccessMap) {
            resourceAccessMap.values().forEach(value -> extractRoles(value, roles));
        }

        return roles.stream()
                .map(this::normalizeRole)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
    }

    private void extractRoles(Object source, Set<String> roles) {
        if (!(source instanceof Map<?, ?> accessMap)) {
            return;
        }

        Object rolesObject = accessMap.get("roles");
        if (!(rolesObject instanceof Collection<?> roleCollection)) {
            return;
        }

        for (Object role : roleCollection) {
            if (role instanceof String roleName && !roleName.isBlank()) {
                roles.add(roleName.trim());
            }
        }
    }

    private String normalizeRole(String role) {
        return role.startsWith("ROLE_") ? role : "ROLE_" + role;
    }
}