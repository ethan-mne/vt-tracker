<div style="background-color:#f8d7da; color:#721c24; padding:12px; border-radius:6px; border:1px solid #f5c6cb; margin-bottom:16px;">
<strong>Bug corrigé :</strong> <em>"Failed to load contacts"</em>
</div>
- Créer un compte Supabase et configurer les clés d’accès dans un fichier `.env`.
- Créer la table `contacts` avec les colonnes nécessaires dans la base Supabase.
- Configurer les permissions pour autoriser l’accès aux données.
- Tester la connexion front-end / base de données pour valider le chargement des contacts.

<div style="background-color:#f8d7da; color:#721c24; padding:12px; border-radius:6px; border:1px solid #f5c6cb; margin-bottom:16px;">
<strong>Correction et amélioration des interfaces:</strong>
</div>
Dans le formulaire d’ajout de contact, séparer le champ "Name" en deux champs distincts : "First Name" et "Last Name".
<img src="img/lastname-firstname.png" alt="enregistrer cette information dans la base de données.">
Dans le header, remplacer le bouton "New Contact" par "Purchase Credits".
<img src="img/changethename.png" alt="'New Contact' par 'Purchase Credits'"/>
Lorsqu’un achat de crédits est effectué, enregistrer cette information dans la base de données.
<p style ="align=center">
  <img src="img/master.png" alt="enregistrer cette information dans la base de données.">
</p>

<div style="background-color:#f8d7da; color:#721c24; padding:12px; border-radius:6px; border:1px solid #f5c6cb; margin-bottom:16px;">
<strong>Troisième mission : Ajout de fonctionnalités</strong>
</div>

<div style="background-color:#d1ecf1; color:#0c5460; padding:12px; border-radius:6px; border:1px solid #bee5eb; margin-bottom:16px;">
<strong>Intégration de Stripe :</strong> <br>
Les paiements pour l’achat de crédits doivent passer par <a href="https://stripe.com/fr" target="_blank" style="color:#0c5460; text-decoration:underline;">Stripe</a>.
</div>

<img src="img/credit1.png" alt="Intégrer l’API Stripe">
<img src="img/c2.png" alt="Intégrer l’API Stripe">

<div style="background-color:#e2e3e5; color:#383d41; padding:12px; border-radius:6px; border:1px solid #d6d8db; margin-bottom:16px;">
<strong>Champs à ajouter :</strong>
<ul style="margin: 8px 0 0 20px;">
  <li><strong>E-mail</strong></li>
  <li><strong>Adresse</strong></li>
  <li><strong>Code postal</strong></li>
  <li><strong>Note</strong></li>
  <li><strong>Téléversement de documents</strong></li>
</ul>
</div>
<img src="img/ajou.png" alt="ajouter les champs">
