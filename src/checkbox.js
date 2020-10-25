const Checkbox = {
  view: ({attrs: {checked, onchange}}) =>
    m('label' +z`db; pointer; us none`, {
        onclick: e => e.stopPropagation()
      },
      m('input' +z`dn; :checked ~ div {bc #fff; :after {db}}`, {
          type: 'checkbox',
          checked,
          onchange
        }
      ),
      m('div' +z`size 18; bc #f5f5f5; bo 1 solid #d2d2d2;
        :hover {bo 1 solid #616161};
        :after {dn; rel; content ''; plt 5 -4; size 6 15; bo solid #008000; bow 0 3.4 3.4 0; transform rotate(35deg)}`
      )
    )
}

export default Checkbox
