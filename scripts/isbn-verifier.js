const isValidISBN = (isbn) => {
  isbn = isbn.match(/^\d-?\d{3}-?\d{5}-?[\dX]$/);
  if(!isbn) return false;

  isbn = isbn[0].split('')
                .filter(digit => digit !== '-')
                .map(digit => (digit === 'X')? 10: +digit);
   
  let isbnCheck = isbn.reduce((acc, digit, i) => acc + digit * (10 - i), 0);
  return isbnCheck % 11 === 0;
};
