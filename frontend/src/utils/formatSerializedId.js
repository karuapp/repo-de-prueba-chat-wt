import { FormatMask } from './FormatMask';

// const formatSerializedId = (serializedId) => {

//   console.log('serializedId', serializedId);

//   // remove os 2 primeiros numeros
//   let teste = serializedId?.slice(2);

//   const formatMask = new FormatMask();
//   const number = serializedId?.replace('@c.us', '');

//   console.log('number', formatMask.setPhoneFormatMask(teste));
//   console.log('number', formatMask.setPhoneFormatMask(serializedId));

//   return formatMask.setPhoneFormatMask(serializedId);
// };

function formatSerializedId(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Verifica se o número começa com '55'
  let match;
  if (cleaned.startsWith('55')) {
    // Se começa com '55', faz correspondência a partir do terceiro dígito
    match = cleaned.match(/^55(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
    }
  } else {
    // Se não começa com '55', faz correspondência do número inteiro
    match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
    }
  }

  // Retorna o número não formatado se não corresponder ao padrão
  return phoneNumber;
}

export default formatSerializedId;
