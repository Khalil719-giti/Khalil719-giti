// utils/format.js

export function formatPersonnummer(pn) {
  const cleaned = pn.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{6})(\d{4})$/, '$1-$2');
  } else if (cleaned.length === 12) {
    return cleaned.replace(/^\d{2}(\d{6})(\d{4})$/, '$1-$2');
  }
  return pn;
}

export function formatPhoneNumber(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits.replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1-$2 $3 $4');
  }
  return phone;
}

export function formatAddress(address) {
  if (!address) return '';

  // Normalize whitespace
  let cleaned = address.replace(/\s+/g, ' ').trim();

  // Fix cases like "45117solna" or "17077Uppsala"
  const zipCityMatch = cleaned.match(/(\d{5})([a-zA-ZåäöÅÄÖ]+)/);
  if (zipCityMatch) {
    cleaned = cleaned.replace(zipCityMatch[0], `${zipCityMatch[1]} ${zipCityMatch[2]}`);
  }

  return cleaned;
}

export function validateAddress(address) {
  const formatted = formatAddress(address);
  const parts = formatted.split(' ');

  if (parts.length < 4) {
    return {
      valid: false,
      error: 'Adressen ska innehålla gatunamn, nummer, postnummer och postort.'
    };
  }

  const postcode = parts[parts.length - 2];

  if (!/^\d{5}$/.test(postcode)) {
    return {
      valid: false,
      error: 'Postnummer måste bestå av exakt 5 siffror.'
    };
  }

  return { valid: true };
}
