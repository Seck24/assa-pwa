export const PAYS = [
  { code: '+225', flag: '🇨🇮', nom: 'Côte d\'Ivoire' },
  { code: '+223', flag: '🇲🇱', nom: 'Mali' },
  { code: '+226', flag: '🇧🇫', nom: 'Burkina Faso' },
  { code: '+221', flag: '🇸🇳', nom: 'Sénégal' },
  { code: '+228', flag: '🇹🇬', nom: 'Togo' },
  { code: '+229', flag: '🇧🇯', nom: 'Bénin' },
  { code: '+227', flag: '🇳🇪', nom: 'Niger' },
  { code: '+224', flag: '🇬🇳', nom: 'Guinée' },
  { code: '+237', flag: '🇨🇲', nom: 'Cameroun' },
  { code: '+243', flag: '🇨🇩', nom: 'RD Congo' },
  { code: '+242', flag: '🇨🇬', nom: 'Congo' },
  { code: '+241', flag: '🇬🇦', nom: 'Gabon' },
  { code: '+235', flag: '🇹🇩', nom: 'Tchad' },
  { code: '+222', flag: '🇲🇷', nom: 'Mauritanie' },
  { code: '+250', flag: '🇷🇼', nom: 'Rwanda' },
  { code: '+257', flag: '🇧🇮', nom: 'Burundi' },
  { code: '+240', flag: '🇬🇶', nom: 'Guinée Éq.' },
  { code: '+236', flag: '🇨🇫', nom: 'Centrafrique' },
]

export function buildPhone(code: string, local: string): string {
  const clean = local.replace(/\D/g, '')
  return code + (clean.startsWith('0') ? clean.slice(1) : clean)
}
