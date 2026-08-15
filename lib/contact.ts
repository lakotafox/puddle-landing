/**
 * Who a visitor reaches when they click "Get Started".
 *
 * There is no signup flow yet — the product is pre-launch — so every CTA on the
 * site opens a contact card pointing at Connor rather than a dead form.
 *
 * Email only, deliberately. A phone number was here briefly and was removed:
 * putting a personal mobile on a public marketing site means anyone crawling it
 * can call or text it, and it can't be un-published once scraped. If a phone
 * channel is wanted later, use a business line or a forwarding number.
 */
export const CONTACT = {
  name: "Connor",
  role: "Puddl3",
  email: "connor@puddl3.com",
} as const;
