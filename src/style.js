b.helper({
  bo : x => b.border(x), //bo = backgroundOrigin
  bl : x => b.borderLeft(x),
  br : x => b.borderRight(x), //use br, and bor for borderRadius
  bt : x => b.borderTop(x),
  bb : x => b.borderBottom(x),
  boc: x => b.borderColor(x),
  bor: x => b.borderRadius(x),

  bsi : b.boxSizing('border-box'),
  coll: b.borderCollapse('collapse'),

  db : b.d('block'),
  dg : b.d('grid'),
  dn : b.d('none'),
  dt : b.d('table'),
  dib: b.d('inline-block'),

  tac: b.ta('center'),
  tal: b.ta('left'),
  tar: b.ta('right'),

  abs: b.position('absolute'),
  rel: b.position('relative'),
  fix: b.position('fixed'),

  fw: x => b.fontWeight(x),

  of : x => b.overflow(x),
  ofx: x => b.overflowX(x),
  ofy: x => b.overflowY(x),

  lis: x => b.listStyle(x), //ls = letterSpacing
  mah: x => b.maxHeight(x), //mh
  mih: x => b.minHeight(x),
  maw: x => b.maxWidth(x),
  miw: x => b.minWidth(x),
  tra: x => b.transition(x),

  pos:  (l,t) => b.l(l).t(t || t === 0 ? t : l),
  size: (w,h) => b.w(w).h(h || h === 0 ? h : w),

  default: b.cursor('default'),
  pointer: b.cursor('pointer'),
  text:    b.cursor('text'),

  center: b.d('flex').jc('center').ai('center'),
  nowrap: b.whiteSpace('nowrap')
})

b.css({
  body:  b.m(0).p(0).ff('Open Sans, sans-serif').fs(14).c('#616161').bc('#fff'),
  a:     b.c('#349cfb').td('none').$hover(b.pointer),
  input: b.pl(14).ff('Open Sans, sans-serif').fs(14).c('#616161').bc('#fff')
          .bo('1px solid #d2d2d2').outline('none')
          .$hover(b.bo('1px solid #616161'))
          .$focus(b.bo('1px solid #349cfb'))
          .$placeholder(b.c('#acacac'))
})
