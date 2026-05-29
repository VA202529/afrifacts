# Google Apps Script Webshop API + externe frontends

Architectuur:

- `Code.gs` = alleen backend/API in Google Apps Script
- `Index.html` = lokale/externe klantwebsite
- `Admin.html` = lokale/externe admin- en medewerkerwebsite

De HTML-bestanden hoeven niet in Apps Script te draaien. Host ze lokaal, op je eigen domein, Netlify, Vercel, hostingpakket, enzovoort. Beide frontends praten met de Google Apps Script Web App URL via `fetch()`.

## Installatie backend

1. Open de Google Sheet die als database dient.
2. Ga naar `Extensies > Apps Script`.
3. Plaats alleen `Code.gs` in Apps Script.
4. Run eenmalig `setupDatabaseStructure`.
5. Deploy als Web App.
6. Kopieer de Web App URL.
7. De opgegeven Web App URL staat al hardcoded in `Index.html` en `Admin.html`.

Hardcoded API URL:

```text
https://script.google.com/macros/s/AKfycby4v4-8geXg2sRDQoiBonwivedBw3gWcGaqTyKE4YqnAK9AeBoRU8ul3aSi4o_dciskJw/exec
```

## Frontend

Open of host:

- `Index.html` voor klanten
- `Admin.html` voor owner/admin/medewerkers

Er is geen aparte medewerkerswebsite. Medewerkers loggen in op dezelfde `Admin.html`. Het dashboard toont menu's op basis van hun rol en permissions.

## Standaard admin account

Bij `setupDatabaseStructure()` wordt dit owner-account aangemaakt als het nog niet bestaat:

```text
E-mail: admin@webshop.local
Wachtwoord: Admin12345!
Rol: owner
```

Wijzig dit wachtwoord direct na de eerste login.

## Sheets

De backend maakt ontbrekende sheets en headers automatisch aan:

- `products`
- `orders`
- `order_items`
- `settings`
- `bedrijf`
- `email_log`
- `users`
- `password_reset_tokens`
- `sessions`
- `staff`
- `returns`
- `reviews`
- `audit_log`

`bedrijf` is voor zichtbare bedrijfsinformatie op de websites.

`settings` is voor technische backend/config, zoals Drive folder ids, frontend URLs en security/system settings.

## Bedrijfsgegevens

Endpoint:

```text
GET ?action=company
```

Geeft alle key/value-gegevens uit `bedrijf` terug als object. De frontends gebruiken dit voor:

- website titel
- logo
- bedrijfsnaam
- telefoonnummers
- e-mails
- adres
- openingstijden/social links
- footer tekst
- verzendinformatie
- retourbeleid/privacy/voorwaarden
- Van Appiah credit

Verplichte hardcoded credit:

- `credit_enabled = true`
- `credit_text = Powered and made by Van Appiah`
- `credit_url = https://vanappiah.com/`
- `credit_label = VA`

Deze credit is onderdeel van het systeem. De gebruiker kan hem niet uitzetten via het dashboard. `Code.gs`, `Index.html` en `Admin.html` gebruiken altijd een veilige fallback zodat de footer nooit crasht.

## Admin bedrijfsgegevens

In `Admin.html`:

```text
Instellingen -> Bedrijfsgegevens
```

Endpoints:

- `getCompanySettings`
- `updateCompanySettings`

Alleen `owner` en `admin` mogen bedrijfsgegevens aanpassen. De backend controleert dit ook, dus beveiliging zit niet alleen in de frontend.

## Rollen

- `owner`: alles
- `admin`: bijna alles
- `accountant`: omzet, orders, exports
- `product_manager`: producten en voorraad
- `order_manager`: orders en fulfillment
- `support`: klanten, orders en retouren

## Medewerkersflow

1. Owner/admin logt in.
2. Gaat naar `Medewerkers`.
3. Voegt medewerker toe met naam, e-mail en rol.
4. Backend schrijft naar `staff`.
5. Backend maakt een wachtwoord-reset-token.
6. Medewerker krijgt mail.
7. Medewerker stelt wachtwoord in.
8. Medewerker logt in op `Admin.html`.
9. Frontend vraagt permissions op.
10. Backend controleert bij elke adminactie opnieuw de permission.

## Admin wachtwoordherstel

`Admin.html` heeft een `Wachtwoord vergeten?` formulier.

Flow:

1. Medewerker vult e-mailadres in.
2. Backend toont altijd dezelfde veilige melding.
3. Als het e-mailadres bestaat, stuurt de backend een tijdelijke herstelcode.
4. De medewerker gebruikt die code als tijdelijk wachtwoord.
5. Na login kan de medewerker onder `Instellingen -> Wachtwoord wijzigen` een nieuw wachtwoord opslaan.

De herstelcode verloopt na de ingestelde resetperiode en wordt na gebruik ongeldig gemaakt.

## Beveiliging

- Geen plain text wachtwoorden.
- Wachtwoorden worden gehasht met salt.
- Login werkt met sessietokens.
- Admin endpoints vereisen medewerker-authenticatie.
- Elke adminactie controleert permissions in `Code.gs`.
- `password_hash` wordt nooit naar de frontend gestuurd.
- Orders en voorraadupdates gebruiken `LockService`.
- Belangrijke adminacties worden gelogd in `audit_log`.
- Verzonden mails worden gelogd in `email_log`.

## Prijsweergave

Prijzen worden standaard met twee decimalen getoond, bijvoorbeeld `EUR 19.95`. Dit is bewust, omdat webshopprijzen boekhoudkundig met centen worden opgeslagen. In de frontend gebeurt dit via `Number(value).toFixed(2)`.

