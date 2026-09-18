import { EGYPT_COUNTRY, governorateLabel } from "@/lib/egypt";

export type DeliveryDetails = {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  governorate: string;
  postalCode: string;
  phone: string;
  marketingOptIn: boolean;
};

export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

export function isDeliveryComplete(details: DeliveryDetails) {
  return Boolean(
    details.firstName.trim() &&
      details.lastName.trim() &&
      details.address.trim() &&
      details.city.trim() &&
      details.governorate.trim() &&
      details.phone.trim()
  );
}

export function formatDeliveryNotes(details: DeliveryDetails, locale: "ar" | "en" = "en") {
  const lines = [
    `${locale === "ar" ? "الدولة" : "Country"}: ${locale === "ar" ? "مصر" : EGYPT_COUNTRY}`,
    `${locale === "ar" ? "الاسم الأول" : "First name"}: ${details.firstName.trim()}`,
    `${locale === "ar" ? "اسم العائلة" : "Last name"}: ${details.lastName.trim()}`,
    `${locale === "ar" ? "العنوان" : "Address"}: ${details.address.trim()}`,
  ];

  if (details.apartment.trim()) {
    lines.push(`${locale === "ar" ? "الشقة / المبنى" : "Apartment"}: ${details.apartment.trim()}`);
  }

  lines.push(`${locale === "ar" ? "المدينة" : "City"}: ${details.city.trim()}`);
  lines.push(
    `${locale === "ar" ? "المحافظة" : "Governorate"}: ${governorateLabel(details.governorate, locale)}`
  );

  if (details.postalCode.trim()) {
    lines.push(`${locale === "ar" ? "الرمز البريدي" : "Postal code"}: ${details.postalCode.trim()}`);
  }

  lines.push(`${locale === "ar" ? "الهاتف" : "Phone"}: ${details.phone.trim()}`);
  lines.push(
    `${locale === "ar" ? "العروض والأخبار" : "News and offers"}: ${
      details.marketingOptIn
        ? locale === "ar"
          ? "موافق"
          : "opted in"
        : locale === "ar"
          ? "غير موافق"
          : "opted out"
    }`
  );

  return lines.join("\n");
}
