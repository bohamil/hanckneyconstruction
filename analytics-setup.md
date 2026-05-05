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

## Quick analytics check

Use this when you want to confirm the site is recording traffic before the weekly automation has live GA4/Search Console access.

1. Open `https://hackney-construction.com/?debug_tracking=1`.
2. Open the browser developer console.
3. Click a phone link, quote button, gallery image, and the quote form section.
4. Confirm console messages appear for `click_to_call`, `quote_click`, `gallery_view`, and `quote_form_view`.
5. In GA4, open Reports > Realtime and confirm the active page and events show up for the visit.
6. In GA4, open Admin > Data display > Events and confirm the custom events are appearing after Google has processed data.

## Weekly IA/MO report checklist

Until an email connector or live GA4/Search Console API access is connected to the automation, this is the fastest manual way to pull the weekly report.

1. In GA4, set the date range to the last 7 days and compare against the previous 7 days.
2. Add a region filter for `Iowa` and `Missouri`.
3. Capture users, sessions, views, engagement rate, and conversions/key events.
4. Break down traffic by city and source / medium.
5. Review landing pages for the same Iowa/Missouri filter.
6. Review event counts for `quote_click`, `click_to_call`, `quote_form_view`, and `generate_lead`.
7. In Search Console, set the date range to the last 7 days and compare against the previous 7 days.
8. Filter pages to `hackney-construction.com` pages that serve roofing, roof replacement, radon mitigation, and service-area intent.
9. Capture clicks, impressions, CTR, average position, top queries, and top pages.
10. Send the numbers plus observations into the automation thread if live access is not yet connected.

## Export needed for automated reporting

If live access is not available, export these GA4 and Search Console tables as CSV files and place them in the project folder before the weekly automation runs.

- GA4 traffic by state / city: date, country, region, city, users, sessions, views, engagement rate.
- GA4 traffic source: date, region, city, session source / medium, users, sessions, views.
- GA4 landing pages: date, region, city, landing page, users, sessions, views, engagement rate.
- GA4 events: date, region, city, event name, event count, total users.
- Search Console pages: date, page, query, country, clicks, impressions, CTR, average position.

For the report, include only users located in Iowa or Missouri. The weekly summary should cover users, sessions, page views, top cities, traffic sources, landing pages, quote clicks, call clicks, quote form views, generated leads, week-over-week changes, what looks promising, what looks weak, and the next 3 actions to increase local roofing leads.

## Next level

- Add Search Console domain verification.
- Add call tracking if the client wants to know which visits turn into real phone calls.
- Connect GA4 to Google Ads before running paid local campaigns.
- Add UTM-tagged links from Facebook, Google Business Profile posts, and QR codes.
