// z.setDebug(true)
z.helper({
  f :  `float`, //Edge translates f to font
  bo:  `border`, //bo = backgroundOrigin
  bl:  `border-left`,
  br:  `border-right`, //use br, and bor for borderRadius
  bt:  `border-top`,
  bb:  `border-bottom`,
  boc: `border-color`,
  bow: `border-width`,
  bor: `border-radius`,
  boh: (...x) => `border-top ${x.join(' ')}; border-bottom ${x.join(' ')}`,
  bov: (...x) => `border-left ${x.join(' ')}; border-right ${x.join(' ')}`,

  coll: `border-collapse collapse`,

  db : `d block`,
  df : `d flex`,
  dg : `d grid`,
  di : `d inline`, //default
  dn : `d none`,
  ds : `d subgrid`,
  dt : `d table`,
  dib: `d inline-block`,

  tac: `ta center`,
  tal: `ta left`,
  tar: `ta right`,

  lh : x => `line-height ${x}px`,
  lhn: `line-height normal`,

  abs: `position absolute`,
  rel: `position relative`,
  fix: `position fixed`,

  mb : `margin-bottom`,
  ml : `margin-left`,
  mr : `margin-right`,
  mt : `margin-top`,
  pb : `padding-bottom`,
  pl : `padding-left`,
  pr : `padding-right`,
  pt : `padding-top`,

  fw : `font-weight`,
  
  of : `overflow`,
  ofx: `overflow-x`,
  ofy: `overflow-y`,

  bsi: `box-sizing border-box`,
  cur: `cursor`,
  lis: `list-style`, //ls = letterSpacing
  mah: `max-height`, //mh
  mih: `min-height`,
  maw: `max-width`,
  miw: `min-width`,
  tes: `text-shadow`, // ts = tabsize => tes
  tra: `transition`,

  plt: (l, t=l) => `l ${l}; t ${t}`,
  prt: (r, t=r) => `r ${r}; t ${t}`,
  plb: (l, b=l) => `l ${l}; b ${b}`,
  prb: (r, b=r) => `r ${r}; b ${b}`,

  size: (w, h=w) => `w ${w}; h ${h}`,

  default: `cursor default`,
  pointer: `cursor pointer`,
  text   : `cursor text`,

  shadow : `box-shadow 0 2 5 0 rgba(0,0,0,0.4)`,

  center: `d flex; jc center; ai center`,
  nowrap: `ws nowrap`
})

z.global`
  html, body {m 0; p 0; ff Open Sans, sans-serif; fs 14; c #616161; bc #fff}
  a          {c #349cfb; td none; pointer}
  input      {bsi; pl 14; ff Open Sans, sans-serif; fs 14;
              c #616161; bc #fff; bo 1 solid #d2d2d2; outline none;
              :hover        {bo 1 solid #616161}
              :focus        {bo 1 solid #349cfb}
              ::placeholder {c #acacac}
             }
`