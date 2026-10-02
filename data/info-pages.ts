// Content for the footer pages (About, Contact, policies).
//
// ⚠️ DRAFTS FOR THE CLIENT TO REVIEW. The matching Shopify pages exist but are empty, so the
// site shows these instead. As soon as a page has its own text in Shopify (Online Store →
// Pages), the site shows that and ignores the draft here. Points the client must confirm
// are listed in REVIEW_NOTES at the bottom of this file.

export const STORE = {
  name: "Tomboy India",
  email: "hellotomboyindia@gmail.com",
  phone: "+91 70137 43432",
  phoneHref: "tel:+917013743432",
  address: [
    "Tomboy India (Playboy Factory & Store)",
    "D. No. 16-24-9/1, Chennai–Kolkata National Highway",
    "Opp. Devi Sea Foods, Peravali",
    "Tanuku, Andhra Pradesh 534211, India",
  ],
  freeShippingOver: 899,
  exchangeDays: 7,
};

export type InfoSection = { heading?: string; paragraphs?: string[]; list?: string[] };
export type InfoPage = { title: string; eyebrow: string; lead: string; updated?: string; sections: InfoSection[]; contactCard?: boolean };

const UPDATED = "October 2026";

export const INFO_PAGES: Record<string, InfoPage> = {
  "about-us": {
    title: "About Tomboy",
    eyebrow: "Our story",
    lead: "Everyday essentials that feel as good at midnight as they did in the morning.",
    sections: [
      {
        paragraphs: [
          "Tomboy started with a simple idea: the clothes you wear closest to your skin should be the most comfortable things you own. No itchy tags, no waistbands that dig in, no fabric that feels tired after a few washes.",
          "So we make innerwear, tees, bottoms and socks for men, women and kids from soft, breathable cotton, cut for real bodies and real days: work, school, the gym, the sofa, and everything in between.",
        ],
      },
      {
        heading: "What we care about",
        list: [
          "Soft, breathable cotton that stays comfortable all day",
          "Anti-pinch waistbands that sit flat and don't dig in",
          "Tag-free, smooth finishes that are gentle on sensitive skin",
          "Colours and fits that hold up wash after wash",
          "Honest prices, with free shipping across India on orders over ₹899",
        ],
      },
      {
        heading: "Made in India",
        paragraphs: [
          "Tomboy is designed and made in Tanuku, Andhra Pradesh, and shipped from there to every corner of India.",
        ],
      },
    ],
  },

  contact: {
    title: "Contact us",
    eyebrow: "We're here to help",
    lead: "Questions about sizing, an order, or an exchange? Reach us any way that suits you.",
    contactCard: true,
    sections: [
      {
        heading: "Before you write",
        list: [
          "For sizing help, ask Scout (the red button at the top of any page) or use Find my size on a product page.",
          "For an order, keep your order number handy (it's in your confirmation email) so we can help faster.",
          `Exchanges and returns: see our Refunds & Returns policy. You have ${STORE.exchangeDays} days from delivery.`,
        ],
      },
    ],
  },

  "contact-us-policy": {
    title: "Contact us",
    eyebrow: "We're here to help",
    lead: "Questions about sizing, an order, or an exchange? Reach us any way that suits you.",
    contactCard: true,
    sections: [],
  },

  "shipping-policy": {
    title: "Shipping policy",
    eyebrow: "Support & policies",
    lead: `Free shipping across India on orders over ₹${STORE.freeShippingOver}. Here's how delivery works.`,
    updated: UPDATED,
    sections: [
      {
        heading: "Where we ship",
        paragraphs: ["We currently ship to addresses across India. International shipping isn't available yet."],
      },
      {
        heading: "Shipping charges",
        list: [
          `Orders over ₹${STORE.freeShippingOver}: free standard shipping.`,
          "Orders below that: a standard shipping charge, shown at checkout before you pay.",
        ],
      },
      {
        heading: "Processing and delivery times",
        list: [
          "Orders are usually packed and dispatched within 1–2 working days.",
          "Delivery typically takes 3–7 working days after dispatch, depending on your location. Remote areas may take a little longer.",
          "You'll get an email with tracking details as soon as your order ships.",
        ],
      },
      {
        heading: "Cash on Delivery",
        paragraphs: [
          "Cash on Delivery is available on eligible orders. Please keep the exact amount ready; our delivery partner collects it when your order arrives.",
        ],
      },
      {
        heading: "Something wrong with your delivery?",
        paragraphs: [
          `If your order is delayed, arrives damaged, or something is missing, contact us at ${STORE.email} within 48 hours of delivery with your order number and a photo, and we'll make it right.`,
        ],
      },
    ],
  },

  "refunds-returns-policy": {
    title: "Refunds & returns",
    eyebrow: "Support & policies",
    lead: `Easy ${STORE.exchangeDays}-day exchanges and returns. If the size isn't right, swapping is simple.`,
    updated: UPDATED,
    sections: [
      {
        heading: `${STORE.exchangeDays}-day window`,
        paragraphs: [
          `You can request an exchange or return within ${STORE.exchangeDays} days of delivery.`,
        ],
      },
      {
        heading: "What can be exchanged or returned",
        list: [
          "Items must be unused, unwashed, and in their original packaging with tags attached.",
          "For hygiene reasons, innerwear (briefs, trunks, boxers, panties, bras and vests) can be exchanged or returned only if the packaging is unopened and sealed.",
          "Items that arrive damaged or wrong can always be returned, whatever they are.",
        ],
      },
      {
        heading: "How to request an exchange or return",
        list: [
          `Email ${STORE.email} or call ${STORE.phone} with your order number, the item, and whether you'd like a different size or a refund.`,
          "We'll confirm and arrange a pickup, or share the return address.",
          "Once we receive and check the item, we'll ship your exchange or process your refund.",
        ],
      },
      {
        heading: "Refunds",
        list: [
          "Prepaid orders (UPI, card, net banking): refunded to the original payment method within 5–7 working days of approval.",
          "Cash on Delivery orders: refunded to your bank account or UPI ID, which we'll ask you for.",
          "Shipping charges are refunded only if the item arrived damaged or wrong.",
        ],
      },
      {
        heading: "Exchanges",
        paragraphs: ["Size exchanges are free, subject to stock. If your size is out of stock, we'll offer another colour or a refund."],
      },
    ],
  },

  "privacy-policy": {
    title: "Privacy policy",
    eyebrow: "Support & policies",
    lead: "What we collect, why, and the choices you have. In plain words.",
    updated: UPDATED,
    sections: [
      {
        heading: "What we collect",
        list: [
          "When you order: your name, email, phone number, delivery address and order details. Checkout and payments are handled securely by Shopify and our payment partners; we never see or store your full card details.",
          "When you browse: your cart, recently viewed products and saved sizes are kept in your own browser (local storage) so the site remembers them. They stay on your device.",
          "When you contact us: whatever you share in your message.",
        ],
      },
      {
        heading: "How we use it",
        list: [
          "To process, ship and support your orders",
          "To answer your questions and handle exchanges and returns",
          "To improve the store and fix problems",
          "To send offers, only if you've opted in. You can unsubscribe any time.",
        ],
      },
      {
        heading: "Scout, AI try-on and the Fit Finder",
        paragraphs: [
          "Our AI features use Google's Gemini. Photos you upload for try-on or the Fit Finder are used once and never stored. Read the full details on our Scout, Try-on & your data page (/privacy/ai).",
        ],
      },
      {
        heading: "Who we share it with",
        paragraphs: [
          "Only the service providers needed to run the store: Shopify (store and checkout), payment providers, delivery partners, and Google (for the AI features). We don't sell your personal information.",
        ],
      },
      {
        heading: "Your choices",
        list: [
          `Ask us for a copy of your data, or to correct or delete it, by writing to ${STORE.email}.`,
          "Clear your saved sizes, chats and recently viewed products from Scout's menu, or by clearing your browser's site data.",
          "Unsubscribe from marketing emails using the link in any email.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [`Questions about privacy? Email ${STORE.email}.`],
      },
    ],
  },

  "terms-conditions": {
    title: "Terms & conditions",
    eyebrow: "Support & policies",
    lead: "The basics of shopping with Tomboy India.",
    updated: UPDATED,
    sections: [
      {
        heading: "About these terms",
        paragraphs: [
          `This website is run by ${STORE.name}. By browsing or placing an order, you agree to these terms. We may update them from time to time; the version on this page applies to your order.`,
        ],
      },
      {
        heading: "Products and prices",
        list: [
          "We do our best to show colours and details accurately, but screens vary and slight differences can happen.",
          "Prices are in Indian Rupees (₹). Any taxes or shipping charges are shown at checkout before you pay.",
          "Size charts and AI size suggestions are a guide; please check measurements before ordering.",
          "If a product is listed at a wrong price by mistake, we may cancel the order and refund you in full.",
        ],
      },
      {
        heading: "Orders and payment",
        list: [
          "Your order is confirmed when you receive our confirmation email.",
          "We may cancel an order if an item is out of stock, the address can't be serviced, or we suspect misuse. If you've paid, you'll get a full refund.",
          "Payments are processed securely by our payment partners. Cash on Delivery is available on eligible orders.",
        ],
      },
      {
        heading: "Shipping, exchanges and returns",
        paragraphs: ["See our Shipping Policy and Refunds & Returns policy, which form part of these terms."],
      },
      {
        heading: "Using the website",
        list: [
          "Please don't misuse the site, try to break it, or copy its content, photos or designs without permission.",
          "Scout, our AI assistant, can make mistakes. Check important details (like price, size and stock) on the product page.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: ["These terms are governed by the laws of India, and disputes are subject to the courts of Andhra Pradesh."],
      },
      {
        heading: "Contact",
        paragraphs: [`${STORE.name} · ${STORE.email} · ${STORE.phone}`],
      },
    ],
  },
};

// What the client must confirm before these drafts go live (not shown on the site)
export const REVIEW_NOTES = [
  "Shipping: Shopify currently charges ₹0 on every order, but the site and this policy say free over ₹899. Pick one and set the Shopify rate to match.",
  "Shipping: dispatch (1–2 days) and delivery (3–7 days) times are typical estimates; confirm real ones.",
  "Returns: confirm the innerwear hygiene rule (sealed packs only), refund timelines and who pays return shipping.",
  "Terms: confirm the governing courts (Andhra Pradesh) and legal entity name.",
  "Privacy: confirm marketing email/SMS practices and any other tools they use (analytics, ads pixels).",
  "Contact: confirm the email/phone are the ones customers should use, and add business hours if any.",
];
