const Checkbox = (checked, onchange) =>
  m('label' +b.db.pointer.us('none'),
    m('input' +b.dn
      .$nest(':checked ~ div', b.bc('#fff'))
      .$nest(':checked ~ div:after', b.db), {
        type: 'checkbox',
        checked: checked,
        onchange: onchange
      }
    ),
    m('div' +b.size(18).bc('#f5f5f5').bo('1px solid #d2d2d2')
      .$hover(b.bo('1px solid #616161'))
      .$after(b.dn.rel.content('').pos(5,-4).size(6,15).bo('solid #008000')
        .borderWidth(0,3.4,3.4,0).transform('rotate(35deg)'))
    )
  )

export default Checkbox
