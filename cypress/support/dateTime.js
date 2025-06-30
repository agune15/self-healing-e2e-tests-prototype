const today = new Date();

export function getDateOfFirstDayOfTheMonthAfterNextMonth() {
  const date = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 2, 1));

  return {
    date: `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date
      .getFullYear()
      .toString()}`,
    day: date.getDate().toString().padStart(2, '0'),
    month: (date.getMonth() + 1).toString().padStart(2, '0'),
    year: date.getFullYear().toString(),
  };
}
