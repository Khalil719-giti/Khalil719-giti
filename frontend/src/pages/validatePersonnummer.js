// validatePersonnummer.js

export function isValidFormat(pn) {
  return /^\d{6}[- ]?\d{4}$|^\d{8}[- ]?\d{4}$/.test(pn);
}

export function isValidDate(yyMMdd) {
  const year = parseInt(yyMMdd.slice(0, 2), 10);
  const month = parseInt(yyMMdd.slice(2, 4), 10);
  const day = parseInt(yyMMdd.slice(4, 6), 10);
  const fullYear = year + (year < 50 ? 2000 : 1900);
  const date = new Date(fullYear, month - 1, day);
  return date.getFullYear() === fullYear && date.getMonth() === month - 1 && date.getDate() === day;
}

export function luhnCheck(num) {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let n = parseInt(num[i], 10);
    if (i % 2 === 0) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function validatePersonnummer(pn) {
  const cleanPn = pn.replace(/[- ]/g, '');
  const base = cleanPn.length === 12 ? cleanPn.slice(2, 10) : cleanPn.slice(0, 6);
  const full10 = cleanPn.length === 12 ? cleanPn.slice(2) : cleanPn;

  if (!isValidFormat(pn)) {
    return { valid: false, error: 'Ogiltigt format' };
  }

  if (!isValidDate(base)) {
    return { valid: false, error: 'Ogiltigt födelsedatum i personnummer' };
  }

  if (!luhnCheck(full10)) {
    return { valid: false, error: 'Luhn-kontrollen misslyckades' };
  }

  return { valid: true };
}

export function validateSamordningsnummer(pn) {
  const cleanPn = pn.replace(/[- ]/g, '');
  const base = cleanPn.length === 12 ? cleanPn.slice(2, 10) : cleanPn.slice(0, 6);
  const day = parseInt(base.slice(4, 6), 10);

  if (!isValidFormat(pn)) {
    return { valid: false, error: 'Ogiltigt format' };
  }

  if (day < 61 || day > 91) {
    return { valid: false, error: 'Ogiltigt samordningsnummer: dag måste vara 61-91' };
  }

  return { valid: true };
}

// ✅ Format as YYMMDD-XXXX or YYYYMMDD-XXXX
export function formatPersonnummer(pn) {
  const cleaned = pn.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{6})(\d{4})$/, '$1-$2');
  } else if (cleaned.length === 12) {
    return cleaned.replace(/^\d{2}(\d{6})(\d{4})$/, '$1-$2');
  }
  return pn;
}

// ✅ Format phone as 070-123 45 67
export function formatPhoneNumber(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits.replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1-$2 $3 $4');
  }
  return phone;
}

// ✅ Normalize address string
export function formatAddress(address) {
  return address.replace(/\s{2,}/g, ' ').trim();
}
