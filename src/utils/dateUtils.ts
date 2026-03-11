export const parseDate = (dateStr: string): Date | null => {
  // Try parsing DD/MM/YYYY
  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [_, day, month, year] = slashMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Try parsing DD MONTH YYYY
  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const monthStr = parts[1].toUpperCase();
    const year = parseInt(parts[2]);

    const months: { [key: string]: number } = {
      'JAN': 0, 'JANUARY': 0,
      'FEB': 1, 'FEBRUARY': 1,
      'MAR': 2, 'MARCH': 2,
      'APR': 3, 'APRIL': 3,
      'MAY': 4,
      'JUN': 5, 'JUNE': 5,
      'JUL': 6, 'JULY': 6,
      'AUG': 7, 'AUGUST': 7,
      'SEPT': 8, 'SEP': 8, 'SEPTEMBER': 8,
      'OCT': 9, 'OCTOBER': 9,
      'NOV': 10, 'NOVEMBER': 10,
      'DEC': 11, 'DECEMBER': 11
    };

    if (months[monthStr] !== undefined) {
      return new Date(year, months[monthStr], day);
    }
  }

  return null;
};

export const isDateInRange = (checkDate: Date, rangeStr: string): boolean => {
  const parts = rangeStr.split(' TO ');
  if (parts.length !== 2) return false;

  const startDate = parseDate(parts[0].trim());
  const endDate = parseDate(parts[1].trim());

  if (!startDate || !endDate) return false;

  // Set times to midnight for comparison
  const check = new Date(checkDate);
  check.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  return check >= start && check <= end;
};
