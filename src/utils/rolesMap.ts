export const rolesMap: Record<
  string,
  {
    perfect: { male: string; female: string }
    imperfect: { male: string; female: string }
  }
> = {
  author: {
    perfect: { male: 'napsal', female: 'napsala' },
    imperfect: { male: 'píše', female: 'píše' },
  },
  translate: {
    perfect: { male: 'přeložil', female: 'přeložila' },
    imperfect: { male: 'překládá', female: 'překládá' },
  },
  editor: {
    perfect: { male: 'redigoval', female: 'redigovala' },
    imperfect: { male: 'rediguje', female: 'rediguje' },
  },
  supereditor: {
    perfect: { male: 'odpovědně redigoval', female: 'odpovědně redigovala' },
    imperfect: { male: 'odpovědně rediguje', female: 'odpovědně rediguje' },
  },
  illustration: {
    perfect: { male: 'ilustroval', female: 'ilustrovala' },
    imperfect: { male: 'ilustruje', female: 'ilustruje' },
  },
  cover: {
    perfect: { male: 'obálku navrhl', female: 'obálku navrhla' },
    imperfect: { male: 'navrhuje obálky', female: 'navrhuje obálky' },
  },
  typesetting: {
    perfect: { male: 'vysázel', female: 'vysázel' },
    imperfect: { male: 'sází', female: 'sází' },
  },
  reviewer: {
    perfect: { male: 'recenzi napsal', female: 'recenzi napsala' },
    imperfect: { male: 'píše recenze', female: 'píše recenze' },
  },
  corrector: {
    perfect: { male: 'korekturu provedl', female: 'korekturu provedla' },
    imperfect: { male: 'dělá korektury', female: 'dělá korektury' },
  },
  consultation: {
    perfect: { male: 'konzultoval', female: 'konzultovala' },
    imperfect: { male: 'konzultuje', female: 'konzultuje' },
  },
}
