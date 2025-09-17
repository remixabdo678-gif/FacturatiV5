export function convertNumberToWords(num: number): string {
  if (num === 0) return "Zéro dirhams";
  
  const ones = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];
  
  function convertHundreds(n: number): string {
    let currentN = n;
    let result = "";
    
    if (currentN >= 100) {
      const hundredsDigit = Math.floor(currentN / 100);
      if (hundredsDigit === 1) {
        result += "cent";
      } else {
        result += ones[hundredsDigit] + " cent";
      }
      if (currentN % 100 === 0 && hundredsDigit > 1) {
        result += "s";
      }
      currentN %= 100;
      if (currentN > 0) result += " ";
    }
    
    if (currentN >= 20) {
      const tensDigit = Math.floor(currentN / 10);
      const onesDigit = currentN % 10;
      
      if (tensDigit === 7 || tensDigit === 9) {
        result += tens[tensDigit - 1];
        if (onesDigit === 1 && tensDigit === 7) {
          result += " et " + teens[onesDigit];
        } else if (onesDigit > 0) {
          result += "-" + teens[onesDigit];
        } else if (tensDigit === 7) {
          result += "-dix";
        } else {
          result += "-dix";
        }
      } else if (tensDigit === 8) {
        result += tens[tensDigit];
        if (onesDigit === 0) {
          result += "s";
        } else {
          result += "-" + ones[onesDigit];
        }
      } else {
        result += tens[tensDigit];
        if (onesDigit === 1 && tensDigit !== 8) {
          result += " et " + ones[onesDigit];
        } else if (onesDigit > 0) {
          result += "-" + ones[onesDigit];
        }
      }
    } else if (currentN >= 10) {
      result += teens[currentN - 10];
    } else if (currentN > 0) {
      result += ones[currentN];
    }
    
    return result;
  }
  
  let integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = "";
  
  if (integerPart >= 1000000) {
    const millions = Math.floor(integerPart / 1000000);
    result += convertHundreds(millions);
    if (millions === 1) {
      result += " million";
    } else {
      result += " millions";
    }
    integerPart %= 1000000;
    if (integerPart > 0) result += " ";
  }
  
  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    if (thousands === 1) {
      result += "mille";
    } else {
      result += convertHundreds(thousands) + " mille";
    }
    integerPart %= 1000;
    if (integerPart > 0) result += " ";
  }
  
  if (integerPart > 0) {
    result += convertHundreds(integerPart);
  }
  
  if (result === "") result = "zéro";
  
  result += " dirham";
  if (Math.floor(num) !== 1) result += "s";
  
  if (decimalPart > 0) {
    result += " et " + convertHundreds(decimalPart) + " centime";
    if (decimalPart !== 1) result += "s";
  }
  
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Export pour utilisation dans les templates
export { convertNumberToWords as default };