export const formatters = {
  date: (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  },
  
  dateTime: (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  },
  
  currency: (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },
  
  barcode: (barcode: string) => {
    // Formata EAN-13 para melhor legibilidade
    if (barcode.length === 13) {
      return `${barcode.slice(0, 1)} ${barcode.slice(1, 7)} ${barcode.slice(7)}`;
    }
    return barcode;
  }
};