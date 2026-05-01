(function () {
  "use strict";

  var config = window.HACKNEY_ANALYTICS || {};
  var ga4Id = (config.ga4MeasurementId || "").trim();
  var isLocalhost = /^(localhost|127\.0\.0\.1|::1)$/.test(window.location.hostname);
  var hasGa4 = /^G-[A-Z0-9]+$/i.test(ga4Id) && ga4Id !== "G-XXXXXXXXXX" && (!isLocalhost || config.trackLocalhost === true);
  var debug = Boolean(config.debug) || /[?&]debug_tracking=1\b/.test(window.location.search) || isLocalhost;
  var sentOnce = {};

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  if (hasGa4) {
    var gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ga4Id);
    document.head.appendChild(gaScript);

    window.gtag("js", new Date());
    window.gtag("config", ga4Id, {
      send_page_view: true,
      anonymize_ip: true,
      transport_type: "beacon",
      cookie_flags: "SameSite=Lax;Secure"
    });
  }

  function clean(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100);
  }

  function pageType() {
    var path = window.location.pathname;
    if (path.indexOf("/service-areas/") === 0) return "service_area";
    if (path.indexOf("/blog/") === 0 || path === "/blog.html") return "blog";
    if (path.indexOf("roof-replacement") !== -1) return "roof_replacement";
    return "home";
  }

  function track(name, params, onceKey) {
    if (onceKey && sentOnce[onceKey]) return;
    if (onceKey) sentOnce[onceKey] = true;

    var payload = Object.assign({
      page_path: window.location.pathname,
      page_type: pageType()
    }, params || {});

    if (hasGa4) {
      window.gtag("event", name, payload);
    }

    if (debug) {
      console.info("[Hackney tracking]", name, payload);
    }
  }

  function classifyLink(link) {
    var href = link.getAttribute("href") || "";
    var text = clean(link.innerText || link.getAttribute("aria-label") || href);

    if (href.indexOf("tel:") === 0) {
      return { event: "click_to_call", params: { link_text: text, click_location: getLocation(link) } };
    }

    if (href.indexOf("mailto:") === 0) {
      return { event: "email_click", params: { link_text: text, click_location: getLocation(link) } };
    }

    if (href === "#quote" || href.indexOf("/#quote") !== -1 || href.indexOf("index.html#quote") !== -1) {
      return { event: "quote_click", params: { link_text: text, click_location: getLocation(link) } };
    }

    if (/google\.com|goo\.gl|facebook\.com|freshroof\.com/i.test(href)) {
      return {
        event: "outbound_click",
        params: {
          link_text: text,
          link_domain: safeDomain(href),
          click_location: getLocation(link)
        }
      };
    }

    return null;
  }

  function safeDomain(href) {
    try {
      return new URL(href, window.location.href).hostname.replace(/^www\./, "");
    } catch (error) {
      return "unknown";
    }
  }

  function getLocation(element) {
    if (element.closest(".safe-hero")) return "hero";
    if (element.closest(".sticky-call")) return "sticky_call_bar";
    if (element.closest(".site-header, header")) return "header";
    if (element.closest(".quote-section, #quote")) return "quote_section";
    if (element.closest(".footer, footer")) return "footer";
    if (element.closest("#gallery")) return "gallery";
    if (element.closest(".conversion-band")) return "conversion_band";
    return "body";
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a");
    if (link) {
      var clickEvent = classifyLink(link);
      if (clickEvent) track(clickEvent.event, clickEvent.params);
    }

    var galleryButton = event.target.closest && event.target.closest("[data-gallery-index]");
    if (galleryButton) {
      track("gallery_view", {
        gallery_index: galleryButton.getAttribute("data-gallery-index") || "",
        click_location: "gallery"
      });
    }
  }, true);

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form || !form.matches("form")) return;

    track("generate_lead", {
      lead_source: "website_quote_form",
      form_id: form.id || "quote_form",
      click_location: getLocation(form)
    });
  }, true);

  if ("IntersectionObserver" in window) {
    var quote = document.querySelector("#quote");
    if (quote) {
      var quoteObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            track("quote_form_view", { section: "quote" }, "quote_form_view");
            quoteObserver.disconnect();
          }
        });
      }, { threshold: 0.45 });
      quoteObserver.observe(quote);
    }
  }

  var scrollMarks = [50, 90];
  function checkScrollDepth() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;

    var depth = Math.round((window.scrollY / scrollable) * 100);
    scrollMarks.forEach(function (mark) {
      if (depth >= mark) {
        track("scroll_depth", { percent_scrolled: mark }, "scroll_depth_" + mark);
      }
    });
  }

  window.addEventListener("scroll", checkScrollDepth, { passive: true });
})();
