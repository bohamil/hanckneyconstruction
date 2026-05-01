# Hackney Roofing Analytics Setup

The site is wired for Google Analytics 4 with measurement ID `G-RQ53KXQW7X`.

## Activate tracking

1. Create or open the GA4 property for `hackney-construction.com`.
2. Create a Web data stream for `https://hackney-construction.com/`.
3. Confirm the Measurement ID is still `G-RQ53KXQW7X`.
4. If the property changes, replace the ID in `assets/analytics-config.js`:

```js
window.HACKNEY_ANALYTICS = {
  ga4MeasurementId: "G-RQ53KXQW7X",
  debug: false,
  trackLocalhost: false
};
```

## Funnel events

The tracker does not send form field values or personal details. It only sends page context and interaction labels.

- `page_view`: handled by GA4 after the real measurement ID is active.
- `quote_click`: visitor clicked a free estimate / quote CTA.
- `quote_form_view`: visitor reached the quote form section.
- `generate_lead`: visitor submitted the quote form.
- `click_to_call`: visitor clicked a phone link.
- `email_click`: visitor clicked an email link.
- `outbound_click`: visitor clicked Google reviews, Facebook, or Fresh Roof.
- `gallery_view`: visitor interacted with project photos.
- `scroll_depth`: visitor reached 50% or 90% page depth.

## Recommended reporting

- Mark `generate_lead` as a key event in GA4.
- Consider marking `click_to_call` as a key event too, since roofing leads often call instead of submitting forms.
- Use GA4 city/region reports to evaluate South Central Iowa traffic.
- Use Search Console to review impressions, clicks, CTR, and queries by page.

## Next level

- Add Search Console domain verification.
- Add call tracking if the client wants to know which visits turn into real phone calls.
- Connect GA4 to Google Ads before running paid local campaigns.
- Add UTM-tagged links from Facebook, Google Business Profile posts, and QR codes.
