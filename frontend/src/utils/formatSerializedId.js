import { FormatMask } from './FormatMask';

const formatSerializedId = (serializedId) => {
  const formatMask = new FormatMask();
  const number = serializedId?.replace('@c.us', '');  // Remove o sufixo @c.us

  const formattedNumber = formatMask.setPhoneFormatMask(number); 

  const finalNumber = formattedNumber?.replace('(', '').replace(')', '');  // Remove os parênteses

  return finalNumber;
};

export default formatSerializedId;
