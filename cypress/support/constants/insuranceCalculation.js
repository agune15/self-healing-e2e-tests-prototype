export const INSURANCE_INPUT_DATA = {
  currentInsuranceType: 'gesetzlich versichert',
  dailySicknessAllowance: '150',
  employmentType: 'Angestellt',
  income: '100000',
  insuranceProduct: 'Vollversicherung',
  ingressDate: '2: 2024-10-01',
  isParent: true,
  monthlyPayment: '474,87',
  tariffName: 'First Class Pro+',
  birthDates: {
    invalidDate: { day: '32', month: '12', year: '2000' },
    futureDate: { day: '01', month: '01', year: '2030' },
    olderThan101: { day: '01', month: '01', year: '1919' },
    youngerThan16: { day: '01', month: '01', year: '2020' },
    validDate: { day: '01', month: '01', year: '1990' },
    childDate: { day: '01', month: '01', year: '2020' },
  },
};

export const BIRTH_DATE_ERRORS = {
  invalidDate: 'Bitte gib ein korrektes Datum ein.',
  futureDate: 'Du bist in der Zukunft geboren? Bitte überprüfe deine Eingaben.',
  olderThan101: 'Du kannst dich nur bis 101 Jahren bei uns versichern.',
  youngerThan16: 'Leider kannst du dich erst ab 16 Jahren alleine versichern.',
};