Wil je Nederlandse komma-notatie, vervang de `money()` functie in `Index.html` en `Admin.html` door `Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })`.

## Google Drive afbeeldingen

`Index.html` bevat de opgegeven Google API key en probeert bij producten zonder `image_url` de eerste afbeelding uit `drive_folder_id` te laden via de Google Drive API.

Bij productmappen zet de backend de hoofdmap, productmap en gesynchroniseerde afbeeldingsbestanden automatisch op:

```text
Iedereen op internet met de link kan bekijken
```

Workflow:

1. Maak product aan in admin.
2. Open de Drive-map van het product.
3. Upload afbeeldingen.
4. Klik in admin bij het product op `Afbeeldingen syncen`.
5. De backend vult `product_images` en de klantwebsite toont de galerij.

De frontend probeert eerst `https://drive.google.com/uc?export=view&id=FILE_ID`. Als Drive die niet direct toont, valt hij terug op `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000`.

## Productdetail en galerij

De klantwebsite heeft een productdetailview. Klik op een productfoto of `Bekijken`.

Als een product meerdere afbeeldingen heeft, toont de detailpagina:

- grote hoofdafbeelding
- thumbnails
- aantal afbeeldingen
- prijs, voorraad, SKU/categorie en omschrijving

Directe productlink:

```text
Index.html?product_id=PROD-...
```

## Reviews

De webshop heeft een lichte reviewmodule.

Nieuwe sheet:

- `reviews`

Kolommen:

- `review_id`
- `created_at`
- `updated_at`
- `target_type`
- `target_id`
- `product_id`
- `product_name`
- `user_id`
- `name`
- `email`
- `rating`
- `title`
- `message`
- `status`
- `admin_notes`

Klanten kunnen reviews achterlaten voor:

- het bedrijf (`target_type = company`)
- een product (`target_type = product`)

Nieuwe publieke endpoints:

- `getReviews`
- `submitReview`

Nieuwe admin endpoints:

- `getReviewsAdmin`
- `updateReviewStatus`

Nieuwe admin-tab:

```text
Reviews
```

Reviews worden standaard opgeslagen als `pending`. Owner, admin en support kunnen reviews goedkeuren, afwijzen of archiveren. Alleen reviews met status `approved` worden publiek getoond op de klantwebsite.

## Kortingen

Ondersteund:

- productkorting per product: `discount_type` + `discount_value`
- kortingscodes via de `coupons` sheet
- kortingscode in checkout

Kortingstypes:

- `none`
- `percent`
- `fixed`

## Verkochte producten

Het oude administratiepaneel is verwijderd. Deze admin is geen boekhoudpakket meer.

De tab `Verkochte producten` toont alleen een licht webshopoverzicht:

- verkochte aantallen
- omzet per verkocht product
- inkoopwaarde per verkocht product
- brutowinst per verkocht product
- margepercentage
- huidige voorraad en productstatus

Er is een periodefilter voor vandaag, week, maand, kwartaal, jaar, alles of eigen periode. De data wordt apart geladen en gecachet, zodat het dashboard sneller opent.

CSV export:

- `verkochte-producten.csv`

Producten ondersteunen:

- `cost_price`
- `sell_price`
- `margin_percentage`
- `vat_enabled`
- `vat_percentage`
- `price_ex_vat`
- `price_inc_vat`
- `shipping_class`
- `status`: `draft`, `active`, `low_stock`, `out_of_stock`, `archived`

## Order history en mail history

Elke belangrijke orderactie wordt gelogd in `order_history`.

Admin orderdetail toont:

- klantgegevens
- totalen
- BTW
- betaallink
- track & trace
- mail history
- tijdlijn/history

Als vandaag al een mailtype is verstuurd, toont de orderdetail een waarschuwing.

## Mailtemplates

Ordermails gebruiken HTML-templates met dynamische velden uit `orders`, `order_items` en `bedrijf`.

Ondersteunde velden in de backend-templatefunctie:

- `{{company_name}}`
- `{{website_name}}`
- `{{company_email}}`
- `{{company_phone}}`
- `{{company_address}}`
- `{{kvk_number}}`
- `{{btw_number}}`
- `{{order_id}}`
- `{{customer_name}}`
- `{{payment_status}}`
- `{{fulfillment_status}}`
- `{{subtotal}}`
- `{{shipping_cost}}`
- `{{vat_amount}}`
- `{{total_price}}`
- `{{payment_link}}`
- `{{track_trace}}`

De templatefooter bevat automatisch bedrijfsnaam, adres, e-mail, telefoon, KvK, BTW en de verplichte Van Appiah-credit.

## Archief

Producten, afgeronde orders en oude retouren worden niet verwijderd. Gebruik status `archived`, zodat oude gegevens beschikbaar blijven voor administratie en controle.

## Admin handleiding

In `Admin.html` staat onder:

```text
Instellingen -> Handleiding
```

een korte gebruikershandleiding voor orders, mails, producten, Drive-afbeeldingen, administratie en archief.

## API response format

Succes:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Fout:

```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Error message",
    "code": 400
  }
}
```

## Google Drive productmappen

Bij `createProduct`:

1. Backend genereert `product_id`.
2. Backend controleert `settings.drive_products_root_folder_id`.
3. Als de hoofdmap ontbreekt, wordt die aangemaakt.
4. Productsubmap wordt aangemaakt als `[productnaam] - [product_id]`.
5. Folder ID en URL worden opgeslagen in `products`.

## Frontend URLs voor resetlinks

Zet in `settings`:

- `customer_frontend_url`
- `admin_frontend_url`

Deze worden gebruikt in wachtwoord-resetmails. Als ze leeg zijn gebruikt de backend de Apps Script Web App URL als fallback.
