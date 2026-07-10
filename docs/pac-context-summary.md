# PAC Context Summary

Source: `source-materials/portail-academique-screen-map.md`.

Ce document resume le texte colle fourni avec la demande. Il est conserve pour contexte, mais il ne fait pas partie du perimetre obligatoire de l'agregateur de news sauf demande explicite.

## Modele mental PAC

- Le Portail Academique est organise en trois zones techniques Next.js:
  - `portal`: connexion, login, aiguillage.
  - `front-office`: espace intervenant, route `/faculty`.
  - `back-office`: espace gestionnaire et administration, route `/backoffice`.
- Les modules fonctionnels peuvent avoir deux faces: intervenant et gestionnaire.
- Le moissonneur est un service backend, pas un ecran. Il alimente Oracle PAC depuis Banner, Ammon, LDAP, SIRH et RHUM.
- La messagerie est un module utilisateur cote intervenant et gestionnaire.

## Sequence de livraison

- L1: portail, socle, messagerie, dashboards et syllabus, mise en service avril 2027.
- L2: grilles horaires, mise en service avril 2027.
- L3: notation, assiduite, seances, emploi du temps, actualites et ressources, mise en service avril 2027.
- L4: dossier administratif et transfert SIRH, mise en service juin 2027.
- L5: administration avancee, mise en service ete 2027.

Point important: le dossier administratif a ete specifie tot, mais son usage reel commence plus tard. Sa mise en service est donc decalee au livrable L4.

## Ecrans principaux

### Portal

- Connexion CAS et LDAP.
- Activation et reinitialisation des comptes locaux.
- Aiguilleur et choix de profil.
- Mon compte, notifications, pages legales et accessibilite.

### Front-office intervenant

- Accueil et tableau de bord.
- Syllabus.
- Messagerie.
- Grilles horaires.
- Notation et assiduite.
- Dossier administratif.

### Back-office gestionnaire

- Accueil et tableau de bord.
- Syllabus DFI.
- Messagerie.
- Administration socle.
- Grilles horaires.
- Notation et assiduite.
- Dossier administratif.
- Administration avancee.

## Couche technique

- Moissonneur en mode delta.
- Socle identite CAS SAML et matrice des droits.
- API PAC et exports.
- Transfert SIRH par SFTP.
- Integrations Alma, Primo, Planning et Banner SSASECT.

## Usage dans cette etude de cas

Par defaut, ne pas melanger ce contexte PAC avec l'agregateur de news. Il peut servir uniquement si l'utilisateur demande:

- une comparaison d'architecture;
- une adaptation du challenge a un portail metier;
- une verification d'approche multi-zone ou multi-role;
- une documentation separee sur PAC.
