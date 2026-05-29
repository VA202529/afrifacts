# Afrifacts Code.gs backend

Deze backend draait in Google Apps Script en gebruikt Google Sheets als database en Google Drive als productafbeeldingen-opslag.

## Installatie

1. Open de Google Sheet die de database wordt.
2. Ga naar `Extensies > Apps Script`.
3. Plak de volledige inhoud van `Code.gs`.
4. Run eenmalig `setupDatabaseStructure`.
5. Run daarna `installAutomationTriggers_` of klik in `admin.html` op `10-min triggers`.
6. Deploy via `Implementeren > Nieuwe implementatie > Web-app`.
7. Zet toegang op `Iedereen` of `Iedereen met de link`, afhankelijk van je accountbeleid.
8. Kopieer de Web App URL naar de frontend/admin.

## Verplichte sheets

`setupDatabaseStructure` maakt ontbrekende sheets en kolommen automatisch aan:

- `products`
- `product_images`
- `orders`
- `order_items`
- `coupons`
- `settings`
- `bedrijf`
- `users`
- `staff`
- `sessions`
- `password_reset_tokens`
- `returns`
- `reviews`
- `email_log`
- `order_history`
- `audit_log`

## Productkolommen

Belangrijkste kolommen in `products`:

- `product_id`: uniek product-ID.
- `id`: zelfde waarde als `product_id` voor legacy compatibiliteit.
- `name`: productnaam.
- `description`: publieke omschrijving.
- `price`, `sell_price`, `price_inc_vat`: verkoopprijs.
- `cost_price`: inkoopprijs.
- `stock`: voorraad.
- `active`: `true` of `false`.
- `status`: `active`, `draft`, `out_of_stock` of `archived`.
- `image_url`: hoofdafbeelding of Drive-link.
- `sku`: SKU.
- `category`: categorie.
- `drive_folder_id`: Drive-map voor productafbeeldingen.
- `drive_folder_url`: link naar de Drive-map.

Publieke webshop toont alleen producten met `active = true` en `status` niet `draft` of `archived`.

## Afbeeldingen

Afbeeldingen staan in `product_images`.

Kolommen:

- `image_id`
- `product_id`
- `drive_file_id`
- `image_url`
- `sort_order`
- `created_at`

Werking:

- De eerste afbeelding wordt gebruikt op productcards.
- Alle afbeeldingen worden getoond op de productdetailpagina.
- Drive-bestanden worden automatisch publiek gezet met `Anyone with link: view`.
- Drive-links worden geconverteerd naar snelle thumbnail-URLs zoals `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000`.

## Meerdere afbeeldingen toevoegen

Optie 1:

1. Open de Drive-map van het product in admin.
2. Upload meerdere afbeeldingen.
3. Klik `Afbeeldingen syncen`.

Optie 2:

1. Plak extra Drive-links of image URLs in het veld `Extra afbeeldingen`.
2. Klik `Opslaan`.

## Archiveren

Archiveren zet:

- `active = false`
- `status = archived`

Een gearchiveerd product komt daardoor niet terug in `getProducts`, `getProductsPage` of `getProductDetails`.

Herstellen zet:

- `active = true`
- `status = active`

## Drive-sync

Handmatig:

- Per product: `syncProductImages`
- Alle producten: `syncAllProductImages`

Automatisch:

- `autoSyncDriveImages` draait elke 10 minuten na installatie van triggers.
- Nieuwe afbeeldingen in productmappen worden gekoppeld in `product_images`.
- Bestanden en mappen worden publiek leesbaar gezet.

## Systeemcheck

`systemHealthCheck` draait elke 10 minuten en controleert:

- Google Sheet sheets en kolommen.
- Drive hoofdmap.
- Productdata.
- Archive-status.
- Publieke productafbeeldingen.
- Ongeldige of lege afbeelding URLs.

Bij fouten mailt de backend naar `settings.admin_email`. Zet die dus naar een echt beheerderadres.

## Broken images oplossen

1. Controleer of `drive_file_id` klopt.
2. Run `syncAllProductImages`.
3. Controleer of de afbeelding in Google Drive geen Google Docs-bestand is maar een echte image mime type (`image/jpeg`, `image/png`, `image/webp`).
4. Controleer of de Drive-map niet verwijderd is.
5. Controleer of de publieke URL een `thumbnail?id=...` URL is.
6. Run `runSystemCheck` in admin.

## Snelheid

De publieke productroutes gebruiken `CacheService`:

- `getProducts`: cached publieke productlijst.
- `getProductsPage`: snelle paginadata.
- Cache wordt gewist bij product- en afbeeldingwijzigingen.

Houd productafbeeldingen onder ongeveer 2000px breed voor snelle laadtijden. De website gebruikt Drive thumbnails, maar kleinere bronbestanden blijven sneller.

## Opnieuw deployen

Na wijzigingen in `Code.gs`:

1. Plak de nieuwe code in Apps Script.
2. Klik opslaan.
3. Run `setupDatabaseStructure`.
4. Run of installeer triggers opnieuw via admin.
5. Ga naar `Implementeren > Implementaties beheren`.
6. Kies de web-app deployment.
7. Klik `Bewerken` en selecteer nieuwe versie.
8. Deploy.
